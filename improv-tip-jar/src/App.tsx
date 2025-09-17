import { useState, useEffect } from 'react'
import {
  BuiAmountOptionTileReact as BuiAmountOptionTile,
  BuiButtonReact as BuiButton,
  BuiInputReact as BuiInput
} from '@sbddesign/bui-ui/react'
import '@sbddesign/bui-ui/tokens.css'
import { Recipient } from './components/Recipient'
import ReceiveScreen from './components/ReceiveScreen'

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
    primaryAmount: 5,
    secondaryAmount: 5000,
    emoji: '😄',
    message: 'Laugh',
    selected: false
  },
  {
    id: 2,
    primaryAmount: 10,
    secondaryAmount: 10000,
    emoji: '🤣',
    message: 'Giggle',
    selected: false
  },
  {
    id: 3,
    primaryAmount: 20,
    secondaryAmount: 20000,
    emoji: '😂',
    message: 'Chuckle',
    selected: false
  },
  {
    id: 4,
    primaryAmount: 50,
    secondaryAmount: 50000,
    emoji: '🤩',
    message: 'ROFL',
    selected: false
  }
];

function App() {
  const [tipOptionsState, setTipOptionsState] = useState<TipOption[]>(baseTipOptions);
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null);
  const [customAmount, setCustomAmount] = useState<string>('');
  const [customAmountSats, setCustomAmountSats] = useState<number>(0);
  const [bitcoinPrice, setBitcoinPrice] = useState<number>(0);
  const [showReceiveScreen, setShowReceiveScreen] = useState(false);

  // Fetch Bitcoin price from Kraken API
  useEffect(() => {
    const fetchBitcoinPrice = async () => {
      try {
        const response = await fetch('https://api.kraken.com/0/public/Ticker?pair=XBTUSD');
        const data = await response.json();
        const price = parseFloat(data.result.XXBTZUSD.c[0]);
        setBitcoinPrice(price);
        
        // Update tip options with calculated sat amounts
        const updatedOptions = baseTipOptions.map(option => ({
          ...option,
          secondaryAmount: Math.round((option.primaryAmount / price) * 100000000)
        }));
        setTipOptionsState(updatedOptions);
      } catch (error) {
        console.error('Failed to fetch Bitcoin price:', error);
        // Use fallback price if API fails
        setBitcoinPrice(50000);
      }
    };

    fetchBitcoinPrice();
  }, []);

  // Calculate custom amount in sats when custom amount changes
  useEffect(() => {
    if (customAmount && bitcoinPrice > 0) {
      const amount = parseFloat(customAmount);
      if (!isNaN(amount)) {
        const sats = Math.round((amount / bitcoinPrice) * 100000000);
        setCustomAmountSats(sats);
      }
    } else {
      setCustomAmountSats(0);
    }
  }, [customAmount, bitcoinPrice]);

  const handleOptionSelect = (optionId: number) => {
    setTipOptionsState(prev => 
      prev.map(option => ({
        ...option,
        selected: option.id === optionId
      }))
    );
    setSelectedAmount(tipOptionsState.find(option => option.id === optionId)?.primaryAmount || null);
    setCustomAmount(''); // Clear custom amount when selecting preset
  };

  const handleCustomAmountChange = (value: string) => {
    setCustomAmount(value);
    // Clear any selected preset when typing custom amount
    setTipOptionsState(prev => 
      prev.map(option => ({
        ...option,
        selected: false
      }))
    );
    setSelectedAmount(null);
  };

  const handleContinue = () => {
    if (selectedAmount || (customAmount && parseFloat(customAmount) > 0)) {
      console.log(`Proceeding with tip amount: $${selectedAmount || customAmount}`)
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
  if (showReceiveScreen && (selectedAmount || (customAmount && parseFloat(customAmount) > 0))) {
    // Calculate bitcoin amount for the selected amount
    const amount = selectedAmount || parseFloat(customAmount);
    const selectedOption = tipOptionsState.find(option => option.primaryAmount === selectedAmount);
    const bitcoinAmount = selectedOption?.secondaryAmount || customAmountSats;

    return (
      <ReceiveScreen
        amount={amount}
        bitcoinAmount={bitcoinAmount}
        onGoBack={handleGoBack}
        onCopy={handleCopy}
      />
    );
  }

  return (
    <div className="bg-[var(--background)] min-h-screen flex flex-col items-center justify-start p-12 gap-12">
      {/* Header Section */}
      <div className="flex flex-col items-center gap-2">
        <Recipient />
        <h1 className="text-4xl font-normal text-center">
          {import.meta.env.VITE_TIP_JAR_SLOGAN || "Support our improv comedy!"}
        </h1>
        <p className="text-[var(--text-secondary)] text-center max-w-md">
          Help us keep the laughs coming! Your Bitcoin tips support our local improv comedy group.
        </p>
      </div>

      {/* Amount Selection */}
      <div className="w-full max-w-md">
        <h2 className="text-2xl font-normal text-center mb-6">Choose your tip amount</h2>
        
        {/* Preset Amount Options */}
        <div className="grid grid-cols-2 gap-4 mb-6">
          {tipOptionsState.map((option) => (
            <BuiAmountOptionTile
              key={option.id}
              primaryAmount={option.primaryAmount}
              secondaryAmount={option.secondaryAmount}
              emoji={option.emoji}
              message={option.message}
              selected={option.selected}
              onClick={() => handleOptionSelect(option.id)}
            />
          ))}
        </div>

        {/* Custom Amount Input */}
        <div className="mb-6">
          <BuiInput
            label="Custom amount (USD)"
            placeholder="Enter amount"
            value={customAmount}
            onChange={(e) => handleCustomAmountChange((e.target as HTMLInputElement).value)}
          />
          {customAmount && parseFloat(customAmount) > 0 && (
            <div className="mt-2 text-center text-[var(--text-secondary)]">
              ≈ {customAmountSats.toLocaleString()} sats
            </div>
          )}
        </div>

        {/* Continue Button */}
        <BuiButton
          styleType="filled"
          size="large"
          label="Continue"
          disabled={!selectedAmount && (!customAmount || parseFloat(customAmount) <= 0) ? "true" : ""}
          onClick={handleContinue}
        />
      </div>
    </div>
  );
}

export default App;
