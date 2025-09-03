'use client';

import { useState } from 'react';
import { useCurrentAccount } from '@mysten/dapp-kit';
import { ConnectedAccount } from '@/components/connected-account';
import { AccountBalance } from '@/components/account-balance';
import { Navigation } from '@/components/ui/navigation';
import { EventEditor } from '@/components/event-editor';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useEvents } from '@/lib/hooks';
import { isAdmin } from '@/lib/constants';
import { Edit, Plus, Lock } from 'lucide-react';

export default function AdminPage() {
  const currentAccount = useCurrentAccount();
  const { events, isLoading, refetch } = useEvents();
  const [selectedEvent, setSelectedEvent] = useState<typeof events[0] | null>(null);
  const [showCreateForm, setShowCreateForm] = useState(false);
  
  const isUserAdmin = isAdmin(currentAccount?.address);

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <div className="text-center mb-8">
        <div className="inline-block p-4 rounded-2xl bg-gradient-to-r from-[#04d4f0]/20 to-[#059dc0]/20 mb-4">
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-[#059dc0] to-[#04ecf0] bg-clip-text text-transparent font-[family-name:var(--font-fredoka)]">
            ⚙️ 管理者ページ
          </h1>
        </div>
        <p className="text-muted-foreground">スタンプラリーイベントの作成・編集</p>
      </div>

      <ConnectedAccount />
      <AccountBalance />
      <Navigation />

      {!currentAccount ? (
        <Card>
          <CardHeader>
            <CardTitle>管理者機能を使用するにはウォレット接続が必要です</CardTitle>
          </CardHeader>
          <CardContent>
            <p>イベントを作成・編集するには、まずウォレットを接続してください。</p>
          </CardContent>
        </Card>
      ) : !isUserAdmin ? (
        <Card className="border-destructive/50">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <Lock className="h-5 w-5" />
              アクセス権限がありません
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">
              このページは管理者のみアクセス可能です。
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              接続アドレス: {currentAccount.address.slice(0, 10)}...
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-6">
          {/* Action Buttons */}
          <div className="flex gap-4">
            <Button 
              onClick={() => {
                setShowCreateForm(!showCreateForm);
                setSelectedEvent(null);
              }}
              className="flex items-center gap-2"
            >
              <Plus className="h-4 w-4" />
              新しいイベントを作成
            </Button>
          </div>

          {/* Create Form */}
          {showCreateForm && (
            <EventEditor 
              onSuccess={() => {
                setShowCreateForm(false);
                refetch();
              }}
            />
          )}

          {/* Edit Form */}
          {selectedEvent && (
            <EventEditor 
              event={selectedEvent}
              onSuccess={() => {
                setSelectedEvent(null);
                refetch();
              }}
            />
          )}

          {/* Events List */}
          <Card>
            <CardHeader>
              <CardTitle>既存のイベント</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-4">
                  <div className="animate-spin w-6 h-6 border-2 border-primary border-t-transparent rounded-full mx-auto mb-2"></div>
                  <p className="text-sm text-muted-foreground">イベントを読み込み中...</p>
                </div>
              ) : events.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">まだイベントがありません。上のボタンから作成してください。</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {events.map((event) => (
                  <div key={event.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex-1">
                      <h3 className="font-semibold">{event.name}</h3>
                      <p className="text-sm text-muted-foreground">{event.description}</p>
                      <div className="flex gap-2 mt-2">
                        <Badge variant="outline">{event.slug}</Badge>
                        <Badge variant="secondary">{event.minted} / {event.cap}</Badge>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setSelectedEvent(event);
                        setShowCreateForm(false);
                      }}
                      className="flex items-center gap-2"
                    >
                      <Edit className="h-4 w-4" />
                      編集
                    </Button>
                  </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
}