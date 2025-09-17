exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'GET') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { r_hash } = event.queryStringParameters || {};

    if (!r_hash) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ error: 'Missing r_hash parameter' }),
      };
    }

    // Get environment variables
    const apiKey = process.env.VITE_VOLTAGE_API_KEY;
    const orgId = process.env.VITE_VOLTAGE_ORG_ID;
    const envId = process.env.VITE_VOLTAGE_ENV_ID;
    const walletId = process.env.VITE_VOLTAGE_WALLET_ID;

    if (!apiKey || !orgId || !envId || !walletId) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ 
          error: 'Missing Voltage API configuration' 
        }),
      };
    }

    // Make request to Voltage API
    const voltageResponse = await fetch(
      `https://api.voltage.cloud/v1/orgs/${orgId}/envs/${envId}/wallets/${walletId}/invoices/${r_hash}`,
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
        },
      }
    );

    if (!voltageResponse.ok) {
      const errorData = await voltageResponse.json().catch(() => ({}));
      return {
        statusCode: voltageResponse.status,
        headers,
        body: JSON.stringify({
          error: errorData.message || `Voltage API error: ${voltageResponse.status}`,
        }),
      };
    }

    const statusData = await voltageResponse.json();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        state: statusData.state,
        settled: statusData.state === 'SETTLED',
      }),
    };
  } catch (error) {
    console.error('Error checking invoice:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
      }),
    };
  }
};

