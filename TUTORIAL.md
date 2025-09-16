# Building a Bitcoin Lightning Tip Jar

This tutorial walks through building a Bitcoin Lightning Network tip jar.

## Building Blocks

- Node.js 18+ and pnpm
- Vite + Typescript + React
- Bitcoin Builder Kit
- TailwindCSS
- Netlify (free tier)
- Voltage Payments API account (free for mutinynet)
- Kraken API access (free)

## Step 1: Create new Vite Project

```bash
npm create vite@latest btc-tip-jar -- --template react-ts && pnpm i
```

### Check your step 1 work

Run `pnpm dev`. You should find a web page at http://localhost:5173 that says "Vite + React" in the heading. If so, step 1 is complete.

## Step 2: Scaffold UI for landing page

Install TailwindCSS and Bitcoin Builder Kit.

```bash
pnpm add tailwindcss @tailwindcss/vite @sbddesign/bui-ui @sbddesign/bui-tokens @sbddesign/bui-icons
```

Add the TailwindCSS plugin to `vite.config.ts`.

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
})
```

Update `index.css` to import Tailwind, use variables from the Bitcoin Builder Kit instead of harcoded colors, and other style enhancements.

Note: very important to import Tailwind, or else much of the tailwind styling will not take effect.

```css
@import "tailwindcss";

:root {
  font-family: 'Outfit', -apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 'Oxygen',
    'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 'Helvetica Neue',
    sans-serif;
  line-height: 1.5;
  font-weight: 400;

  color-scheme: light dark;
  color: var(--text-primary);
  background: var(--background);

  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  -webkit-text-size-adjust: 100%;
  width: 100%;
}

#root {
  width: 100%;
  color: var(--text-primary);
}

* {
  box-sizing: border-box;
}

body, html {
  width: 100%;
  background: var(--background);
}

body {
  margin: 0;
  display: flex;
  place-items: center;
  font-family: 'Outfit', sans-serif;
}
```

Update `index.html` to include the Outfit font from Google fonts, the title "Bitcoin Tip Jar", and a `data-mode` (bitcoindesign, conduit) and `data-theme` (light, dark) on the `<body>` tag.

Note: the `data-mode` and `data-theme` is critical, or much of the Bitcoin Builder Kit styling will not work.

```html
<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@100..900&display=swap" rel="stylesheet">
    <title>Bitcoin Tip Jar</title>
  </head>
  <body data-theme="bitcoindesign" data-mode="light">
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

Create `src/components/Recipient.tsx` with the following:

```typescript
import { BuiAvatarReact as BuiAvatar } from '@sbddesign/bui-ui/react';

interface RecipientProps {
  size?: 'Large' | 'Small';
}

function Recipient({ size = "Large" }: RecipientProps) {
  // Get the name from environment variable
  const name = import.meta.env.VITE_TIP_JAR_NAME || "Bitcoin Tip Jar";
  const nameElement = (
    <div className="relative shrink-0 text-[#71717b] text-2xl text-center">
      <p className="whitespace-nowrap">{name}</p>
    </div>
  );

  if (size === "Small") {
    return (
      <div className="flex flex-col gap-4 items-center justify-start relative w-full" data-name="Size=Small">
        <div className="w-16 h-16" data-name="Avatar" data-node-id="6903:5809">
          <BuiAvatar 
            size={'large'}
            showInitial='true'
            text="₿itcoin Tip Jar"
          />
        </div>
        {nameElement}
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-6 items-center justify-start relative w-full" data-name="Size=Large">
      <div className="w-40 h-40" data-name="Avatar" data-node-id="6903:5799">
        <BuiAvatar 
          size={'large'}
          showInitial='true'
          text="₿itcoin Tip Jar"
        />
      </div>
      {nameElement}
    </div>
  );
}

export default function RecipientComponent() {
  return (
    <div data-name="Recipient">
      <Recipient />
    </div>
  );
}

export { Recipient };
```

Replace the contents of `App.tsx` with the following:

```import { useState } from 'react'
import { 
  BuiAmountOptionTileReact as BuiAmountOptionTile,
  BuiButtonReact as BuiButton
} from '@sbddesign/bui-ui/react'
import '@sbddesign/bui-ui/tokens.css'
import { Recipient } from './components/Recipient'

// Type definition for tip options
interface TipOption {
  id: number;
  primaryAmount: number;
  secondaryAmount: number;
  emoji: string;
  message: string;
  selected: boolean;
}

// Base tip amounts (USD) - secondary amounts (sats) will be calculated dynamically
const baseTipOptions = [
  {
    id: 1,
    primaryAmount: 10,
    secondaryAmount: 10000,
    emoji: '🧡',
    message: 'Super',
    selected: false
  },
  {
    id: 2,
    primaryAmount: 20,
    secondaryAmount: 20000,
    emoji: '🎉',
    message: 'Amazing',
    selected: false
  },
  {
    id: 3,
    primaryAmount: 50,
    secondaryAmount: 50000,
    emoji: '🔥',
    message: 'Incredible',
    selected: false
  }
]

function App() {
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [tipOptionsState, setTipOptionsState] = useState<TipOption[]>(baseTipOptions)

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
    <div className="text-center flex flex-col gap-8 lg:gap-12 p-6 lg:p-12">
      <header className="flex flex-col gap-4 lg:gap-6">
        <Recipient size="Large" />
        <p className="text-3xl lg:text-5xl">{import.meta.env.VITE_TIP_JAR_SLOGAN || "Send us a tip"}</p>
      </header>

      {/* Tip options */}
        <div className="flex flex-col lg:flex-row w-full gap-6 max-w-xl lg:max-w-7xl mx-auto">
          {tipOptionsState.map((option) => (
            <BuiAmountOptionTile
              emoji={option.emoji}
              message={option.message}
              showEmoji={true}
              showMessage={true}
              showSecondaryCurrency={true}
              custom={false}
              selected={option.selected}
              primaryAmount={option.primaryAmount}
              primarySymbol={'$'}
              secondaryAmount={option.secondaryAmount}
              secondarySymbol={'₿'}
              showEstimate={true}
              primaryTextSize="6xl"
              secondaryTextSize="2xl"
              onClick={() => handleAmountSelect(option.primaryAmount)}
              key={option.id}
            />
          ))}
          <BuiAmountOptionTile
            custom={true}
            amountDefined={false}
            primaryAmount={0}
            secondaryAmount={0}
            showSecondaryCurrency={true}
            secondarySymbol={'₿'}
            showEstimate={true}
            primaryTextSize="6xl"
            secondaryTextSize="2xl"
            selected={selectedAmount !== null && !tipOptionsState.some(opt => opt.selected)}
          />
        </div>

        <div className="text-center">
          <BuiButton
            styleType="filled"
            size="large"
            label="Continue"
            disabled={!selectedAmount ? "true" : ""}
          />
        </div>
    </div>
  )
}

export default App
```

