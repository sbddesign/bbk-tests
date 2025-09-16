import type { Handler } from '@netlify/functions';

export const handler: Handler = async (event) => {
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return { statusCode: 200, headers, body: '' };
  }

  try {
    const VOLTAGE_API_KEY = process.env.VOLTAGE_API_KEY;
    const VOLTAGE_ORG_ID = process.env.VOLTAGE_ORG_ID;
    const VOLTAGE_ENV_ID = process.env.VOLTAGE_ENV_ID;
    const VOLTAGE_WALLET_ID = process.env.VOLTAGE_WALLET_ID;

    if (!VOLTAGE_API_KEY || !VOLTAGE_ORG_ID || !VOLTAGE_ENV_ID) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Voltage API configuration missing' }),
      };
    }

    if (event.httpMethod === 'GET') {
      const url = new URL(event.rawUrl);
      const paymentId = url.searchParams.get('id');
      
      if (!paymentId) {
        return { statusCode: 400, headers, body: JSON.stringify({ error: 'Missing payment id' }) };
      }

      const response = await fetch(
        `https://voltageapi.com/v1/organizations/${VOLTAGE_ORG_ID}/environments/${VOLTAGE_ENV_ID}/payments/${paymentId}`,
        {
          method: 'GET',
          headers: { 'Content-Type': 'application/json', 'x-api-key': VOLTAGE_API_KEY },
        }
      );

      if (!response.ok) {
        return { statusCode: response.status, headers, body: JSON.stringify({ error: 'Voltage API Error' }) };
      }

      const payment = await response.json();
      return { statusCode: 200, headers, body: JSON.stringify(payment) };
    }

    if (event.httpMethod === 'POST') {
      const paymentRequest = JSON.parse(event.body || '{}');
      
      if (VOLTAGE_WALLET_ID) {
        paymentRequest.wallet_id = VOLTAGE_WALLET_ID;
      }

      const response = await fetch(
        `https://voltageapi.com/v1/organizations/${VOLTAGE_ORG_ID}/environments/${VOLTAGE_ENV_ID}/payments`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': VOLTAGE_API_KEY,
            'Idempotency-Key': paymentRequest.id
          },
          body: JSON.stringify(paymentRequest),
        }
      );

      if (!response.ok) {
        return { statusCode: response.status, headers, body: JSON.stringify({ error: 'Voltage API Error' }) };
      }

      return { statusCode: 202, headers, body: JSON.stringify({ success: true }) };
    }

    return { statusCode: 405, headers, body: JSON.stringify({ error: 'Method not allowed' }) };
  } catch (error) {
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ error: 'Internal server error' }),
    };
  }
};
