// Netlify Function: create-invoice
// Receives amount in sats, memo, and calls Voltage Payments API to create a real BOLT11 invoice.

import type { Handler } from '@netlify/functions'

const VOLTAGE_API_URL = process.env.VOLTAGE_API_URL || ''
const VOLTAGE_API_KEY = process.env.VOLTAGE_API_KEY || ''
const VOLTAGE_ORG_ID = process.env.VOLTAGE_ORG_ID || ''
const VOLTAGE_ENV_ID = process.env.VOLTAGE_ENV_ID || ''
const VOLTAGE_WALLET_ID = process.env.VOLTAGE_WALLET_ID || ''

// Note: Voltage Payments API specifics should be verified in official docs.
// This function assumes a RESTful endpoint with bearer auth. If Voltage uses GraphQL
// or different fields, adjust the request shape accordingly.

export const handler: Handler = async (event) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' }
  }

  try {
    if (!VOLTAGE_API_URL || !VOLTAGE_API_KEY || !VOLTAGE_ORG_ID || !VOLTAGE_ENV_ID || !VOLTAGE_WALLET_ID) {
      return { statusCode: 500, body: 'Missing Voltage environment configuration' }
    }

    const body = JSON.parse(event.body || '{}') as { amountSats?: number; memo?: string }
    const amountSats = Number(body.amountSats)
    const memo = String(body.memo || 'Improv tip')
    if (!Number.isFinite(amountSats) || amountSats <= 0) {
      return { statusCode: 400, body: 'Invalid amountSats' }
    }

    // Example payload. Replace with the exact Voltage Payments API requirements.
    const payload = {
      organization_id: VOLTAGE_ORG_ID,
      environment_id: VOLTAGE_ENV_ID,
      payment: {
        wallet_id: VOLTAGE_WALLET_ID,
        currency: 'btc',
        amount_msats: amountSats * 1000,
        payment_kind: 'bolt11',
        description: memo,
      },
    }

    const resp = await fetch(`${VOLTAGE_API_URL}/payment-requests`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${VOLTAGE_API_KEY}`,
      },
      body: JSON.stringify(payload),
    })

    if (!resp.ok) {
      const text = await resp.text()
      return { statusCode: resp.status, body: text }
    }

    const data = await resp.json()
    // Expect data.payment_request or similar; return as-is
    return {
      statusCode: 200,
      body: JSON.stringify(data),
      headers: { 'Content-Type': 'application/json' },
    }
  } catch (err: unknown) {
    return { statusCode: 500, body: (err as Error).message }
  }
}


