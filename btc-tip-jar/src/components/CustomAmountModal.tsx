import { useState } from 'react';
import {
  BuiButtonReact as BuiButton,
  BuiInputReact as BuiInput,
  BuiNumpadReact as BuiNumpad
} from '@sbddesign/bui-ui/react';

interface CustomAmountModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (amount: number) => void;
  bitcoinPrice: number;
}

export default function CustomAmountModal({ 
  isOpen, 
  onClose, 
  onConfirm, 
  bitcoinPrice 
}: CustomAmountModalProps) {
  const [customAmount, setCustomAmount] = useState('');

  if (!isOpen) return null;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow positive numbers with up to 2 decimal places
    if (value === '' || /^\d*\.?\d{0,2}$/.test(value)) {
      setCustomAmount(value);
    }
  };

  const handleNumpadClick = (event: any) => {
    const target = event.target;
    const value = target.textContent || target.value;
    
    if (value === '⌫' || value === 'backspace') {
      // Handle backspace
      setCustomAmount(prev => prev.slice(0, -1));
    } else if (/^\d$/.test(value)) {
      // Handle number input
      setCustomAmount(prev => {
        const newValue = prev + value;
        // Limit to reasonable amount (e.g., max $99999.99)
        if (parseFloat(newValue) <= 99999.99) {
          return newValue;
        }
        return prev;
      });
    } else if (value === '.' && !customAmount.includes('.')) {
      // Handle decimal point (only if not already present)
      setCustomAmount(prev => prev + '.');
    }
  };

  const handleConfirm = () => {
    const amount = parseFloat(customAmount);
    if (amount > 0) {
      onConfirm(amount);
      setCustomAmount('');
      onClose();
    }
  };

  const handleCancel = () => {
    setCustomAmount('');
    onClose();
  };

  const satsAmount = customAmount ? Math.round((parseFloat(customAmount) / bitcoinPrice) * 100000000) : 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-[var(--background)] p-8 rounded-lg max-w-md w-full mx-4">
        <h2 className="text-2xl font-semibold mb-6 text-center">Enter Custom Amount</h2>
        
        <div className="mb-6">
          <BuiInput
            placeholder="Enter amount in USD"
            value={customAmount}
            onChange={handleInputChange}
            type="text"
          />
          {customAmount && (
            <p className="text-sm text-[var(--text-secondary)] mt-2">
              ≈ {satsAmount.toLocaleString()} sats
            </p>
          )}
        </div>

        <div className="mb-6" onClick={handleNumpadClick}>
          <BuiNumpad />
        </div>

        <div className="flex gap-4">
          <BuiButton
            label="Cancel"
            styleType="outline"
            size="large"
            wide="true"
            onClick={handleCancel}
          />
          <BuiButton
            label="Confirm"
            styleType="filled"
            size="large"
            wide="true"
            disabled={!customAmount || parseFloat(customAmount) <= 0 ? "true" : ""}
            onClick={handleConfirm}
          />
        </div>
      </div>
    </div>
  );
}
