const { Handler } = require('@netlify/functions');

exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method not allowed' })
    };
  }

  try {
    const { paymentHash } = JSON.parse(event.body);
    
    // Get environment variables
    const apiKey = process.env.VITE_VOLTAGE_API_KEY;
    const orgId = process.env.VITE_VOLTAGE_ORG_ID;
    const envId = process.env.VITE_VOLTAGE_ENV_ID;
    const walletId = process.env.VITE_VOLTAGE_WALLET_ID;

    if (!apiKey || !orgId || !envId || !walletId) {
      return {
        statusCode: 400,
        body: JSON.stringify({ 
          error: 'Voltage API credentials not configured' 
        })
      };
    }

    // Check payment status
    const statusResponse = await fetch('https://api.voltage.cloud/v1/payments/status', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
      body: JSON.stringify({
        payment_hash: paymentHash,
        org_id: orgId,
        env_id: envId,
        wallet_id: walletId,
      }),
    });

    if (!statusResponse.ok) {
      const errorData = await statusResponse.json().catch(() => ({}));
      throw new Error(`Status check failed: ${errorData.message || statusResponse.statusText}`);
    }

    const statusData = await statusResponse.json();

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: JSON.stringify({
        paid: statusData.paid,
        amount: statusData.amount,
      })
    };

  } catch (error) {
    console.error('Payment status check error:', error);
    return {
      statusCode: 500,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: JSON.stringify({ 
        error: error.message || 'Internal server error' 
      })
    };
  }
};
