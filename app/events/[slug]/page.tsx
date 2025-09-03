'use client';

import { useParams } from 'next/navigation';
import { ConnectedAccount } from '@/components/connected-account';
import { AccountBalance } from '@/components/account-balance';
import { Navigation } from '@/components/ui/navigation';
import { MintButton } from '@/components/mint-button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useEvents } from '@/lib/hooks';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';

export default function EventDetailPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { events, isLoading } = useEvents();
  
  const event = events.find(e => e.slug === slug);
  
  if (isLoading) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="text-center py-8">
          <div className="animate-spin w-8 h-8 border-2 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
          <p>イベント情報を読み込み中...</p>
        </div>
      </div>
    );
  }
  
  if (!event) {
    return (
      <div className="container mx-auto p-4 max-w-4xl">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">イベントが見つかりません</h1>
          <Button asChild>
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              イベント一覧に戻る
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  const now = Date.now();
  const isActive = now >= event.startMs && now <= event.endMs;
  const isUpcoming = now < event.startMs;

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <ConnectedAccount />
      <AccountBalance />
      <Navigation />

      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href="/">
            <ArrowLeft className="mr-2 h-4 w-4" />
            イベント一覧に戻る
          </Link>
        </Button>
      </div>

      <Card className="overflow-hidden shadow-xl border-2 border-primary/20">
        {event.imageUrl ? (
          <div className="aspect-square relative">
            <img 
              src={event.imageUrl} 
              alt={event.name}
              className="w-full h-full object-cover"
            />
          </div>
        ) : (
          <div className="aspect-square bg-gradient-to-br from-[#04ecf0] via-[#04d4f0] to-[#6af2f0] flex items-center justify-center text-white text-2xl font-bold shadow-inner">
            {event.name}
          </div>
        )}
        
        <CardHeader>
          <div className="flex justify-between items-start">
            <CardTitle className="text-2xl">{event.name}</CardTitle>
            <Badge variant={isActive ? 'default' : isUpcoming ? 'secondary' : 'outline'} className="text-sm">
              {isActive ? '開催中' : isUpcoming ? '開催予定' : '終了'}
            </Badge>
          </div>
        </CardHeader>
        
        <CardContent className="space-y-6">
          <p className="text-lg">{event.description}</p>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-center">
            <div>
              <div className="text-2xl font-bold">{event.minted}</div>
              <div className="text-sm text-muted-foreground">発行済み</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{event.cap}</div>
              <div className="text-sm text-muted-foreground">発行上限</div>
            </div>
            <div>
              <div className="text-2xl font-bold">{event.cap - event.minted}</div>
              <div className="text-sm text-muted-foreground">残り</div>
            </div>
            <div>
              <div className="text-2xl font-bold">
                {Math.round((event.minted / event.cap) * 100)}%
              </div>
              <div className="text-sm text-muted-foreground">達成率</div>
            </div>
          </div>

          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-semibold mb-2">開催期間</h3>
            <div className="text-sm space-y-1">
              <div>開始: {new Date(event.startMs).toLocaleString('ja-JP')}</div>
              <div>終了: {new Date(event.endMs).toLocaleString('ja-JP')}</div>
            </div>
          </div>

          <div className="text-center">
            <MintButton event={event} />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}