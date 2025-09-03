'use client';

import { useCurrentAccount, useSuiClientQuery } from '@mysten/dapp-kit';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Badge } from './ui/badge';

export function StampCard() {
  const currentAccount = useCurrentAccount();
  const passType = process.env.NEXT_PUBLIC_PASS_TYPE || '';

  const { data: ownedObjects, isLoading } = useSuiClientQuery(
    'getOwnedObjects',
    {
      owner: currentAccount?.address || '',
      filter: {
        StructType: passType,
      },
      options: {
        showDisplay: true,
        showContent: true,
      },
    },
    {
      enabled: !!currentAccount?.address && !!passType,
    }
  );

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-8 text-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>スタンプを読み込み中...</p>
        </CardContent>
      </Card>
    );
  }

  const stamps = ownedObjects?.data || [];

  if (stamps.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>スタンプカード</CardTitle>
        </CardHeader>
        <CardContent className="text-center p-8">
          <div className="text-6xl mb-4">📭</div>
          <p className="text-lg mb-2">まだスタンプがありません</p>
          <p className="text-muted-foreground">イベントに参加してスタンプを集めましょう！</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            スタンプカード
            <Badge variant="secondary">{stamps.length} 個獲得</Badge>
          </CardTitle>
        </CardHeader>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {stamps.map((stamp) => {
          const display = stamp.data?.display?.data;
          const content = stamp.data?.content;
          
          return (
            <Card key={stamp.data?.objectId} className="overflow-hidden hover:shadow-lg transition-all duration-300 border-2 hover:border-accent/50">
              <div className="aspect-square bg-gradient-to-br from-[#6af2f0] to-[#04d4f0] flex items-center justify-center text-white font-bold shadow-inner">
                {display?.image_url ? (
                  <img 
                    src={display.image_url} 
                    alt={display.name || 'Event Stamp'} 
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="text-2xl">🎯</div>
                )}
              </div>
              
              <CardHeader>
                <CardTitle className="text-lg">
                  {display?.name || 'SuiQuest JP Pass'}
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  {display?.description || 'Commemorative NFT Pass'}
                </p>
              </CardHeader>
              
              <CardContent>
                <div className="space-y-2 text-sm">
                  <div>
                    <span className="font-medium">Object ID:</span>
                    <span className="font-mono text-xs ml-2">
                      {stamp.data?.objectId?.slice(0, 8)}...
                    </span>
                  </div>
                  {content?.fields?.minted_at && (
                    <div>
                      <span className="font-medium">獲得日:</span>
                      <span className="ml-2">
                        {new Date(parseInt(content.fields.minted_at)).toLocaleDateString('ja-JP')}
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}