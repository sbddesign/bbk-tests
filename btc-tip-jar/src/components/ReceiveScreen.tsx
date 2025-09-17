import { useState, useEffect } from 'react';
import {
  BuiButtonReact as BuiButton,
  BuiBitcoinQrDisplayReact as BuiBitcoinQrDisplay,
  BuiMoneyValueReact as BuiMoneyValue,
  BuiBitcoinValueReact as BuiBitcoinValue
} from '@sbddesign/bui-ui/react';
import { Recipient } from './Recipient';

// Icons (you may need to create these or use alternatives)
const CheckCircleIcon = () => <span>✓</span>;
const CopyIcon = () => <span>📋</span>;
const ArrowLeftIcon = () => <span>←</span>;

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

class VoltageApiError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'VoltageApiError';
  }
}

export default function ReceiveScreen({ 
  amount, 
  bitcoinAmount, 
  onGoBack, 
  onCopy 
}: ReceiveScreenProps) {
  const [paymentData, setPaymentData] = useState<PaymentData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isCopied, setIsCopied] = useState(false);
  const [isPaymentComplete, setIsPaymentComplete] = useState(false);

  // Create payment request when component mounts
  useEffect(() => {
    const createPayment = async () => {
      setIsLoading(true);
      setError(null);

      try {
        // Check if all required Voltage environment variables are present
        const apiKey = import.meta.env.VITE_VOLTAGE_API_KEY;
        const orgId = import.meta.env.VITE_VOLTAGE_ORG_ID;
        const envId = import.meta.env.VITE_VOLTAGE_ENV_ID;
        const walletId = import.meta.env.VITE_VOLTAGE_WALLET_ID;

        if (!apiKey || !orgId || !envId || !walletId) {
          throw new VoltageApiError('Missing Voltage API configuration. Please check your environment variables.');
        }

        // Convert USD amount to satoshis
        const amountSats = bitcoinAmount;

        // Create Lightning invoice via Voltage API
        const response = await fetch(`https://api.voltage.cloud/v1/orgs/${orgId}/envs/${envId}/wallets/${walletId}/invoices`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            amount_sats: amountSats,
            memo: `Tip for Improv Troupe - $${amount}`,
            expiry: 3600 // 1 hour expiry
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({}));
          throw new VoltageApiError(
            errorData.message || `API request failed with status ${response.status}`
          );
        }

        const invoiceData = await response.json();
        
        if (invoiceData.payment_request) {
          setPaymentData({
            lightningInvoice: invoiceData.payment_request,
            onchainAddress: undefined // Voltage primarily focuses on Lightning
          });
        } else {
          throw new VoltageApiError('Invalid response from Voltage API - no payment request received');
        }

        // Start polling for payment status
        const pollPaymentStatus = async () => {
          try {
            const statusResponse = await fetch(`https://api.voltage.cloud/v1/orgs/${orgId}/envs/${envId}/wallets/${walletId}/invoices/${invoiceData.r_hash}`, {
              headers: {
                'Authorization': `Bearer ${apiKey}`,
              },
            });

            if (statusResponse.ok) {
              const statusData = await statusResponse.json();
              if (statusData.state === 'SETTLED') {
                setIsPaymentComplete(true);
                return true;
              }
            }
          } catch (err) {
            console.error('Error checking payment status:', err);
          }
          return false;
        };

        // Poll every 5 seconds for payment completion
        const pollInterval = setInterval(async () => {
          const isComplete = await pollPaymentStatus();
          if (isComplete) {
            clearInterval(pollInterval);
          }
        }, 5000);

        // Clean up interval on component unmount
        return () => clearInterval(pollInterval);

      } catch (err) {
        console.error('Error creating payment:', err);
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
  }, [amount, bitcoinAmount]);

  const handleCopy = async () => {
    try {
      if (!paymentData?.lightningInvoice) {
        console.error('No payment data available to copy');
        return;
      }

      await navigator.clipboard.writeText(paymentData.lightningInvoice);
      setIsCopied(true);
      onCopy();

      // Reset copied state after 2 seconds
      setTimeout(() => {
        setIsCopied(false);
      }, 2000);
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
        <h1 className="text-4xl font-normal text-center">{import.meta.env.VITE_TIP_JAR_SLOGAN || "Thanks for supporting our improv!"}</h1>
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
