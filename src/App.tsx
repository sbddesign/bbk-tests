import { useState, useEffect } from 'react'
import { 
  BuiAmountOptionTileReact as BuiAmountOptionTile,
  BuiButtonReact as BuiButton,
  BuiNumpadReact as BuiNumpad
} from '@sbddesign/bui-ui/react'
import '@sbddesign/bui-ui/tokens.css'
// import { getCurrentBtcPrice, convertUsdToSats } from './services/priceApi'

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
        const btcPrice = 1
        // const btcPrice = await getCurrentBtcPrice()
        
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