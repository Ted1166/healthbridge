import { ApiPromise, WsProvider } from '@polkadot/api';
import { web3Accounts, web3Enable, web3FromAddress } from '@polkadot/extension-dapp';
import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';

// Testnet RPC endpoints
const RPC_ENDPOINTS = {
  westend: 'wss://westend-rpc.polkadot.io',
  paseo: 'wss://paseo.rpc.amforc.com',
  local: 'ws://127.0.0.1:9944',
};

// Contract addresses (to be updated after deployment)
export const CONTRACT_ADDRESSES = {
  healthRegistry: '5GrwvaEF5zXb26Fz9rcQpDWS57CtERHpNehXCPcNoHGKutQY', // Placeholder
  consultationEscrow: '5FHneW46xGXgs5mUiveU4sbTyGBzmstUspZC92UhjJM694ty', // Placeholder
  medicalRecordsAccess: '5FLSigC9HGRKVhB9FiEo4Y3koPsNmBmLJbpXg2mp1hXcS59Y', // Placeholder
};

let api: ApiPromise | null = null;

/**
 * Initialize Polkadot API connection
 */
export async function initializeApi(endpoint: string = RPC_ENDPOINTS.westend): Promise<ApiPromise> {
  if (api) {
    return api;
  }

  try {
    const wsProvider = new WsProvider(endpoint);
    api = await ApiPromise.create({ provider: wsProvider });
    
    console.log('✅ Connected to Polkadot network');
    console.log(`Chain: ${await api.rpc.system.chain()}`);
    
    return api;
  } catch (error) {
    console.error('❌ Failed to initialize Polkadot API:', error);
    throw new Error('Could not connect to Polkadot network');
  }
}

/**
 * Get the current API instance
 */
export function getApi(): ApiPromise | null {
  return api;
}

/**
 * Enable wallet extension and get accounts
 */
export async function enableWallet(appName: string = 'HealthBridge'): Promise<InjectedAccountWithMeta[]> {
  try {
    // Request access to wallet extensions
    const extensions = await web3Enable(appName);
    
    if (extensions.length === 0) {
      throw new Error('No wallet extension found. Please install Polkadot.js, Talisman, or SubWallet.');
    }

    console.log(`✅ Found ${extensions.length} wallet extension(s)`);
    
    // Get all accounts from enabled extensions
    const accounts = await web3Accounts();
    
    if (accounts.length === 0) {
      throw new Error('No accounts found in wallet. Please create an account first.');
    }

    console.log(`✅ Found ${accounts.length} account(s)`);
    
    return accounts;
  } catch (error) {
    console.error('❌ Failed to enable wallet:', error);
    throw error;
  }
}

/**
 * Get signer for an account
 */
export async function getSigner(accountAddress: string) {
  try {
    const injector = await web3FromAddress(accountAddress);
    return injector.signer;
  } catch (error) {
    console.error('❌ Failed to get signer:', error);
    throw new Error('Could not get signer for account');
  }
}

/**
 * Format balance from blockchain units to human-readable DOT
 */
export function formatBalance(balance: bigint | string, decimals: number = 12): string {
  const balanceBigInt = typeof balance === 'string' ? BigInt(balance) : balance;
  const divisor = BigInt(10 ** decimals);
  const integerPart = balanceBigInt / divisor;
  const fractionalPart = balanceBigInt % divisor;
  
  // Show 4 decimal places
  const fractionalStr = fractionalPart.toString().padStart(decimals, '0').slice(0, 4);
  
  return `${integerPart}.${fractionalStr}`;
}

/**
 * Parse human-readable DOT amount to blockchain units
 */
export function parseBalance(amount: string, decimals: number = 12): bigint {
  const [integerPart, fractionalPart = ''] = amount.split('.');
  const paddedFractional = fractionalPart.padEnd(decimals, '0').slice(0, decimals);
  const fullAmount = integerPart + paddedFractional;
  return BigInt(fullAmount);
}

/**
 * Disconnect and cleanup
 */
export async function disconnectApi(): Promise<void> {
  if (api) {
    await api.disconnect();
    api = null;
    console.log('✅ Disconnected from Polkadot network');
  }
}

/**
 * Check if wallet extension is installed
 */
export function isWalletInstalled(): boolean {
  return typeof window !== 'undefined' && !!(window as any).injectedWeb3;
}

/**
 * Get chain info
 */
export async function getChainInfo() {
  if (!api) {
    throw new Error('API not initialized');
  }

  const [chain, nodeName, nodeVersion] = await Promise.all([
    api.rpc.system.chain(),
    api.rpc.system.name(),
    api.rpc.system.version(),
  ]);

  return {
    chain: chain.toString(),
    nodeName: nodeName.toString(),
    nodeVersion: nodeVersion.toString(),
  };
}

export { RPC_ENDPOINTS };