const IS_DEV = import.meta.env.DEV;

export const voltageConfig = {
  apiKey: IS_DEV ? import.meta.env.VITE_VOLTAGE_API_KEY : undefined,
  orgId: IS_DEV ? import.meta.env.VITE_VOLTAGE_ORG_ID : undefined,
  envId: IS_DEV ? import.meta.env.VITE_VOLTAGE_ENV_ID : undefined,
  walletId: IS_DEV ? import.meta.env.VITE_VOLTAGE_WALLET_ID : undefined,
  baseUrl: IS_DEV ? '/api/voltage' : 'https://voltageapi.com/v1'
};

export function isVoltageConfigured(): boolean {
  if (IS_DEV) {
    return !!(voltageConfig.apiKey && voltageConfig.orgId && voltageConfig.envId && voltageConfig.walletId);
  }
  return true;
}
