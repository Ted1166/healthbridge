import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Wallet, ChevronDown, Copy, LogOut, CheckCircle, AlertCircle } from 'lucide-react';
import { useWallet } from './WalletProvider';
import { toast } from '@/hooks/use-toast';

interface WalletConnectProps {
  variant?: 'default' | 'hero' | 'outline' | 'ghost';
  size?: 'default' | 'sm' | 'lg';
  className?: string;
}

export const WalletConnect: React.FC<WalletConnectProps> = ({
  variant = 'hero',
  size = 'default',
  className = '',
}) => {
  const {
    isConnected,
    isConnecting,
    error,
    accounts,
    selectedAccount,
    balance,
    connect,
    disconnect,
    selectAccount,
  } = useWallet();

  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const handleConnect = async () => {
    try {
      await connect();
      toast({
        title: '✅ Wallet Connected',
        description: 'Successfully connected to your wallet',
      });
    } catch (err: any) {
      toast({
        title: '❌ Connection Failed',
        description: err.message || 'Failed to connect wallet',
        variant: 'destructive',
      });
    }
  };

  const handleDisconnect = async () => {
    await disconnect();
    setIsDropdownOpen(false);
    toast({
      title: 'Wallet Disconnected',
      description: 'Your wallet has been disconnected',
    });
  };

  const handleCopyAddress = () => {
    if (selectedAccount) {
      navigator.clipboard.writeText(selectedAccount.address);
      toast({
        title: 'Address Copied',
        description: 'Wallet address copied to clipboard',
      });
    }
  };

  const handleAccountSelect = (account: any) => {
    selectAccount(account);
    toast({
      title: 'Account Selected',
      description: `Switched to ${account.meta.name || 'Account'}`,
    });
  };

  const truncateAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  const getAccountInitials = (name?: string) => {
    if (!name) return '??';
    return name
      .split(' ')
      .map((word) => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  // Show error state
  if (error && !isConnected) {
    return (
      <Button variant="outline" size={size} className={className} disabled>
        <AlertCircle className="w-4 h-4 mr-2" />
        Connection Error
      </Button>
    );
  }

  // Show loading state
  if (isConnecting) {
    return (
      <Button variant={variant} size={size} className={className} disabled>
        <div className="w-4 h-4 mr-2 border-2 border-current border-t-transparent rounded-full animate-spin" />
        Connecting...
      </Button>
    );
  }

  // Show disconnect button when connected
  if (isConnected && selectedAccount) {
    return (
      <DropdownMenu open={isDropdownOpen} onOpenChange={setIsDropdownOpen}>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size={size} className={`${className} gap-2`}>
            <Avatar className="w-6 h-6 bg-gradient-hero">
              <AvatarFallback className="text-primary-foreground text-xs">
                {getAccountInitials(selectedAccount.meta.name)}
              </AvatarFallback>
            </Avatar>
            <div className="flex flex-col items-start">
              <span className="text-sm font-semibold">
                {selectedAccount.meta.name || 'Account'}
              </span>
              {balance && (
                <span className="text-xs text-muted-foreground">
                  {balance} DOT
                </span>
              )}
            </div>
            <ChevronDown className="w-4 h-4 ml-2" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-72">
          <DropdownMenuLabel className="flex items-center justify-between">
            <span>Connected Wallet</span>
            <Badge variant="secondary" className="bg-success text-success-foreground">
              <CheckCircle className="w-3 h-3 mr-1" />
              Connected
            </Badge>
          </DropdownMenuLabel>
          <DropdownMenuSeparator />
          
          {/* Current Account Info */}
          <div className="px-2 py-3 space-y-2">
            <div className="flex items-center gap-3">
              <Avatar className="w-10 h-10 bg-gradient-hero">
                <AvatarFallback className="text-primary-foreground">
                  {getAccountInitials(selectedAccount.meta.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-sm">
                  {selectedAccount.meta.name || 'Unnamed Account'}
                </div>
                <div className="text-xs text-muted-foreground font-mono">
                  {truncateAddress(selectedAccount.address)}
                </div>
              </div>
            </div>
            
            {balance && (
              <div className="flex items-center justify-between p-2 bg-secondary rounded-lg">
                <span className="text-sm text-muted-foreground">Balance</span>
                <span className="font-semibold">{balance} DOT</span>
              </div>
            )}
          </div>

          <DropdownMenuSeparator />

          {/* Account Selection */}
          {accounts.length > 1 && (
            <>
              <DropdownMenuLabel className="text-xs">Switch Account</DropdownMenuLabel>
              {accounts.map((account) => (
                <DropdownMenuItem
                  key={account.address}
                  onClick={() => handleAccountSelect(account)}
                  className={
                    account.address === selectedAccount.address
                      ? 'bg-secondary'
                      : ''
                  }
                >
                  <Avatar className="w-6 h-6 bg-gradient-hero mr-2">
                    <AvatarFallback className="text-primary-foreground text-xs">
                      {getAccountInitials(account.meta.name)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="text-sm">{account.meta.name || 'Account'}</div>
                    <div className="text-xs text-muted-foreground font-mono">
                      {truncateAddress(account.address)}
                    </div>
                  </div>
                  {account.address === selectedAccount.address && (
                    <CheckCircle className="w-4 h-4 text-success" />
                  )}
                </DropdownMenuItem>
              ))}
              <DropdownMenuSeparator />
            </>
          )}

          {/* Actions */}
          <DropdownMenuItem onClick={handleCopyAddress}>
            <Copy className="w-4 h-4 mr-2" />
            Copy Address
          </DropdownMenuItem>
          <DropdownMenuItem onClick={handleDisconnect} className="text-destructive">
            <LogOut className="w-4 h-4 mr-2" />
            Disconnect
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  // Show connect button when not connected
  return (
    <Button variant={variant} size={size} onClick={handleConnect} className={className}>
      <Wallet className="w-4 h-4 mr-2" />
      Connect Wallet
    </Button>
  );
};

export default WalletConnect;