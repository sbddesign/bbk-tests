# Building a Bitcoin Lightning Tip Jar

This tutorial walks through building a Bitcoin Lightning Network tip jar using Vite, TypeScript, React, and the Bitcoin Builder Kit UI components.

## Prerequisites

- Node.js 18+ and pnpm
- Netlify CLI (`npm install -g netlify-cli`)
- Voltage Payments API account
- Kraken API access (free)

## Step 1: Establish Vite + TypeScript + React Project

```bash
# Create new Vite project
npm create vite@latest btc-tip-jar -- --template react-ts
cd btc-tip-jar

# Install pnpm and dependencies
npm install -g pnpm
pnpm install

# Install Bitcoin Builder Kit
pnpm add @sbddesign/bui-ui @sbddesign/bui-tokens @sbddesign/bui-icons

# Install additional dependencies
pnpm add @netlify/functions uuid tailwindcss @tailwindcss/vite
pnpm add -D @types/uuid netlify-cli
```

### Check your step 1 work

Run `pnpm dev`. You should find a web page at http://localhost:5173 that says "Vite + React" in the heading. If so, you have completed step 1.

## Step 2: Configure Vite and TypeScript

Update `vite.config.ts`:
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    proxy: {
      '/api/voltage': {
        target: 'https://voltageapi.com/v1',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/voltage/, ''),
        headers: { 'Access-Control-Allow-Origin': '*' }
      }
    }
  }
})
```

Update `package.json` scripts:
```json
{
  "scripts": {
    "dev": "netlify dev",
    "dev:vite": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview"
  }
}
```

### Check your step 2 work

Run `pnpm dev`. You should find a web page at http://localhost:8888 that says "Vite + React" in the heading. If so, you have completed step 1.

## Step 3: Set Up Netlify Configuration

Create `netlify.toml`:
```toml
[build]
  command = "npm run build"
  publish = "dist"

[functions]
  directory = "netlify/functions"

[[redirects]]
  from = "/api/voltage-payments"
  to = "/.netlify/functions/voltage-payments"
  status = 200

[build.environment]
  NODE_VERSION = "18"

[dev]
  command = "pnpm dev:vite"
  targetPort = 5173
```

### Check your step 3 work

If the netlify.toml file exists and contains the above text, then step 3 is complete.

## Step 4: Build the UI with Bitcoin Builder Kit

Open `src/App.tsx` and repalce it's contents with this code block:
```typescript
import { useState, useEffect } from 'react'
import { 
  BuiAmountOptionTileReact as BuiAmountOptionTile,
  BuiButtonReact as BuiButton,
  BuiNumpadReact as BuiNumpad
} from '@sbddesign/bui-ui/react'
import '@sbddesign/bui-ui/tokens.css'
import { getCurrentBtcPrice, convertUsdToSats } from './services/priceApi'

interface TipOption {
  id: number;
  primaryAmount: number;
  secondaryAmount: number;
  emoji: string;
  message: string;
  selected: boolean;
}

const baseTipOptions = [
  { id: 1, primaryAmount: 10, emoji: '🧡', message: 'Super', selected: false },
  { id: 2, primaryAmount: 20, emoji: '🎉', message: 'Amazing', selected: false },
  { id: 3, primaryAmount: 50, emoji: '🔥', message: 'Incredible', selected: false }
]

function App() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [tipOptionsState, setTipOptionsState] = useState<TipOption[]>([])
  const [isLoadingPrices, setIsLoadingPrices] = useState(true)

  useEffect(() => {
    const loadPrices = async () => {
      try {
        setIsLoadingPrices(true)
        const btcPrice = await getCurrentBtcPrice()
        
        const tipOptionsWithSats: TipOption[] = baseTipOptions.map(option => {
          const btcAmount = option.primaryAmount / btcPrice
          const satoshis = Math.round(btcAmount * 100_000_000)
          return { ...option, secondaryAmount: satoshis }
        })
        
        setTipOptionsState(tipOptionsWithSats)
      } catch (error) {
        console.error('Failed to load Bitcoin price:', error)
        // Use fallback prices
        const fallbackOptions: TipOption[] = baseTipOptions.map(option => ({
          ...option,
          secondaryAmount: Math.round(option.primaryAmount * 1500)
        }))
        setTipOptionsState(fallbackOptions)
      } finally {
        setIsLoadingPrices(false)
      }
    }
    loadPrices()
  }, [])

  const handleAmountSelect = (amount: number) => {
    setSelectedAmount(amount)
    setTipOptionsState(prev => 
      prev.map(option => ({
        ...option,
        selected: option.primaryAmount === amount
      }))
    )
  }

  return (
    <div className="text-center flex flex-col gap-8 p-6">
      <header className="flex flex-col gap-4">
        <h1 className="text-3xl">Send us a tip</h1>
      </header>

      {isLoadingPrices ? (
        <div className="flex flex-col items-center gap-4 py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600"></div>
          <p>Loading Bitcoin prices...</p>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6 max-w-4xl mx-auto">
          {tipOptionsState.map((option) => (
            <BuiAmountOptionTile
              key={option.id}
              emoji={option.emoji}
              message={option.message}
              showEmoji={true}
              showMessage={true}
              showSecondaryCurrency={true}
              selected={option.selected}
              primaryAmount={option.primaryAmount}
              primarySymbol={'$'}
              secondaryAmount={option.secondaryAmount}
              secondarySymbol={'₿'}
              showEstimate={true}
              primaryTextSize="6xl"
              secondaryTextSize="2xl"
              onClick={() => handleAmountSelect(option.primaryAmount)}
            />
          ))}
        </div>
      )}

      <BuiButton
        styleType="filled"
        size="large"
        label="Continue"
        disabled={!selectedAmount ? "true" : ""}
        onClick={() => console.log('Continue clicked')}
      />
    </div>
  )
}

