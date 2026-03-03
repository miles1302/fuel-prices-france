// Cloudflare Pages Function - API endpoint for fuel data
// This runs server-side, so no CORS issues!

import { unzipSync, strFromU8 } from 'fflate';

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
        // Unzip the file using fflate
        const uint8Array = new Uint8Array(responseData);
        const unzipped = unzipSync(uint8Array);
        
        // The ZIP should contain one XML file
        // Get the first (and likely only) file from the archive
        const fileNames = Object.keys(unzipped);
        console.log('Files in ZIP:', fileNames);
        
        if (fileNames.length === 0) {
          throw new Error('ZIP archive is empty');
        }
        
        // Get the first XML file
        const xmlFileName = fileNames.find(name => name.toLowerCase().endsWith('.xml')) || fileNames[0];
        console.log('Extracting file:', xmlFileName);
        
        // Convert the file data to text
        xmlData = strFromU8(unzipped[xmlFileName]);
        console.log(`Extracted ${xmlData.length} characters from ${xmlFileName}`);
        
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
