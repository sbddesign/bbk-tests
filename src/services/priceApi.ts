// Kraken API service for fetching Bitcoin prices

export interface KrakenTickerResponse {
  error: string[]
  result: {
    XXBTZUSD: {
      a: [string, string, string] // ask [price, whole lot volume, lot volume]
      b: [string, string, string] // bid [price, whole lot volume, lot volume]
      c: [string, string] // last trade closed [price, lot volume]
      v: [string, string] // volume [today, last 24 hours]
      p: [string, string] // volume weighted average price [today, last 24 hours]
      t: [number, number] // number of trades [today, last 24 hours]
      l: [string, string] // low [today, last 24 hours]
      h: [string, string] // high [today, last 24 hours]
      o: string // today’s opening price
    }
  }
}

export async function fetchBtcUsd(): Promise<number> {
  const url = 'https://api.kraken.com/0/public/Ticker?pair=XBTUSD'
  const res = await fetch(url)
  if (!res.ok) throw new Error('Failed to fetch BTC price')
  const data: KrakenTickerResponse = await res.json()
  const last = data.result.XXBTZUSD.c[0]
  const price = Number(last)
  if (!Number.isFinite(price)) throw new Error('Invalid price from Kraken')
  return price
}

// Convert USD amount to sats using price (USD per BTC)
export function usdToSats(usdAmount: number, btcUsdPrice: number): number {
  if (btcUsdPrice <= 0) return 0
  const btc = usdAmount / btcUsdPrice
  const sats = Math.floor(btc * 100_000_000)
  return sats
}