export default App
```

## Step 5: Add Bitcoin Price Integration

Create `src/services/priceApi.ts`:
```typescript
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
```

## Step 6: Integrate Voltage Payments API

Create `src/config/voltage.ts`:
```typescript
const IS_DEV = import.meta.env.DEV;

export const voltageConfig = {
  apiKey: IS_DEV ? import.meta.env.VITE_VOLTAGE_API_KEY : undefined,
  orgId: IS_DEV ? import.meta.env.VITE_VOLTAGE_ORG_ID : undefined,
  envId: IS_DEV ? import.meta.env.VITE_VOLTAGE_ENV_ID : undefined,
  walletId: IS_DEV ? import.meta.env.VITE_VOLTAGE_WALLET_ID : undefined,
  baseUrl: IS_DEV ? '/api/voltage' : 'https://voltageapi.com/v1'
};

export function isVoltageConfigured(): boolean {
  if (IS_DEV) {
    return !!(voltageConfig.apiKey && voltageConfig.orgId && voltageConfig.envId && voltageConfig.walletId);
  }
  return true;
}
```

Create `src/services/voltageApi.ts`:
```typescript
import { voltageConfig } from '../config/voltage';
import { v4 as uuidv4 } from 'uuid';
import { convertUsdToSats } from './priceApi';

export interface CreateReceivePaymentRequest {
  id: string;
  payment_kind: 'bolt11' | 'onchain' | 'bip21';
  wallet_id: string;
  amount_msats: number;
  currency: 'btc' | 'usd';
  description?: string;
}

export interface PaymentData {
  amount_msats: number;
  payment_request: string; // Lightning invoice
}

export interface Payment {
  id: string;
  data: PaymentData;
  status: 'receiving' | 'completed' | 'failed' | 'pending' | 'expired';
}

export class VoltageApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'VoltageApiError';
  }
}

class VoltageApi {
  async createPayment(request: CreateReceivePaymentRequest): Promise<void> {
    const response = await fetch('/api/voltage-payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new VoltageApiError(`HTTP ${response.status}: ${response.statusText}`, response.status);
    }
  }

  async getPayment(paymentId: string): Promise<Payment> {
    const response = await fetch(`/api/voltage-payments?id=${encodeURIComponent(paymentId)}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new VoltageApiError(`HTTP ${response.status}: ${response.statusText}`, response.status);
    }

    return await response.json();
  }
}

export const voltageApi = new VoltageApi();

export async function createTipPaymentMethods(
  amountUsd: number,
  description: string = 'Bitcoin Tip'
): Promise<{ lightningInvoice?: string; payment: Payment }> {
  if (!Number.isFinite(amountUsd) || amountUsd <= 0) {
    throw new VoltageApiError('Amount must be a positive number');
  }

  const amountSats = await convertUsdToSats(amountUsd);
  const amountMsats = amountSats * 1000;
  const paymentId = uuidv4();
  
  const paymentRequest: CreateReceivePaymentRequest = {
    id: paymentId,
    payment_kind: 'bolt11',
    wallet_id: import.meta.env.DEV ? (voltageConfig.walletId as string) : 'server',
    amount_msats: amountMsats,
    currency: 'btc',
    description,
  };

  await voltageApi.createPayment(paymentRequest);
  
  // Poll for payment data
  let attempts = 0;
  while (attempts < 30) {
    const payment = await voltageApi.getPayment(paymentId);
    if (payment.data && payment.data.payment_request) {
      return {
        lightningInvoice: payment.data.payment_request,
        payment
      };
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
    attempts++;
  }
  
  throw new VoltageApiError('Payment data not ready after maximum attempts');
}
```

## Step 7: Create Netlify Function

Create `netlify/functions/voltage-payments.ts`:
```typescript
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
```

## Step 8: Environment Variables

Create `.env.local` for development:
```env
VITE_VOLTAGE_API_KEY=your_voltage_api_key
VITE_VOLTAGE_ORG_ID=your_org_id
VITE_VOLTAGE_ENV_ID=your_env_id
VITE_VOLTAGE_WALLET_ID=your_wallet_id
VITE_TIP_JAR_NAME=Your Name
VITE_TIP_JAR_SLOGAN=Send us a tip
```

## Step 9: Deploy to Netlify

1. **Build the project:**
   ```bash
   pnpm run build
   ```

2. **Deploy to Netlify:**
   ```bash
   # Install Netlify CLI if not already installed
   npm install -g netlify-cli
   
   # Login to Netlify
   netlify login
   
   # Deploy
   netlify deploy --prod
   ```

3. **Set environment variables in Netlify dashboard:**
   - Go to Site settings > Environment variables
   - Add all the Voltage API credentials

## Step 10: Test the Application

1. **Local development:**
   ```bash
   pnpm run dev
   ```

2. **Test the flow:**
   - Select a tip amount
   - Verify Bitcoin price loading
   - Test payment creation
   - Verify QR code generation

## Key Features Implemented

- ✅ Vite + TypeScript + React setup
- ✅ Bitcoin Builder Kit UI components
- ✅ Real-time Bitcoin price from Kraken API
- ✅ Lightning Network payments via Voltage API
- ✅ Netlify deployment with serverless functions
- ✅ Responsive design with Tailwind CSS
- ✅ Error handling and loading states

## Next Steps

- Add payment completion detection
- Implement custom amount input
- Add payment history
- Enhance error handling
- Add analytics tracking

This tutorial provides a complete foundation for building a Bitcoin Lightning tip jar. The application handles real-time price conversion, creates Lightning invoices, and provides a smooth user experience for receiving Bitcoin tips.
