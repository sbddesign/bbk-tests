import { useState, useEffect } from 'react'
import { 
  BuiAmountOptionTileReact as BuiAmountOptionTile,
  BuiButtonReact as BuiButton
} from '@sbddesign/bui-ui/react'
import '@sbddesign/bui-ui/tokens.css'
import { getCurrentBtcPrice } from './services/priceApi'

interface TipOption {
  id: number;
  primaryAmount: number;
  secondaryAmount: number;
  emoji: string;
  message: string;
  selected: boolean;
}

const baseTipOptions = [
  { id: 1, primaryAmount: 5, emoji: '🎭', message: 'Bravo!', selected: false },
  { id: 2, primaryAmount: 10, emoji: '🎪', message: 'Encore!', selected: false },
  { id: 3, primaryAmount: 25, emoji: '🎨', message: 'Standing O!', selected: false }
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
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-indigo-900 text-white">
      <div className="text-center flex flex-col gap-8 p-6 max-w-6xl mx-auto">
        <header className="flex flex-col gap-4 pt-8">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-yellow-400 to-orange-500 bg-clip-text text-transparent">
            🎭 Improv Comedy Tip Jar
          </h1>
          <p className="text-xl text-gray-300">
            Support our local improv troupe with Bitcoin Lightning tips!
          </p>
          <p className="text-lg text-gray-400">
            "Yes, and... thank you!" 💝
          </p>
        </header>

        {isLoadingPrices ? (
          <div className="flex flex-col items-center gap-4 py-12">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-yellow-400"></div>
            <p className="text-lg">Loading Bitcoin prices...</p>
            <p className="text-sm text-gray-400">Getting the latest exchange rates...</p>
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

        <div className="flex flex-col items-center gap-4">
          <BuiButton
            styleType="filled"
            size="large"
            label="Continue to Payment"
            disabled={!selectedAmount ? "true" : ""}
            onClick={() => console.log('Continue clicked')}
          />
          <p className="text-sm text-gray-400 text-center max-w-md">
            Your tip helps us keep the laughs coming! All payments are processed securely through the Bitcoin Lightning Network.
          </p>
        </div>

        <footer className="pt-8 border-t border-gray-700">
          <p className="text-sm text-gray-500">
            Made with ❤️ for the improv community • Powered by Bitcoin Lightning
          </p>
        </footer>
      </div>
    </div>
  )
}

export default App
