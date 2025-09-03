'use client';

import { useCurrentAccount, useSuiClientQuery } from '@mysten/dapp-kit';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';

export function AccountBalance() {
  const currentAccount = useCurrentAccount();
  
  const { data: balance, isLoading } = useSuiClientQuery(
    'getBalance',
    {
      owner: currentAccount?.address || '',
    },
    {
      enabled: !!currentAccount?.address,
    }
  );

  if (!currentAccount) {
    return null;
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <CardTitle>残高</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center">読み込み中...</div>
        ) : (
          <div className="text-2xl font-bold">
            {balance ? (parseInt(balance.totalBalance) / 1_000_000_000).toFixed(4) : '0.0000'} SUI
          </div>
        )}
      </CardContent>
    </Card>
  );
}