### Check your step 2 work

In [your browser](http://localhost:5173/), you should see a white screen with 3 tip options ($10, $20, $50, Custom Amount). The top header has an avatar with "Bitcoin Tip Jar" and "Send us a tip".

![Screenshot of what the landing page UI should look like after completing step 2](./public/step-2-ui-scaffold.png)

## Step 3: Get price of bitcoin with Kraken

Create `src/services/priceApi.ts` with this content:

```typescript
// Kraken API service for fetching Bitcoin prices

export interface KrakenTickerResponse {
  error: string[];
  result: {
    XXBTZUSD: {
      a: [string, string, string]; // ask [price, whole lot volume, lot volume]
      b: [string, string, string]; // bid [price, whole lot volume, lot volume]
      c: [string, string]; // last trade closed [price, lot volume]
      v: [string, string]; // volume [today, last 24 hours]
      p: [string, string]; // volume weighted average price [today, last 24 hours]
      t: [number, number]; // number of trades [today, last 24 hours]
      l: [string, string]; // low [today, last 24 hours]
      h: [string, string]; // high [today, last 24 hours]
      o: string; // today's opening price
    };
  };
}

export class PriceApiError extends Error {
  public status?: number;
  public response?: any;

  constructor(
    message: string,
    status?: number,
    response?: any
  ) {
    super(message);
    this.name = 'PriceApiError';
    this.status = status;
    this.response = response;
  }
}

class PriceApi {
  private baseUrl = 'https://api.kraken.com/0/public';

  async getBtcUsdPrice(): Promise<number> {
    try {
      console.log('Fetching BTC/USD price from Kraken...');
      
      const response = await fetch(`${this.baseUrl}/Ticker?pair=XBTUSD`);
      
      if (!response.ok) {
        throw new PriceApiError(
          `HTTP ${response.status}: ${response.statusText}`,
          response.status
        );
      }

      const data: KrakenTickerResponse = await response.json();
      
      if (data.error && data.error.length > 0) {
        throw new PriceApiError(`Kraken API Error: ${data.error.join(', ')}`);
      }

      if (!data.result?.XXBTZUSD) {
        throw new PriceApiError('Invalid response format from Kraken API');
      }

      // Use the last trade price (most recent actual trade)
      const lastPrice = parseFloat(data.result.XXBTZUSD.c[0]);
      
      console.log(`Current BTC/USD price: $${lastPrice.toLocaleString()}`);
      
      return lastPrice;
    } catch (error) {
      console.error('Failed to fetch BTC price:', error);
      
      if (error instanceof PriceApiError) {
        throw error;
      }
      
      throw new PriceApiError(
        `Failed to fetch Bitcoin price: ${error instanceof Error ? error.message : 'Unknown error'}`
      );
    }
  }

  // Convert USD amount to satoshis using current BTC price
  async convertUsdToSats(usdAmount: number): Promise<number> {
    const btcPrice = await this.getBtcUsdPrice();
    const btcAmount = usdAmount / btcPrice;
    const satoshis = Math.round(btcAmount * 100_000_000); // 1 BTC = 100,000,000 sats
    
    console.log(`$${usdAmount} USD = ${btcAmount.toFixed(8)} BTC = ${satoshis.toLocaleString()} sats`);
    
    return satoshis;
  }
}

export const priceApi = new PriceApi();

// Helper function to get current BTC/USD price with caching
let priceCache: { price: number; timestamp: number } | null = null;
const CACHE_DURATION = 60 * 1000; // 1 minute cache

export async function getCurrentBtcPrice(): Promise<number> {
  const now = Date.now();
  
  // Return cached price if it's still fresh
  if (priceCache && (now - priceCache.timestamp) < CACHE_DURATION) {
    console.log(`Using cached BTC price: $${priceCache.price.toLocaleString()}`);
    return priceCache.price;
  }
  
  try {
    const price = await priceApi.getBtcUsdPrice();
    priceCache = { price, timestamp: now };
    return price;
  } catch (error) {
    // If we have a cached price and the API fails, use the cached price
    if (priceCache) {
      console.warn('Price API failed, using cached price:', error);
      return priceCache.price;
    }
    
    // If no cache and API fails, throw the error
    throw error;
  }
}

// Helper function to convert USD to sats with caching
export async function convertUsdToSats(usdAmount: number): Promise<number> {
  const btcPrice = await getCurrentBtcPrice();
  const btcAmount = usdAmount / btcPrice;
  const satoshis = Math.round(btcAmount * 100_000_000);
  
  return satoshis;
}
```

Add these new imports to `App.tsx`:

```typescript
import { useEffect } from 'react'
import { getCurrentBtcPrice, PriceApiError } from './services/priceApi'
```

Add the following to `App.tsx` inside of the main `App` function:

```typescript
  const [isLoadingPrices, setIsLoadingPrices] = useState(true)
  const [priceError, setPriceError] = useState<string | null>(null)

  // Load Bitcoin price and calculate secondary amounts on component mount
  useEffect(() => {
    const loadPricesAndCalculateAmounts = async () => {
      try {
        setIsLoadingPrices(true)
        setPriceError(null)
        
        console.log('Loading Bitcoin price...')
        const btcPrice = await getCurrentBtcPrice()
        
        // Calculate secondary amounts (satoshis) for each tip option
        const tipOptionsWithSats: TipOption[] = baseTipOptions.map(option => {
          const btcAmount = option.primaryAmount / btcPrice
          const satoshis = Math.round(btcAmount * 100_000_000) // Convert to sats
          
          return {
            ...option,
            secondaryAmount: satoshis
          }
        })
        
        console.log('Tip options with calculated sats:', tipOptionsWithSats)
        setTipOptionsState(tipOptionsWithSats)
        
      } catch (error) {
        console.error('Failed to load Bitcoin price:', error)
        
        if (error instanceof PriceApiError) {
          setPriceError(`Failed to load Bitcoin price: ${error.message}`)
        } else {
          setPriceError('Failed to load Bitcoin price. Please try again.')
        }
        
        // Use fallback prices if API fails
        const fallbackOptions: TipOption[] = baseTipOptions.map(option => ({
          ...option,
          secondaryAmount: Math.round(option.primaryAmount * 1500) // Rough fallback: $1 ≈ 1500 sats
        }))
        
        setTipOptionsState(fallbackOptions)
        
      } finally {
        setIsLoadingPrices(false)
      }
    }

    loadPricesAndCalculateAmounts()
  }, [])
```

To reflect the fetching of the price information and handle errors in the `App.tsx` UI, add these underneath the `<header>`:

```typescript
{/* Loading state */}
{isLoadingPrices && (
<div className="flex flex-col items-center gap-4 py-8">
    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[var(--text-primary)]"></div>
    <p className="text-[var(--text-secondary)]">Loading Bitcoin prices...</p>
</div>
)}

{/* Price error state */}
{priceError && (
<div className="flex flex-col items-center gap-4 py-4">
    <p className="text-red-500 text-sm">⚠️ {priceError}</p>
    <p className="text-[var(--text-secondary)] text-xs">Using approximate prices</p>
</div>
)}
```

And finally, to show the prices in the UI, individually wrap the "Tip options" `<div>` and the "Continue" `<BuiButton>` in a check for the loading prices const:

```typescript
{!isLoadingPrices && (
    <div className="...">
        {tipOptionsState.map((option) => (
        // BuiAmountOptionTile
        )}
    </div>
)}

{!isLoadingPrices && (
    <div className="text-center">
        <BuiButton
            styleType="filled"
            size="large"
            label="Continue"
            disabled={!selectedAmount ? "true" : ""}
        />
    </div>
)}
```

### Check your step 3 work

In [your browser](http://localhost:5173/), you should see a white screen with the 3 tip options and custom amount, as before. However, now there should be an accurate bitcoin price underneath each USD amount.

![Screenshot of what the landing page should look like after completing step 3](./public/step-3-btc-price.png)

## Step 4: Custom amount modal

To add the custom amount modal, make the following updates to `App.tsx`:

Add imports:

```typescript
import { useRef } from 'react'
import { BuiNumpadReact as BuiNumpad } from '@sbddesign/bui-ui/react'
import { convertUsdToSats } from './services/priceApi'
```

Add interface:

```typescript
// Type definition for NumPadClickDetail
interface NumPadClickDetail {
  number: string;
  content: 'number' | 'icon';
}
```

Add custom amount modal function:

```typescript
// Custom Amount Modal component
function CustomAmountModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  currentAmount,
  onAmountChange
}: {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (amount: number) => void;
  currentAmount: string;
  onAmountChange: (amount: string) => void;
}) {
  const numpadRef = useRef<HTMLElement>(null);
  const [btcPrice, setBtcPrice] = useState<number | null>(null);
  const [isLoadingPrice, setIsLoadingPrice] = useState(false);
  
  // Load Bitcoin price when modal opens
  useEffect(() => {
    if (isOpen) {
      loadBtcPrice();
    }
  }, [isOpen]);

  const loadBtcPrice = async () => {
    try {
      setIsLoadingPrice(true);
      const price = await getCurrentBtcPrice();
      setBtcPrice(price);
    } catch (error) {
      console.error('Failed to load BTC price for modal:', error);
      // Use fallback price
      setBtcPrice(97250);
    } finally {
      setIsLoadingPrice(false);
    }
  };
  
  // Event listener for numpad-click events
  useEffect(() => {
    const numpadElement = numpadRef.current;
    if (!numpadElement || !isOpen) return;

    const handleNumpadClick = (event: CustomEvent<NumPadClickDetail>) => {
      console.log('NumPad click detected:', event.detail);
      
      const { number, content } = event.detail;
      
              if (content === 'icon') {
          // Handle backspace
          onAmountChange(currentAmount.slice(0, -1) || '0');
        } else {
          // Handle number input
          if (number === '.' && currentAmount.includes('.')) return; // Prevent multiple decimal points
          if (currentAmount === '0' && number !== '.') {
            onAmountChange(number);
          } else {
            onAmountChange(currentAmount + number);
          }
        }
    };

    // Add event listener for the custom numpad-click event
    numpadElement.addEventListener('numpad-click', handleNumpadClick as EventListener);

    // Cleanup function to remove event listener
    return () => {
      numpadElement.removeEventListener('numpad-click', handleNumpadClick as EventListener);
    };
  }, [isOpen, currentAmount]);
  
  const handleConfirm = () => {
    const numAmount = parseFloat(currentAmount);
    if (numAmount > 0) {
      onConfirm(numAmount);
    }
  };
  
  const isAmountValid = parseFloat(currentAmount) > 0;
  
  // Calculate satoshis using real-time price
  const amount = parseFloat(currentAmount);
  let satoshis = 0;
  
  if (btcPrice && amount > 0 && !isNaN(amount) && !isNaN(btcPrice)) {
    satoshis = Math.round((amount / btcPrice) * 100_000_000);
  }
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-6 lg:p-12">
      <div className="bg-[var(--background)] rounded-[24px] flex flex-col lg:flex-row w-full max-w-6xl gap-6 p-6 lg:p-12 max-md:h-full overflow-x-hidden overflow-y-auto">
        <div className="lg:basis-3/5 lg:w-3/5">
          <h2 className="text-2xl lg:text-4xl text-center mb-6">Choose custom amount</h2>
                     <BuiAmountOptionTile
             showMessage={false}
             showEmoji={false}
             primaryAmount={parseFloat(currentAmount) || 0}
             secondaryAmount={isLoadingPrice ? 0 : satoshis}
             showSecondaryCurrency={true}
             secondarySymbol={'₿'}
             showEstimate={true}
             primaryTextSize="6xl"
             secondaryTextSize="2xl"
           />
        </div>
                 <div className="lg:basis-2/5 lg:w-2/5 text-center flex flex-col items-center gap-6">
           {/* Numpad */}
             <BuiNumpad ref={numpadRef} />
          
          {/* Action Buttons */}
          <div className="flex gap-6 w-full">
            <BuiButton
              label="Go Back"
              styleType="outline"
              wide="true"
              onClick={onClose}
            >
            </BuiButton>
                         <BuiButton
               label="Continue"
               wide="true"
               disabled={!isAmountValid ? "true" : ""}
               onClick={handleConfirm}
             >
            </BuiButton>
          </div>
        </div>
      </div>
    </div>
  );
}
```

Add state constants inside `App()`:

```typescript
const [showCustomModal, setShowCustomModal] = useState(false)
const [currentInputAmount, setCurrentInputAmount] = useState('0')
const [customAmountSats, setCustomAmountSats] = useState<number>(0)
```

Add these functions inside `App()`:

```typescript
const handleCustomSelect = () => {
    setShowCustomModal(true)
  }

  const handleCustomConfirm = async (amount: number) => {
    setSelectedAmount(amount)
    setCurrentInputAmount(amount.toString())
    setShowCustomModal(false)
    
    // Calculate Bitcoin amount for custom amount
    try {
      const btcAmount = await convertUsdToSats(amount)
      setCustomAmountSats(btcAmount)
    } catch (error) {
      console.error('Failed to calculate Bitcoin amount for custom amount:', error)
      // Use fallback calculation
      const fallbackBtcAmount = Math.round(amount * 1500) // Rough fallback: $1 ≈ 1500 sats
      setCustomAmountSats(fallbackBtcAmount)
    }
    
    // Update the custom tile to show the selected amount
    setTipOptionsState(prev => 
      prev.map(option => ({
        ...option,
        selected: false
      }))
    )
  }
```

For the final `<BuiAmountOptionTile>` where `custom={true}`, add `onClick={handleCustomSelect}`.

Before the final closing `</div>`, add this:

```typescript
<CustomAmountModal
    isOpen={showCustomModal}
    onClose={() => setShowCustomModal(false)}
    onConfirm={handleCustomConfirm}
    currentAmount={currentInputAmount}
    onAmountChange={setCurrentInputAmount}
/>
```

### Check your step 4 work:

In [your browser](http://localhost:5173/), you can go click "Custom Amount". It will bring up a modal with a numpad. If you press the numpad and choose a dollar value, it will pull up reflect an updated amount of bitcoin. If you click continue, the amount you selected will now be visible inside the "custom amount" tile.

![Screenshot of what the custom amount modal should look like after completing step 4](./public/step-4-custom-amount.png)

## Step 5: Receive payments with Voltage API

We will now need to setup both Voltage and Netlify. Since we plan to deploy to Netlify and Netlify is serverless, we will construct the API call to Voltage Payments in a way that will be compatible with Netlify's serverless functions.

Install Netlify CLI if it is not already installed.

Run `pnpm add -D netlify-cli` or globally with `npm install -g netlify-cli`.

Install `uuid` and netlify functions:

`pnpm add @netlify/functions uuid`

Update scripts in `package.json`:

```json
"scripts": {
    "dev": "netlify dev",
    "dev:vite": "vite",
    "build": "tsc -b && vite build",
    "lint": "eslint .",
    "preview": "vite preview"
}
```

Create `netlify.toml` with this content:

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
  # Start the Vite dev server when running `netlify dev`
  command = "pnpm dev:vite"
  # Tell Netlify Dev which port Vite uses
  targetPort = 5173
```

Add to `.gitignore`:

```
# Local Netlify folder
.netlify
```

Create `src/config/voltage.ts` with the following:

```typescript
// Voltage API configuration
const IS_DEV = import.meta.env.DEV;

export const voltageConfig = {
  // Only read VITE_* variables in development to avoid bundling secrets in production
  apiKey: IS_DEV ? import.meta.env.VITE_VOLTAGE_API_KEY : undefined,
  orgId: IS_DEV ? import.meta.env.VITE_VOLTAGE_ORG_ID : undefined,
  envId: IS_DEV ? import.meta.env.VITE_VOLTAGE_ENV_ID : undefined,
  walletId: IS_DEV ? import.meta.env.VITE_VOLTAGE_WALLET_ID : undefined,
  // Use proxy in development; production uses Netlify Functions, baseUrl is unused
  baseUrl: IS_DEV ? '/api/voltage' : 'https://voltageapi.com/v1'
};

export function isVoltageConfigured(): boolean {
  // In development we need client-side credentials to call the Voltage API via proxy.
  if (IS_DEV) {
    return !!(
      voltageConfig.apiKey &&
      voltageConfig.orgId &&
      voltageConfig.envId &&
      voltageConfig.walletId
    );
  }

  // In production, serverless function handles credentials; allow proceeding.
  return true;
}
```

Create `src/services/voltageApi.ts` with the following:

```typescript
import { voltageConfig } from '../config/voltage';
import { v4 as uuidv4 } from 'uuid';
import { convertUsdToSats } from './priceApi';

// Types based on Voltage API documentation
export interface VoltageAmount {
  amount: number;
  currency: 'btc' | 'usd';
  unit: 'sat' | 'msat' | 'btc' | 'usd';
}

// Receive payment request structure (what we need for creating invoices)
export interface CreateReceivePaymentRequest {
  id: string;
  payment_kind: 'bolt11' | 'onchain' | 'bip21';
  wallet_id: string;
  amount_msats: number; // Amount in millisatoshis
  currency: 'btc' | 'usd';
  description?: string;
}

export interface PaymentData {
  amount_msats: number;
  expiration?: string | null;
  memo?: string;
  payment_request: string; // Lightning invoice
}

export interface RequestedAmount {
  amount: number;
  currency: 'btc' | 'usd';
  unit: 'msats' | 'sats' | 'btc';
}

export interface Payment {
  id: string;
  organization_id: string;
  environment_id: string;
  wallet_id: string;
  bip21_uri?: string;
  created_at: string;
  currency: 'btc' | 'usd';
  data: PaymentData;
  direction: 'receive' | 'send';
  error?: string | null;
  frozen: any[];
  requested_amount: RequestedAmount;
  status: 'receiving' | 'completed' | 'failed' | 'pending' | 'expired';
  type: 'bolt11' | 'onchain' | 'bip21';
  updated_at: string;
}

export class VoltageApiError extends Error {
  public status?: number;
  public response?: any;

  constructor(
    message: string,
    status?: number,
    response?: any
  ) {
    super(message);
    this.name = 'VoltageApiError';
    this.status = status;
    this.response = response;
  }
}

class VoltageApi {
  constructor() {}

  async createPayment(request: CreateReceivePaymentRequest): Promise<void> {
    // Always use serverless function for consistent behavior
    const response = await fetch('/api/voltage-payments', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new VoltageApiError(
        `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorText
      );
    }

    // 202 response has no body, just return
    return;
  }

  async getPayment(paymentId: string): Promise<Payment> {
    // Always use serverless function for consistent behavior
    const response = await fetch(`/api/voltage-payments?id=${encodeURIComponent(paymentId)}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new VoltageApiError(
        `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        errorText
      );
    }

    const payment = await response.json();
    return payment as Payment;
  }
}

export const voltageApi = new VoltageApi();

// Helper function to poll payment status until payment methods are available
async function pollPaymentStatus(
  paymentId: string,
  maxAttempts: number = 30,
  intervalMs: number = 1000
): Promise<Payment> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const payment = await voltageApi.getPayment(paymentId);
      
      // Check if payment data is available with Lightning invoice
      if (payment.data && payment.data.payment_request) {
        console.log(`Payment data ready after ${attempt + 1} attempts`);
        return payment;
      }
      
      console.log(`Attempt ${attempt + 1}: Payment data not ready yet, polling again...`);
      
      // Wait before next attempt
      if (attempt < maxAttempts - 1) {
        await new Promise(resolve => setTimeout(resolve, intervalMs));
      }
    } catch (error) {
      console.error(`Polling attempt ${attempt + 1} failed:`, error);
      
      // If it's the last attempt, throw the error
      if (attempt === maxAttempts - 1) {
        throw error;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
  }
  
  throw new VoltageApiError('Payment data not ready after maximum polling attempts');
}

// Helper function to poll payment status until completed
async function pollPaymentCompletion(
  paymentId: string,
  maxAttempts: number = 300, // 5 minutes at 1 second intervals
  intervalMs: number = 1000
): Promise<Payment> {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    try {
      const payment = await voltageApi.getPayment(paymentId);
      
      console.log(`Payment status check ${attempt + 1}: ${payment.status}`);
      
      // Check if payment is completed
      if (payment.status === 'completed') {
        console.log(`Payment completed after ${attempt + 1} attempts!`);
        return payment;
      }
      
      // If payment failed or expired, throw error
      if (payment.status === 'failed' || payment.status === 'expired') {
        throw new VoltageApiError(`Payment ${payment.status}`);
      }
      
      // Wait before next attempt
      if (attempt < maxAttempts - 1) {
        await new Promise(resolve => setTimeout(resolve, intervalMs));
      }
    } catch (error) {
      console.error(`Payment status polling attempt ${attempt + 1} failed:`, error);
      
      // If it's the last attempt, throw the error
      if (attempt === maxAttempts - 1) {
        throw error;
      }
      
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, intervalMs));
    }
  }
  
  throw new VoltageApiError('Payment not completed after maximum polling attempts');
}

// Helper function to create tip payment methods
export async function createTipPaymentMethods(
  amountUsd: number,
  description: string = 'Bitcoin Tip'
): Promise<{
  lightningInvoice?: string;
  onchainAddress?: string;
  payment: Payment;
  pollForCompletion: () => Promise<Payment>;
}> {
  // Validate inputs and configuration before proceeding
  if (!Number.isFinite(amountUsd) || amountUsd <= 0) {
    throw new VoltageApiError('Amount must be a positive number');
  }
  // Only require wallet in development; production uses server override
  if (import.meta.env.DEV && !voltageConfig.walletId) {
    throw new VoltageApiError('Voltage wallet is not configured');
  }

  try {
    // Convert USD to satoshis using real-time Bitcoin price
    console.log(`Converting $${amountUsd} USD to satoshis...`);
    const amountSats = await convertUsdToSats(amountUsd);
    const amountMsats = amountSats * 1000; // Convert sats to millisats

    const paymentId = uuidv4(); // Generate unique ID for this payment request
    
    const paymentRequest: CreateReceivePaymentRequest = {
      id: paymentId,
      payment_kind: 'bolt11', // Creates Lightning-only payment
      // In dev, pass actual wallet; in prod, use placeholder; server will override
      wallet_id: import.meta.env.DEV ? (voltageConfig.walletId as string) : 'server',
      amount_msats: amountMsats, // Amount in millisatoshis
      currency: 'btc',
      description,
    };
    // …rest of existing logic…

    // Create the payment request (returns 202 with no body)
    await voltageApi.createPayment(paymentRequest);
    
    console.log(`Payment request created with ID: ${paymentId}, polling for payment data...`);
    
    // Poll for payment status until payment data is ready
    const payment = await pollPaymentStatus(paymentId);

    // Extract Lightning invoice from payment data
    return {
      lightningInvoice: payment.data.payment_request,
      onchainAddress: '', // Leave empty for bolt11 payments
      payment,
      pollForCompletion: () => pollPaymentCompletion(paymentId),
    };
  } catch (error) {
    if (error instanceof VoltageApiError) {
      throw error;
    }
    throw new VoltageApiError(
      `Failed to create payment: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}
```

Create `netlify/functions/voltage-payments.ts` with the following:

```typescript
// Netlify serverless function for handling Voltage API requests
import type { Handler, HandlerEvent, HandlerContext } from '@netlify/functions';

interface CreateReceivePaymentRequest {
  id: string;
  payment_kind: 'bolt11' | 'onchain' | 'bip21';
  wallet_id: string;
  amount_msats: number; // Amount in millisatoshis
  currency: 'btc' | 'usd';
  description?: string;
}

export const handler: Handler = async (event: HandlerEvent, context: HandlerContext) => {
  // Enable CORS
  const headers = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
  };

  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 200,
      headers,
      body: '',
    };
  }

  try {
    const VOLTAGE_API_KEY = process.env.VOLTAGE_API_KEY || process.env.VITE_VOLTAGE_API_KEY;
    const VOLTAGE_ORG_ID = process.env.VOLTAGE_ORG_ID || process.env.VITE_VOLTAGE_ORG_ID;
    const VOLTAGE_ENV_ID = process.env.VOLTAGE_ENV_ID || process.env.VITE_VOLTAGE_ENV_ID;
    const VOLTAGE_WALLET_ID = process.env.VOLTAGE_WALLET_ID || process.env.VITE_VOLTAGE_WALLET_ID;

    if (!VOLTAGE_API_KEY || !VOLTAGE_ORG_ID || !VOLTAGE_ENV_ID) {
      return {
        statusCode: 500,
        headers,
        body: JSON.stringify({ error: 'Voltage API configuration missing' }),
      };
    }

    // Handle GET to fetch payment by ID
    if (event.httpMethod === 'GET') {
      const url = new URL(event.rawUrl);
      const paymentId = url.searchParams.get('id') || url.searchParams.get('paymentId') || undefined;

      if (!paymentId) {
        return {
          statusCode: 400,
          headers,
          body: JSON.stringify({ error: 'Missing payment id' }),
        };
      }

      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 10_000); // 10s
      const response = await fetch(
        `https://voltageapi.com/v1/organizations/${VOLTAGE_ORG_ID}/environments/${VOLTAGE_ENV_ID}/payments/${paymentId}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'x-api-key': VOLTAGE_API_KEY,
          },
          signal: controller.signal
        }
      );
      clearTimeout(timeout);

      if (!response.ok) {
        const errorText = await response.text();
        console.error('Voltage API Error (GET payment):', { status: response.status, errorText });
        return {
          statusCode: response.status,
          headers,
          body: JSON.stringify({ 
            error: `Voltage API Error: ${response.status}`,
            details: errorText 
          }),
        };
      }

      const payment = await response.json();
      return {
        statusCode: 200,
        headers,
        body: JSON.stringify(payment),
      };
    }

    if (event.httpMethod !== 'POST') {
      return {
        statusCode: 405,
        headers,
        body: JSON.stringify({ error: 'Method not allowed' }),
      };
    }

    // Parse request body
    let paymentRequest: CreateReceivePaymentRequest;
    
    try {
      paymentRequest = JSON.parse(event.body || '{}');
    } catch (parseError) {
      console.error('Failed to parse request body:', parseError);
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Invalid JSON in request body',
          details: parseError instanceof Error ? parseError.message : 'Unknown parse error'
        }),
      };
    }

    // Override wallet id with server configuration when available
    if (VOLTAGE_WALLET_ID) {
      paymentRequest.wallet_id = VOLTAGE_WALLET_ID;
    }

    // Validate required fields
    if (!paymentRequest.id || !paymentRequest.payment_kind ||
        typeof paymentRequest.amount_msats !== 'number' || !paymentRequest.currency ||
        !paymentRequest.wallet_id) {
      return {
        statusCode: 400,
        headers,
        body: JSON.stringify({ 
          error: 'Missing required fields in payment request',
          details: 'Required fields: id, payment_kind, wallet_id, amount_msats, currency'
        }),
      };
    }

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10_000); // 10s
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
        signal: controller.signal
      }
    );
    clearTimeout(timeout);

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Voltage API Error:', { status: response.status, errorText });
      return {
        statusCode: response.status,
        headers,
        body: JSON.stringify({ 
          error: `Voltage API Error: ${response.status}`,
          details: errorText 
        }),
      };
    }

    // Payment creation returns 202 with no body
    if (response.status === 202) {
      return {
        statusCode: 202,
        headers,
        body: JSON.stringify({ success: true, message: 'Payment request created' }),
      };
    }

    const payment = await response.json();
    return {
      statusCode: 200,
      headers,
      body: JSON.stringify(payment),
    };
  } catch (error) {
    console.error('Payment creation error:', error);
    return {
      statusCode: 500,
      headers,
      body: JSON.stringify({ 
        error: 'Failed to create payment',
        details: error instanceof Error ? error.message : 'Unknown error'
      }),
    };
  }
};
```

Create `srx/components/ReceiveScreen.tsx` with the following:

```typescript
import { useState, useEffect } from 'react';
import { 
  BuiBitcoinQrDisplayReact as BuiBitcoinQrDisplay,
  BuiButtonReact as BuiButton,
  BuiMoneyValueReact as BuiMoneyValue,
  BuiBitcoinValueReact as BuiBitcoinValue,
} from '@sbddesign/bui-ui/react';
import { 
  createTipPaymentMethods,
  VoltageApiError
} from '../services/voltageApi';

import { isVoltageConfigured } from '../config/voltage';
import { Recipient } from './Recipient';
// Import icons as React components
const CopyIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M8 5H6C4.89543 5 4 5.89543 4 7V19C4 20.1046 4.89543 21 6 21H16C17.1046 21 18 20.1046 18 19V7C18 5.89543 17.1046 5 16 5H14M8 5C8 6.10457 8.89543 7 10 7H14C15.1046 7 16 6.10457 16 5M8 5C8 3.89543 8.89543 3 10 3H14C15.1046 3 16 3.89543 16 5M12 12H16M12 16H16M8 12H8.01M8 16H8.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;

const ArrowLeftIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M19 12H5M12 19L5 12L12 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;

const CheckCircleIcon = () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M22 11.08V12C21.9988 14.1564 21.3005 16.2547 20.0093 17.9818C18.7182 19.7088 16.9033 20.9725 14.8354 21.5839C12.7674 22.1953 10.5573 22.1219 8.53447 21.3746C6.51168 20.6273 4.78465 19.2461 3.61096 17.4371C2.43727 15.628 1.87979 13.4881 2.02168 11.3363C2.16356 9.18455 2.99721 7.13631 4.39828 5.49706C5.79935 3.85781 7.69279 2.71537 9.79619 2.24013C11.8996 1.7649 14.1003 1.98232 16.07 2.85999" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/><path d="M22 4L12 14.01L9 11.01" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>;

interface ReceiveScreenProps {
  amount: number;
  bitcoinAmount: number;
  onGoBack: () => void;
  onCopy: () => void;
}

interface PaymentData {
  lightningInvoice?: string;
  onchainAddress?: string;
}

export default function ReceiveScreen({ amount, bitcoinAmount, onGoBack, onCopy }: ReceiveScreenProps) {
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isPaymentComplete, setIsPaymentComplete] = useState(false);

  useEffect(() => {
    const createPayment = async () => {
      if (!isVoltageConfigured()) {
        setError('Voltage API is not properly configured');
        setIsLoading(false);
        return;
      }

      try {
        setIsLoading(true);
        setError(null);
        
        const result = await createTipPaymentMethods(
          amount,
          `Bitcoin tip for $${amount} - ${import.meta.env.VITE_TIP_JAR_NAME || "Recipient"}`
        );

        console.log('Payment result:', result);
        console.log('Lightning invoice:', result.lightningInvoice);
        
        const newPaymentData = {
          lightningInvoice: result.lightningInvoice,
          onchainAddress: result.onchainAddress,
        };
        
        console.log('Setting payment data:', newPaymentData);
        setPaymentData(newPaymentData);

        // Start polling for payment completion in the background
        console.log('Starting payment completion polling...');
        result.pollForCompletion()
          .then((completedPayment) => {
            console.log('Payment completed!', completedPayment);
            setIsPaymentComplete(true);
            // Don't call onPaymentComplete() - we'll handle it in the UI
          })
          .catch((pollError) => {
            console.error('Payment completion polling failed:', pollError);
            // Don't show error to user, they might have paid successfully
            // The polling might fail due to network issues, etc.
          });
      } catch (err) {
        console.error('Failed to create payment:', err);
        
        if (err instanceof VoltageApiError) {
          setError(`Payment creation failed: ${err.message}`);
        } else {
          setError('Failed to create payment. Please try again.');
        }
      } finally {
        setIsLoading(false);
      }
    };

    createPayment();
  }, [amount]);

  const handleCopy = async () => {
    try {
      if (!paymentData?.onchainAddress && !paymentData?.lightningInvoice) {
        console.error('No payment data available to copy');
        return;
      }

      let textToCopy = '';
      
      if (paymentData.onchainAddress && paymentData.lightningInvoice) {
        // Create unified BIP21 string
        textToCopy = `bitcoin:${paymentData.onchainAddress}?lightning=${paymentData.lightningInvoice}`;
      } else if (paymentData.lightningInvoice) {
        textToCopy = paymentData.lightningInvoice;
      } else if (paymentData.onchainAddress) {
        textToCopy = paymentData.onchainAddress;
      }

      if (textToCopy) {
        await navigator.clipboard.writeText(textToCopy);
        setIsCopied(true);
        onCopy();
        
        // Reset copied state after 2 seconds
        setTimeout(() => {
          setIsCopied(false);
        }, 2000);
      }
    } catch (error) {
      console.error('Failed to copy:', error);
    }
  };

  const handleLeaveAnotherTip = () => {
    // Go back to landing screen by calling onGoBack
    onGoBack();
  };

  // Debug logging
  console.log('ReceiveScreen render - paymentData:', paymentData);
  console.log('ReceiveScreen render - isLoading:', isLoading);
  console.log('ReceiveScreen render - error:', error);

  return (
    <div className="bg-[var(--background)] min-h-screen flex flex-col items-center justify-start p-12 gap-12">
      {/* Header Section */}
      <div className="flex flex-col items-center gap-2">
        <Recipient size="Small" />
        <h1 className="text-4xl font-normal text-center">{import.meta.env.VITE_TIP_JAR_SLOGAN || "Send us a tip"}</h1>
      </div>

      {/* Amount Display */}
      <div className="flex items-center gap-8">
        <BuiMoneyValue
          amount={amount.toString()}
          symbol="$"
          showEstimate="true"
          textSize="3xl"
        />
        <span className="text-[var(--text-secondary)]">
          <BuiBitcoinValue
            amount={bitcoinAmount.toString()}
            textSize="3xl"
          />
        </span>
      </div>

      {/* Bitcoin QR Display */}
      <div className="w-[392px]">
        <BuiBitcoinQrDisplay
          key={paymentData?.lightningInvoice || 'loading'} // Force re-render when invoice changes
          lightning={paymentData?.lightningInvoice || ''}
          option="lightning"
          selector="toggle"
          size="264"
          showImage="true"
          dotType="dot"
          dotColor="#000000"
          copyOnTap="true"
          placeholder={isLoading ? "true" : ""}
          error={error ? "true" : ""}
          errorMessage={error || undefined}
          complete={isPaymentComplete ? "true" : ""}
        />
      </div>

      {/* Bottom Navigation - Vertical Layout */}
      <div className="w-[314px] flex flex-col gap-4">
        {isPaymentComplete ? (
          <BuiButton
            label="Leave Another Tip"
            styleType="filled"
            size="large"
            wide="true"
            onClick={handleLeaveAnotherTip}
          >
            <CheckCircleIcon />
          </BuiButton>
        ) : (
          <>
            <BuiButton
              label={isCopied ? "Copied!" : (isLoading ? "Loading..." : "Copy")}
              styleType="filled"
              size="large"
              wide="true"
              disabled={isLoading || !!error || !paymentData ? "true" : ""}
              onClick={handleCopy}
            >
              {isCopied ? <CheckCircleIcon /> : <CopyIcon />}
            </BuiButton>
            <BuiButton
              label="Go Back"
              styleType="outline"
              size="large"
              wide="true"
              onClick={onGoBack}
            >
              <ArrowLeftIcon />
            </BuiButton>
          </>
        )}
      </div>
    </div>
  );
}
```

Make the following updates to `App.tsx`:

Add imports:

```typescript
import ReceiveScreen from './components/ReceiveScreen'
```

Add state constant:

```typescript
const [showReceiveScreen, setShowReceiveScreen] = useState(false)
```

Add to `App()`:

```typescript
  const handleContinue = () => {
    if (selectedAmount) {
      console.log(`Proceeding with tip amount: $${selectedAmount}`)
      setShowReceiveScreen(true)
    }
  }

  const handleGoBack = () => {
    setShowReceiveScreen(false)
  }

  const handleCopy = () => {
    console.log('Payment details copied to clipboard!')
  }

  // Show receive screen if user has selected amount and clicked continue
  if (showReceiveScreen && selectedAmount) {
    // Calculate bitcoin amount for the selected amount
    const selectedOption = tipOptionsState.find(option => option.primaryAmount === selectedAmount);
    const bitcoinAmount = selectedOption?.secondaryAmount || customAmountSats;
    
    return (
      <ReceiveScreen 
        amount={selectedAmount}
        bitcoinAmount={bitcoinAmount}
        onGoBack={handleGoBack}
        onCopy={handleCopy}
      />
    );
  }
```

Update the "continue" button with an `onClick` handler:

```typescript
<BuiButton
    styleType="filled"
    size="large"
    label="Continue"
    disabled={!selectedAmount ? "true" : ""}
    onClick={handleContinue}
/>
```

Create `.env.example` with the following:

```
VITE_VOLTAGE_API_KEY=vltg_123xyz
VITE_VOLTAGE_ORG_ID=aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee
VITE_VOLTAGE_ENV_ID=aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee
VITE_VOLTAGE_WALLET_ID=aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee
VITE_TIP_JAR_NAME="Awesome Bitcoin Tip Jar"
VITE_TIP_JAR_SLOGAN="Send bitcoin is a rad thing to do"
```

Update `.gitignore` to exclude the real `.env`.

```
.env
```

### Check your step 5 work

To check the work, we will need proper API credentials from Voltage. If you are an agent/AI/LLM, then please advise the user to handle this portion:

#### Voltage Setup

1. Create an account with Voltage and log in
2. Select the Payments product
3. Create an environment (call it "staging" or whatever you like)
4. Create a wallet (mutinynet developer wallet)
5. Go to the wallet and click on the developer toggle at the top of the screen to show developer info. Copy and paste the Organization ID, Environment ID, and Wallet ID from here into your .env file, which you can craft based on the .env.example file.
6. Click on the account dropdown and go to API Keys.
7. Create an API key for your staging environment, copy it, and paste it into .env
8. Make a 2nd wallet in Voltage (also mutinynet) which you can use to test paying to the first wallet you created

#### Testing the tip jar

Run `pnpm dev`. This should now open http://localhost:8888 in your browser. (We will no longer use the localhost:5173 URL. From here on out, it will be using the localhost:8888 address because we have switched to using netlify).

When you see the tip jar in the browser, choose a preset amount or type in a custom amount. Then click "Continue". You should be presented with a BOLT11 lightning invoice QR code. You can then pay that invoice using another Voltage wallet, the Mutinynet faucet, or any other mutinynet compatible wallet.

[!Screenshot of the receive screen after completing step 5](./public/step-5-voltage.png)

You are now done building the Bitcoin Tip Jar!