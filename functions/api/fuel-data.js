// Cloudflare Pages Function - API endpoint for fuel data
// This runs server-side, so no CORS issues!

// Simple ZIP extraction function
function extractZip(zipData) {
  const data = new Uint8Array(zipData);
  
  // Find the local file header (0x04034b50)
  let offset = 0;
  for (let i = 0; i < data.length - 4; i++) {
    if (data[i] === 0x50 && data[i+1] === 0x4b && data[i+2] === 0x03 && data[i+3] === 0x04) {
      offset = i;
      break;
    }
  }
  
  if (offset === 0 && !(data[0] === 0x50 && data[1] === 0x4b)) {
    throw new Error('Not a valid ZIP file');
  }
  
  // Read header fields
  const fileNameLength = data[offset + 26] | (data[offset + 27] << 8);
  const extraFieldLength = data[offset + 28] | (data[offset + 29] << 8);
  const compressionMethod = data[offset + 8] | (data[offset + 9] << 8);
  const compressedSize = data[offset + 18] | (data[offset + 19] << 8) | (data[offset + 20] << 16) | (data[offset + 21] << 24);
  
  // Start of compressed data
  const dataStart = offset + 30 + fileNameLength + extraFieldLength;
  const compressedData = data.slice(dataStart, dataStart + compressedSize);
  
  // If stored (no compression)
  if (compressionMethod === 0) {
    return new TextDecoder('utf-8').decode(compressedData);
  }
  
  // If deflated (compression method 8)
  if (compressionMethod === 8) {
    // Use DecompressionStream (available in Cloudflare Workers)
    const stream = new Blob([compressedData]).stream();
    return stream.pipeThrough(new DecompressionStream('deflate-raw'));
  }
  
  throw new Error(`Unsupported compression method: ${compressionMethod}`);
}

export async function onRequest(context) {
  // Handle OPTIONS for CORS preflight
  if (context.request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      }
    });
  }

  try {
    console.log('Fetching data from French government API...');
    
    // Fetch data from French government API (server-side)
    const apiResponse = await fetch('https://donnees.roulez-eco.fr/opendata/instantane', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/zip, application/xml, text/xml, */*',
        'Accept-Encoding': 'gzip, deflate, br'
      }
    });

    console.log(`Government API response status: ${apiResponse.status}`);
    console.log(`Content-Type: ${apiResponse.headers.get('content-type')}`);

    if (!apiResponse.ok) {
      console.error(`API error: ${apiResponse.status} ${apiResponse.statusText}`);
      return new Response(JSON.stringify({ 
        error: 'Failed to fetch data from government API',
        status: apiResponse.status,
        statusText: apiResponse.statusText
      }), {
        status: 502,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      });
    }

    // Get the response as bytes
    const responseData = await apiResponse.arrayBuffer();
    console.log(`Received ${responseData.byteLength} bytes`);
    
    // Check if it's a ZIP file (starts with "PK")
    const dataView = new Uint8Array(responseData);
    const isZip = dataView[0] === 0x50 && dataView[1] === 0x4B; // "PK"
    
    let xmlData;
    
    if (isZip) {
      console.log('Response is ZIP format, extracting...');
      
      try {
        // Extract ZIP file
        const result = extractZip(responseData);
        
        // If it's a stream (deflate compressed), convert to text
        if (result instanceof ReadableStream) {
          xmlData = await new Response(result).text();
        } else {
          xmlData = result;
        }
        
        console.log(`Extracted ${xmlData.length} characters from ZIP`);
        
      } catch (e) {
        console.error('ZIP extraction failed:', e);
        return new Response(JSON.stringify({ 
          error: 'Failed to extract ZIP file',
          message: e.message,
          info: 'The compressed data could not be extracted'
        }), {
          status: 500,
          headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*',
          }
        });
      }
    } else {
      // It's plain XML
      xmlData = new TextDecoder('utf-8').decode(responseData);
    }
    
    console.log(`Extracted ${xmlData.length} characters of XML data`);
    
    // Verify we got XML data
    if (!xmlData || xmlData.length < 100) {
      console.error('Received empty or very short response');
      return new Response(JSON.stringify({ 
        error: 'Invalid data received from government API',
        length: xmlData ? xmlData.length : 0
      }), {
        status: 502,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      });
    }
    
    // Check if it's actually XML
    if (!xmlData.includes('<?xml') && !xmlData.includes('<pdv_liste')) {
      console.error('Response is not XML format');
      console.error('First 500 chars:', xmlData.substring(0, 500));
      return new Response(JSON.stringify({ 
        error: 'Government API returned non-XML data',
        preview: xmlData.substring(0, 500)
      }), {
        status: 502,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
        }
      });
    }

    console.log('Successfully extracted and validated XML data');

    // Return XML data with CORS headers
    return new Response(xmlData, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Cache-Control': 'public, max-age=300' // Cache for 5 minutes
      }
    });

  } catch (error) {
    console.error('Error in serverless function:', error);
    return new Response(JSON.stringify({ 
      error: 'Server error',
      message: error.message,
      stack: error.stack
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}
