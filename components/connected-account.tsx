'use client';

import { useCurrentAccount, useDisconnectWallet, ConnectButton, useWallets } from '@mysten/dapp-kit';
import { Button } from './ui/button';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

export function ConnectedAccount() {
  const currentAccount = useCurrentAccount();
  const { mutate: disconnect } = useDisconnectWallet();
  const wallets = useWallets();

  if (!currentAccount) {
    return (
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-center">SuiQuest JP へようこそ</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <ConnectButton />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>接続済み</span>
          <Badge variant="outline">
            {currentAccount.address.slice(0, 6)}...{currentAccount.address.slice(-4)}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">
            ウォレット: {wallets.find(w => w.accounts.some(a => a.address === currentAccount.address))?.name || 'Sui Wallet'}
          </span>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => {
              disconnect();
              // Clear any cached wallet data
              localStorage.removeItem('suiquest-jp-wallet');
            }}
          >
            切断
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}