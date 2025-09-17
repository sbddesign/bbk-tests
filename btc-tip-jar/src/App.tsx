import { useState, useEffect } from 'react'
import {
  BuiAmountOptionTileReact as BuiAmountOptionTile,
  BuiButtonReact as BuiButton
} from '@sbddesign/bui-ui/react'
import '@sbddesign/bui-ui/tokens.css'
import { Recipient } from './components/Recipient'
import ReceiveScreen from './components/ReceiveScreen'
import CustomAmountModal from './components/CustomAmountModal'

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
    emoji: '🎭',
    message: 'Bravo!',
    selected: false
  },
  {
    id: 2,
    primaryAmount: 10,
    secondaryAmount: 10000,
    emoji: '👏',
    message: 'Amazing!',
    selected: false
  },
  {
    id: 3,
    primaryAmount: 20,
    secondaryAmount: 20000,
    emoji: '🌟',
    message: 'Spectacular!',
    selected: false
  },
  {
    id: 4,
    primaryAmount: 50,
    secondaryAmount: 50000,
    emoji: '🎪',
    message: 'Show-stopping!',
    selected: false
  }
];

function App() {
  const [tipOptionsState, setTipOptionsState] = useState<TipOption[]>(baseTipOptions)
  const [selectedAmount, setSelectedAmount] = useState<number | null>(null)
  const [customAmountSats, setCustomAmountSats] = useState(0)
  const [showReceiveScreen, setShowReceiveScreen] = useState(false)
  const [bitcoinPrice, setBitcoinPrice] = useState<number>(0)
  const [showCustomModal, setShowCustomModal] = useState(false)

  // Fetch Bitcoin price from Kraken API
  useEffect(() => {
    const fetchBitcoinPrice = async () => {
      try {
        const response = await fetch('https://api.kraken.com/0/public/Ticker?pair=XBTUSD')
        const data = await response.json()
        
        if (data.result && data.result.XXBTZUSD) {
          const price = parseFloat(data.result.XXBTZUSD.c[0])
          setBitcoinPrice(price)
          
          // Update tip options with current Bitcoin price
          const updatedOptions = baseTipOptions.map(option => ({
            ...option,
            secondaryAmount: Math.round((option.primaryAmount / price) * 100000000) // Convert to sats
          }))
          setTipOptionsState(updatedOptions)
        }
      } catch (error) {
        console.error('Error fetching Bitcoin price:', error)
        // Fallback to default values if API fails
        setBitcoinPrice(50000) // Default fallback price
      }
    }

    fetchBitcoinPrice()
  }, [])

  const handleTipSelection = (tipId: number) => {
    const selectedTip = tipOptionsState.find(tip => tip.id === tipId)
    if (selectedTip) {
      setSelectedAmount(selectedTip.primaryAmount)
      
      // Update the selected state for all tips
      setTipOptionsState(prev => 
        prev.map(tip => ({
          ...tip,
          selected: tip.id === tipId
        }))
      )
    }
  }

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

  const handleCustomAmount = () => {
    setShowCustomModal(true)
  }

  const handleCustomAmountConfirm = (amount: number) => {
    setSelectedAmount(amount)
    setCustomAmountSats(Math.round((amount / bitcoinPrice) * 100000000))
    
    // Deselect all preset options
    setTipOptionsState(prev => 
      prev.map(tip => ({
        ...tip,
        selected: false
      }))
    )
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

  return (
    <div className="bg-[var(--background)] min-h-screen flex flex-col items-center justify-start p-12 gap-12">
      {/* Header Section */}
      <div className="flex flex-col items-center gap-2">
        <Recipient />
        <h1 className="text-4xl font-normal text-center">{import.meta.env.VITE_TIP_JAR_SLOGAN || "Support our improv shows!"}</h1>
      </div>

      {/* Tip Options Grid */}
      <div className="grid grid-cols-2 gap-4 w-full max-w-[392px]">
        {tipOptionsState.map((tip) => (
          <BuiAmountOptionTile
            key={tip.id}
            primaryAmount={tip.primaryAmount.toString()}
            primarySymbol="$"
            secondaryAmount={tip.secondaryAmount.toString()}
            secondarySymbol="sats"
            emoji={tip.emoji}
            message={tip.message}
            selected={tip.selected ? "true" : ""}
            onClick={() => handleTipSelection(tip.id)}
          />
        ))}
      </div>

      {/* Custom Amount Button */}
      <div className="w-full max-w-[392px]">
        <BuiAmountOptionTile
          primaryAmount="Custom"
          primarySymbol=""
          secondaryAmount=""
          secondarySymbol=""
          emoji="💡"
          message="Your choice"
          selected=""
          onClick={handleCustomAmount}
        />
      </div>

      {/* Continue Button */}
      <div className="w-[314px]">
        <BuiButton
          styleType="filled"
          size="large"
          label="Continue"
          disabled={!selectedAmount ? "true" : ""}
          onClick={handleContinue}
        />
      </div>

      {/* Custom Amount Modal */}
      <CustomAmountModal
        isOpen={showCustomModal}
        onClose={() => setShowCustomModal(false)}
        onConfirm={handleCustomAmountConfirm}
        bitcoinPrice={bitcoinPrice}
      />
    </div>
  )
}

export default App