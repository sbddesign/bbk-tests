import { useState, useEffect } from 'react'
import { 
  BuiAmountOptionTileReact as BuiAmountOptionTile,
  BuiButtonReact as BuiButton
} from '@sbddesign/bui-ui/react'
import '@sbddesign/bui-ui/tokens.css'
import { Recipient } from './components/Recipient'
import { getCurrentBtcPrice, PriceApiError } from './services/priceApi'

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

      {/* Tip options */}
      {!isLoadingPrices && (
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
    </div>
  )
}

export default App
