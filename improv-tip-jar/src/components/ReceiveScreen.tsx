import { useState, useEffect } from 'react';
import {
  BuiBitcoinQrDisplayReact as BuiBitcoinQrDisplay,
  BuiButtonReact as BuiButton,
  BuiMoneyValueReact as BuiMoneyValue,
  BuiBitcoinValueReact as BuiBitcoinValue
} from '@sbddesign/bui-ui/react';
import { Recipient } from './Recipient';

// Import icons (you may need to adjust these based on the actual icon library)
const CheckCircleIcon = () => (
  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  </svg>
);

const CopyIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const ArrowLeftIcon = () => (
  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
  </svg>
);

interface PaymentData {
  onchainAddress?: string;
  lightningInvoice?: string;
}

interface ReceiveScreenProps {
  amount: number;
  bitcoinAmount: number;
  onGoBack: () => void;
  onCopy: () => void;
}

function ReceiveScreen({ amount, bitcoinAmount, onGoBack, onCopy }: ReceiveScreenProps) {
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isPaymentComplete, setIsPaymentComplete] = useState(false);

  // Mock payment creation - in a real app, this would call the Voltage API
  useEffect(() => {
    const createPayment = async () => {
      try {
        setIsLoading(true);
        setError(null);

        // Simulate API call delay
        await new Promise(resolve => setTimeout(resolve, 1000));

        // Mock payment data - in production, this would come from Voltage API
        const mockPaymentData: PaymentData = {
          onchainAddress: 'bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh',
          lightningInvoice: 'lnbc' + Math.random().toString(36).substring(2, 15) + '...'
        };

        setPaymentData(mockPaymentData);
      } catch (err) {
        console.error('Payment creation error:', err);
        if (err instanceof Error) {
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
        <h1 className="text-4xl font-normal text-center">
          {import.meta.env.VITE_TIP_JAR_SLOGAN || "Send us a tip"}
        </h1>
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

export default ReceiveScreen;
