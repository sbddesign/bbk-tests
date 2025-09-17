// Voltage API service for creating Lightning Network payments
export class VoltageApiError extends Error {
  code?: string;
  
  constructor(message: string, code?: string) {
    super(message);
    this.name = 'VoltageApiError';
    this.code = code;
  }
}

export interface PaymentData {
  onchainAddress?: string;
  lightningInvoice?: string;
  paymentHash?: string;
}

export interface CreatePaymentRequest {
  amount: number; // in sats
  description?: string;
}

class VoltageApiService {
  constructor() {
    // Environment variables are now handled by Netlify functions
  }


  async createPayment(request: CreatePaymentRequest): Promise<PaymentData> {
    try {
      // Use Netlify function to avoid CORS issues
      const response = await fetch('/.netlify/functions/create-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          amount: request.amount,
          description: request.description || 'Improv Comedy Tip',
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new VoltageApiError(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      return {
        lightningInvoice: data.lightningInvoice,
        onchainAddress: data.onchainAddress,
        paymentHash: data.paymentHash,
      };
    } catch (error) {
      console.error('Voltage API error:', error);
      throw error;
    }
  }

  async checkPaymentStatus(paymentHash: string): Promise<{
    paid: boolean;
    amount?: number;
  }> {
    try {
      // Use Netlify function to avoid CORS issues
      const response = await fetch('/.netlify/functions/check-payment', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paymentHash: paymentHash,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new VoltageApiError(
          errorData.error || `HTTP error! status: ${response.status}`
        );
      }

      const data = await response.json();
      return {
        paid: data.paid,
        amount: data.amount,
      };
    } catch (error) {
      console.error('Error checking payment status:', error);
      throw error;
    }
  }
}

export const voltageApi = new VoltageApiService();
