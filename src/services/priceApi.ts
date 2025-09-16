export interface KrakenTickerResponse {
  error: string[];
  result: {
    XXBTZUSD: {
      c: [string, string]; // last trade closed [price, lot volume]
    };
  };
}

export class PriceApiError extends Error {
  public status?: number;
  constructor(message: string, status?: number) {
    super(message);
    this.name = 'PriceApiError';
    this.status = status;
  }
}

class PriceApi {
  private baseUrl = 'https://api.kraken.com/0/public';

  async getBtcUsdPrice(): Promise<number> {
    try {
      const response = await fetch(`${this.baseUrl}/Ticker?pair=XBTUSD`);
      
      if (!response.ok) {
        throw new PriceApiError(`HTTP ${response.status}: ${response.statusText}`, response.status);
      }

      const data: KrakenTickerResponse = await response.json();
      
      if (data.error && data.error.length > 0) {
        throw new PriceApiError(`Kraken API Error: ${data.error.join(', ')}`);
      }

      const lastPrice = parseFloat(data.result.XXBTZUSD.c[0]);
      return lastPrice;
    } catch (error) {
      if (error instanceof PriceApiError) throw error;
      throw new PriceApiError(`Failed to fetch Bitcoin price: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}

export const priceApi = new PriceApi();

// Caching for price requests
let priceCache: { price: number; timestamp: number } | null = null;
const CACHE_DURATION = 60 * 1000; // 1 minute

export async function getCurrentBtcPrice(): Promise<number> {
  const now = Date.now();
  
  if (priceCache && (now - priceCache.timestamp) < CACHE_DURATION) {
    return priceCache.price;
  }
  
  const price = await priceApi.getBtcUsdPrice();
  priceCache = { price, timestamp: now };
  return price;
}

export async function convertUsdToSats(usdAmount: number): Promise<number> {
  const btcPrice = await getCurrentBtcPrice();
  const btcAmount = usdAmount / btcPrice;
  return Math.round(btcAmount * 100_000_000);
}
