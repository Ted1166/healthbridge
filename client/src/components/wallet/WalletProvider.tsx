import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { InjectedAccountWithMeta } from '@polkadot/extension-inject/types';
import { ApiPromise } from '@polkadot/api';
import { initializeApi, enableWallet, getApi, disconnectApi, formatBalance } from '@/lib/polkadot';

interface WalletContextType {
  // Connection state
  isConnected: boolean;
  isConnecting: boolean;
  error: string | null;
  
  // Account data
  accounts: InjectedAccountWithMeta[];
  selectedAccount: InjectedAccountWithMeta | null;
  balance: string | null;
  
  // API instance
  api: ApiPromise | null;
  
  // Actions
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  selectAccount: (account: InjectedAccountWithMeta) => void;
  refreshBalance: () => Promise<void>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

interface WalletProviderProps {
  children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);
  const [isConnecting, setIsConnecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [accounts, setAccounts] = useState<InjectedAccountWithMeta[]>([]);
  const [selectedAccount, setSelectedAccount] = useState<InjectedAccountWithMeta | null>(null);
  const [balance, setBalance] = useState<string | null>(null);
  const [api, setApi] = useState<ApiPromise | null>(null);

  // Initialize API on mount
  useEffect(() => {
    const init = async () => {
      try {
        const apiInstance = await initializeApi();
        setApi(apiInstance);
      } catch (err) {
        console.error('Failed to initialize API:', err);
        setError('Failed to connect to blockchain network');
      }
    };

    init();

    // Cleanup on unmount
    return () => {
      disconnectApi();
    };
  }, []);

  // Auto-connect if wallet was previously connected (stored in localStorage)
  useEffect(() => {
    const autoConnect = async () => {
      const previouslyConnected = localStorage.getItem('walletConnected');
      const previousAccount = localStorage.getItem('selectedAccount');
      
      if (previouslyConnected === 'true' && previousAccount) {
        try {
          await connect();
          
          // Restore previously selected account
          const account = accounts.find(acc => acc.address === previousAccount);
          if (account) {
            selectAccount(account);
          }
        } catch (err) {
          console.error('Auto-connect failed:', err);
        }
      }
    };

    if (api && !isConnected) {
      autoConnect();
    }
  }, [api]);

  // Refresh balance when selected account changes
  useEffect(() => {
    if (selectedAccount) {
      refreshBalance();
      
      // Set up interval to refresh balance every 10 seconds
      const interval = setInterval(refreshBalance, 10000);
      return () => clearInterval(interval);
    }
  }, [selectedAccount, api]);

  const connect = async () => {
    setIsConnecting(true);
    setError(null);

    try {
      // Enable wallet and get accounts
      const walletAccounts = await enableWallet('HealthBridge');
      
      if (walletAccounts.length === 0) {
        throw new Error('No accounts found in wallet');
      }

      setAccounts(walletAccounts);
      setSelectedAccount(walletAccounts[0]); // Auto-select first account
      setIsConnected(true);
      
      // Save connection state
      localStorage.setItem('walletConnected', 'true');
      localStorage.setItem('selectedAccount', walletAccounts[0].address);
      
      console.log('✅ Wallet connected successfully');
    } catch (err: any) {
      console.error('❌ Wallet connection failed:', err);
      setError(err.message || 'Failed to connect wallet');
      setIsConnected(false);
    } finally {
      setIsConnecting(false);
    }
  };

  const disconnect = async () => {
    setAccounts([]);
    setSelectedAccount(null);
    setBalance(null);
    setIsConnected(false);
    
    // Clear stored connection state
    localStorage.removeItem('walletConnected');
    localStorage.removeItem('selectedAccount');
    
    console.log('✅ Wallet disconnected');
  };

  const selectAccount = (account: InjectedAccountWithMeta) => {
    setSelectedAccount(account);
    localStorage.setItem('selectedAccount', account.address);
    console.log(`✅ Selected account: ${account.address}`);
  };

  const refreshBalance = async () => {
    if (!selectedAccount || !api) {
      return;
    }

    try {
      const accountInfo: any = await api.query.system.account(selectedAccount.address);
      const freeBalance = accountInfo.data.free.toBigInt();
      const formattedBalance = formatBalance(freeBalance);
      
      setBalance(formattedBalance);
    } catch (err) {
      console.error('Failed to fetch balance:', err);
    }
  };

  const value: WalletContextType = {
    isConnected,
    isConnecting,
    error,
    accounts,
    selectedAccount,
    balance,
    api,
    connect,
    disconnect,
    selectAccount,
    refreshBalance,
  };

  return <WalletContext.Provider value={value}>{children}</WalletContext.Provider>;
};

export const useWallet = () => {
  const context = useContext(WalletContext);
  
  if (context === undefined) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  
  return context;
};