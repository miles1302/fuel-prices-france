// Cloudflare Pages Function - API endpoint for fuel data
// This runs server-side, so no CORS issues!

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
    const response = await fetch('https://donnees.roulez-eco.fr/opendata/instantane', {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'application/xml, text/xml, */*'
      },
      cf: {
        cacheTtl: 300, // Cache for 5 minutes on Cloudflare edge
        cacheEverything: true
      }
    });

    console.log(`Government API response status: ${response.status}`);

    if (!response.ok) {
      return new Response(JSON.stringify({ 
        error: 'Failed to fetch data from government API',
        status: response.status,
        statusText: response.statusText
      }), {
        status: response.status,
        headers: {
          'Content-Type': 'application/json',
          'Access-Control-Allow-Origin': '*',
          'Cache-Control': 'no-cache'
        }
      });
    }

    const xmlData = await response.text();
    console.log(`Successfully fetched ${xmlData.length} bytes of XML data`);

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
