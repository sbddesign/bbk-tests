exports.handler = async (event, context) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  };

  // Handle preflight requests
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      headers,
      body: JSON.stringify({ error: 'Method not allowed' }),
    };
  }

  try {
    const { amount_sats, memo } = JSON.parse(event.body);

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
      `https://api.voltage.cloud/v1/orgs/${orgId}/envs/${envId}/wallets/${walletId}/invoices`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount_sats: amount_sats,
          memo: memo || 'Bitcoin Tip Jar Payment',
          expiry: 3600, // 1 hour expiry
        }),
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

    const invoiceData = await voltageResponse.json();

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        payment_request: invoiceData.payment_request,
        r_hash: invoiceData.r_hash,
      }),
    };
  } catch (error) {
    console.error('Error creating invoice:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({
        error: 'Internal server error',
      }),
    };
  }
};

