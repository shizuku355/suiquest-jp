'use client';

import { ConnectedAccount } from '@/components/connected-account';
import { AccountBalance } from '@/components/account-balance';
import { Navigation } from '@/components/ui/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useEvents } from '@/lib/hooks';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { isAdmin } from '@/lib/constants';
import Link from 'next/link';

export default function Home() {
  const { events, isLoading } = useEvents();
  const currentAccount = useCurrentAccount();
  const isUserAdmin = isAdmin(currentAccount?.address);
  
  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="text-center mb-8">
        <div className="inline-block p-6 rounded-3xl bg-gradient-to-r from-[#04ecf0]/20 to-[#6af2f0]/20 mb-4">
          <h1 className="text-4xl font-bold mb-2 bg-gradient-to-r from-[#059dc0] to-[#04d4f0] bg-clip-text text-transparent font-[family-name:var(--font-fredoka)]">
            🌊 SuiQuest JP
          </h1>
        </div>
        <p className="text-muted-foreground text-lg">Sui Japan Event スタンプラリー</p>
      </div>

      <ConnectedAccount />
      <AccountBalance />
      <Navigation />

      <div className="space-y-6">
        <h2 className="text-2xl font-bold">開催中・開催予定のイベント</h2>
        
        {isLoading ? (
          <div className="text-center py-8">
            <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p>イベントを読み込み中...</p>
          </div>
        ) : events.length === 0 ? (
          <Card>
            <CardContent className="text-center py-8">
              <div className="text-6xl mb-4">🎯</div>
              <p className="text-lg mb-2">まだイベントがありません</p>
              <p className="text-muted-foreground">管理者がイベントを作成すると、ここに表示されます</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {events.map((event) => {
            const now = Date.now();
            const isActive = now >= event.startMs && now <= event.endMs;
            const isUpcoming = now < event.startMs;
            
            return (
              <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-all duration-300 border-2 hover:border-primary/50">
                {event.imageUrl ? (
                  <div className="aspect-square relative">
                    <img 
                      src={event.imageUrl} 
                      alt={event.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <div className="aspect-square bg-gradient-to-br from-[#04ecf0] to-[#059dc0] flex items-center justify-center text-white text-lg font-bold shadow-inner">
                    {event.name}
                  </div>
                )}
                <CardHeader>
                  <div className="flex justify-between items-start">
                    <CardTitle className="text-lg">{event.name}</CardTitle>
                    <Badge variant={isActive ? 'default' : isUpcoming ? 'secondary' : 'outline'}>
                      {isActive ? '開催中' : isUpcoming ? '開催予定' : '終了'}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground">{event.description}</p>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between items-center mb-4">
                    <span className="text-sm">
                      {event.minted} / {event.cap} 発行済み
                    </span>
                    <div className="text-xs text-muted-foreground">
                      {new Date(event.startMs).toLocaleDateString('ja-JP')} - {new Date(event.endMs).toLocaleDateString('ja-JP')}
                    </div>
                  </div>
                  
                  <Button asChild className="w-full">
                    <Link href={`/events/${event.slug}`}>
                      詳細を見る
                    </Link>
                  </Button>
                </CardContent>
              </Card>
            );
            })}
          </div>
        )}
      </div>
      
      {/* Admin Footer */}
      {isUserAdmin && (
        <div className="fixed bottom-4 right-4">
          <Button
            variant="outline"
            size="sm"
            asChild
            className="text-xs bg-background/80 backdrop-blur-sm border-primary/20"
          >
            <Link href="/admin">
              ⚙️ 管理
            </Link>
          </Button>
        </div>
      )}
    </div>
  );
}
