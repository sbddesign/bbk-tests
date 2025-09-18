import { useEffect, useMemo, useState } from 'react'
import '@sbddesign/bui-ui/tokens.css'
import { BuiAmountOptionTileReact as BuiAmountOptionTile, BuiButtonReact as BuiButton, BuiBitcoinQrDisplayReact as BuiBitcoinQrDisplay } from '@sbddesign/bui-ui/react'
import Recipient from './components/Recipient'
import { fetchBtcUsd, usdToSats } from './services/priceApi'
import { createInvoice } from './services/invoiceApi'

interface TipOption {
  id: number
  primaryAmount: number // USD
  secondaryAmount: number // sats (computed)
  emoji: string
  message: string
  selected: boolean
}

const baseTipOptions: TipOption[] = [
  { id: 1, primaryAmount: 5, secondaryAmount: 0, emoji: '🎭', message: 'Yes, and!', selected: false },
  { id: 2, primaryAmount: 10, secondaryAmount: 0, emoji: '😂', message: 'Big laugh', selected: false },
  { id: 3, primaryAmount: 20, secondaryAmount: 0, emoji: '🌟', message: 'Standing O', selected: false },
]

function App() {
  const [selectedAmountUsd, setSelectedAmountUsd] = useState<number | null>(null)
  const [tipOptionsState, setTipOptionsState] = useState<TipOption[]>(baseTipOptions)
  const [btcUsd, setBtcUsd] = useState<number | null>(null)
  const [invoice, setInvoice] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const AmountTile: any = BuiAmountOptionTile as any
  const Button: any = BuiButton as any
  const QrDisplay: any = BuiBitcoinQrDisplay as any

  useEffect(() => {
    fetchBtcUsd()
      .then(setBtcUsd)
      .catch(() => setBtcUsd(null))
  }, [])

  const usdToSatsRate = useMemo(() => {
    if (!btcUsd) return 0
    return 100_000_000 / btcUsd
  }, [btcUsd])

  const optionsWithSats = useMemo(
    () =>
      tipOptionsState.map((opt) => ({
        ...opt,
        secondaryAmount: Math.max(1, Math.floor(opt.primaryAmount * usdToSatsRate)),
      })),
    [tipOptionsState, usdToSatsRate],
  )

  const handleAmountSelect = (amountUsd: number) => {
    setInvoice(null)
    setSelectedAmountUsd(amountUsd)
    setTipOptionsState((prev) =>
      prev.map((opt) => ({ ...opt, selected: opt.primaryAmount === amountUsd })),
    )
  }

  const handleGenerateInvoice = async () => {
    if (!selectedAmountUsd || !btcUsd) return
    try {
      setIsLoading(true)
      const sats = usdToSats(selectedAmountUsd, btcUsd)
      const data = await createInvoice({ amountSats: sats, memo: 'Yes, And! tip' })
      const pr = (data.payment_request || data.invoice || '') as string
      if (pr) setInvoice(pr)
    } catch (e) {
      alert(String(e))
    } finally {
      setIsLoading(false)
    }
  }

  if (invoice) {
    return (
      <div className="w-full min-h-screen flex flex-col items-center justify-start py-10">
        <div className="w-full max-w-md px-4 flex flex-col items-center gap-6">
          <Recipient />
          <QrDisplay invoice={invoice} />
          <Button className="w-full" onClick={() => setInvoice(null)}>Back</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full min-h-screen flex flex-col items-center justify-start py-10">
      <div className="w-full max-w-md px-4 flex flex-col items-center gap-6">
        <Recipient />
        <div className="w-full grid grid-cols-1 gap-3">
          {optionsWithSats.map((option) => (
            <AmountTile
              key={option.id}
              amount={String(option.primaryAmount)}
              currency="usd"
              secondaryAmount={String(option.secondaryAmount)}
              secondaryCurrency="sats"
              emoji={option.emoji}
              message={option.message}
              selected={option.selected}
              onClick={() => handleAmountSelect(option.primaryAmount)}
            />
          ))}
        </div>
        {!!selectedAmountUsd && !!btcUsd && (
          <Button className="w-full" label={isLoading ? 'Generating…' : 'Continue'} onClick={handleGenerateInvoice} disabled={isLoading} />
        )}
      </div>
    </div>
  )
}

export default App
