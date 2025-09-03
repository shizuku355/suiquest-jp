'use client';

import { useCurrentAccount } from '@mysten/dapp-kit';
import { ConnectedAccount } from '@/components/connected-account';
import { AccountBalance } from '@/components/account-balance';
import { Navigation } from '@/components/ui/navigation';
import { StampCard } from '@/components/stamp-card';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function CardPage() {
  const currentAccount = useCurrentAccount();

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="text-center mb-8">
        <div className="inline-block p-4 rounded-2xl bg-gradient-to-r from-[#6af2f0]/20 to-[#04d4f0]/20 mb-4">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-[#059dc0] to-[#04ecf0] bg-clip-text text-transparent font-[family-name:var(--font-fredoka)]">
            🎫 Stamp Card
          </h1>
        </div>
        <p className="text-muted-foreground">獲得したスタンプNFTの一覧</p>
      </div>

      <ConnectedAccount />
      <AccountBalance />
      <Navigation />

      {!currentAccount ? (
        <Card>
          <CardHeader>
            <CardTitle>ウォレット接続が必要です</CardTitle>
          </CardHeader>
          <CardContent>
            <p>スタンプカードを表示するには、まずウォレットを接続してください。</p>
          </CardContent>
        </Card>
      ) : (
        <StampCard />
      )}
    </div>
  );
}