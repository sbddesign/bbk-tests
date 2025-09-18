export interface CreateInvoiceRequest {
  amountSats: number
  memo?: string
}

export interface CreateInvoiceResponse {
  payment_request?: string
  invoice?: string
  [key: string]: unknown
}

export async function createInvoice(req: CreateInvoiceRequest): Promise<CreateInvoiceResponse> {
  // Use the direct Netlify functions path to work in both local (netlify dev)
  // and production. A redirect exists too, but this avoids mismatch when not using the proxy.
  const resp = await fetch('/.netlify/functions/create-invoice', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(req),
  })
  if (!resp.ok) {
    const text = await resp.text()
    throw new Error(text || 'Failed to create invoice')
  }
  return resp.json()
}


