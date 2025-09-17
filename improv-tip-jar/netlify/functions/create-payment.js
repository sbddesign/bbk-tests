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
    const { amount, description } = JSON.parse(event.body);
    
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

    // Create Lightning invoice
    const invoiceResponse = await fetch('https://api.voltage.cloud/v1/payments/create-invoice', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
      body: JSON.stringify({
        amount: amount,
        description: description || 'Improv Comedy Tip',
        org_id: orgId,
        env_id: envId,
        wallet_id: walletId,
      }),
    });

    if (!invoiceResponse.ok) {
      const errorData = await invoiceResponse.json().catch(() => ({}));
      throw new Error(`Invoice creation failed: ${errorData.message || invoiceResponse.statusText}`);
    }

    const invoiceData = await invoiceResponse.json();

    // Get onchain address
    const addressResponse = await fetch('https://api.voltage.cloud/v1/wallets/address', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': apiKey,
      },
      body: JSON.stringify({
        org_id: orgId,
        env_id: envId,
        wallet_id: walletId,
      }),
    });

    if (!addressResponse.ok) {
      const errorData = await addressResponse.json().catch(() => ({}));
      throw new Error(`Address creation failed: ${errorData.message || addressResponse.statusText}`);
    }

    const addressData = await addressResponse.json();

    return {
      statusCode: 200,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Headers': 'Content-Type',
        'Access-Control-Allow-Methods': 'POST, OPTIONS',
      },
      body: JSON.stringify({
        lightningInvoice: invoiceData.payment_request,
        onchainAddress: addressData.address,
        paymentHash: invoiceData.payment_hash,
      })
    };

  } catch (error) {
    console.error('Payment creation error:', error);
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
