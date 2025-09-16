import { voltageConfig } from '../config/voltage';
import { v4 as uuidv4 } from 'uuid';
import { convertUsdToSats } from './priceApi';

export interface CreateReceivePaymentRequest {
  id: string;
  payment_kind: 'bolt11' | 'onchain' | 'bip21';
  wallet_id: string;
  amount_msats: number;
  currency: 'btc' | 'usd';
  description?: string;
}

export interface PaymentData {
  amount_msats: number;
  payment_request: string; // Lightning invoice
}

export interface Payment {
  id: string;
  data: PaymentData;
  status: 'receiving' | 'completed' | 'failed' | 'pending' | 'expired';
}

export class VoltageApiError extends Error {
  constructor(message: string, public status?: number) {
    super(message);
    this.name = 'VoltageApiError';
  }
}

class VoltageApi {
  async createPayment(request: CreateReceivePaymentRequest): Promise<void> {
    const response = await fetch('/api/voltage-payments', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(request),
    });

    if (!response.ok) {
      throw new VoltageApiError(`HTTP ${response.status}: ${response.statusText}`, response.status);
    }
  }

  async getPayment(paymentId: string): Promise<Payment> {
    const response = await fetch(`/api/voltage-payments?id=${encodeURIComponent(paymentId)}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
    });

    if (!response.ok) {
      throw new VoltageApiError(`HTTP ${response.status}: ${response.statusText}`, response.status);
    }

    return await response.json();
  }
}

export const voltageApi = new VoltageApi();

export async function createTipPaymentMethods(
  amountUsd: number,
  description: string = 'Improv Comedy Tip'
): Promise<{ lightningInvoice?: string; payment: Payment }> {
  if (!Number.isFinite(amountUsd) || amountUsd <= 0) {
    throw new VoltageApiError('Amount must be a positive number');
  }

  const amountSats = await convertUsdToSats(amountUsd);
  const amountMsats = amountSats * 1000;
  const paymentId = uuidv4();
  
  const paymentRequest: CreateReceivePaymentRequest = {
    id: paymentId,
    payment_kind: 'bolt11',
    wallet_id: import.meta.env.DEV ? (voltageConfig.walletId as string) : 'server',
    amount_msats: amountMsats,
    currency: 'btc',
    description,
  };

  await voltageApi.createPayment(paymentRequest);
  
  // Poll for payment data
  let attempts = 0;
  while (attempts < 30) {
    const payment = await voltageApi.getPayment(paymentId);
    if (payment.data && payment.data.payment_request) {
      return {
        lightningInvoice: payment.data.payment_request,
        payment
      };
    }
    await new Promise(resolve => setTimeout(resolve, 1000));
    attempts++;
  }
  
  throw new VoltageApiError('Payment data not ready after maximum attempts');
}
