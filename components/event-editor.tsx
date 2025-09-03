'use client';

import { useState } from 'react';
import { useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { ImageUpload } from './image-upload';
import { toast } from 'sonner';
import { Badge } from './ui/badge';
import type { Event } from '@/lib/types';

interface EventEditorProps {
  event?: Event;
  onSuccess?: () => void;
}

export function EventEditor({ event, onSuccess }: EventEditorProps) {
  const suiClient = useSuiClient();
  const { mutate: signAndExecute, isPending } = useSignAndExecuteTransaction();
  
  const [formData, setFormData] = useState({
    name: event?.name || '',
    slug: event?.slug || '',
    description: event?.description || '',
    imageUrl: event?.imageUrl || '',
    startDate: event ? new Date(event.startMs).toISOString().slice(0, 16) : '',
    endDate: event ? new Date(event.endMs).toISOString().slice(0, 16) : '',
    cap: event?.cap.toString() || '100',
  });

  const packageId = process.env.NEXT_PUBLIC_PACKAGE_ID;
  const isEditing = !!event;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!packageId) {
      toast.error('コントラクトが設定されていません');
      return;
    }

    try {
      const tx = new Transaction();
      
      if (isEditing) {
        // Update existing event
        tx.moveCall({
          target: `${packageId}::core::update_event_details`,
          arguments: [
            tx.object(event.id),
            tx.pure.string(formData.name),
            tx.pure.string(formData.description),
            tx.pure.string(formData.imageUrl),
          ],
        });
      } else {
        // Create new event
        const startMs = new Date(formData.startDate).getTime();
        const endMs = new Date(formData.endDate).getTime();
        
        tx.moveCall({
          target: `${packageId}::core::create_event`,
          arguments: [
            tx.pure.string(formData.name),
            tx.pure.string(formData.slug),
            tx.pure.string(formData.imageUrl),
            tx.pure.string(formData.description),
            tx.pure.u64(startMs),
            tx.pure.u64(endMs),
            tx.pure.u64(parseInt(formData.cap)),
          ],
        });
      }

      signAndExecute(
        { transaction: tx },
        {
          onSuccess: async (result) => {
            try {
              await suiClient.waitForTransaction({
                digest: result.digest,
              });
              
              toast.success(isEditing ? 'イベントを更新しました！' : 'イベントを作成しました！', {
                description: `トランザクション: ${result.digest.slice(0, 8)}...`,
              });
              
              
              if (!isEditing) {
                // Reset form for new events
                setFormData({
                  name: '',
                  slug: '',
                  description: '',
                  imageUrl: '',
                  startDate: '',
                  endDate: '',
                  cap: '100',
                });
              }
              
              onSuccess?.();
            } catch (error) {
              console.error('Transaction wait error:', error);
              toast.error('トランザクションの確認に失敗しました');
            }
          },
          onError: (error) => {
            console.error('Transaction error:', error);
            toast.error(isEditing ? 'イベント更新に失敗しました' : 'イベント作成に失敗しました');
          },
        }
      );
    } catch (error) {
      console.error('Submit error:', error);
      toast.error('予期しないエラーが発生しました');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {isEditing ? 'イベントを編集' : '新しいイベントを作成'}
          {isEditing && <Badge variant="secondary">編集中</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">イベント名</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Sui Devnet Meetup Tokyo"
                required
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="slug">スラッグ (URL用)</Label>
              <Input
                id="slug"
                value={formData.slug}
                onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))}
                placeholder="sui-devnet-tokyo"
                pattern="^[a-z0-9-]+$"
                disabled={isEditing}
                required
              />
              {isEditing && (
                <p className="text-xs text-muted-foreground">スラッグは編集後も変更できません</p>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">説明</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="イベントの詳細説明..."
              required
            />
          </div>

          <ImageUpload
            onImageUrl={(url) => setFormData(prev => ({ ...prev, imageUrl: url }))}
            currentImageUrl={formData.imageUrl}
          />

          {!isEditing && (
            <>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="startDate">開始日時</Label>
                  <Input
                    id="startDate"
                    type="datetime-local"
                    value={formData.startDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="endDate">終了日時</Label>
                  <Input
                    id="endDate"
                    type="datetime-local"
                    value={formData.endDate}
                    onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="cap">発行上限</Label>
                  <Input
                    id="cap"
                    type="number"
                    min="1"
                    value={formData.cap}
                    onChange={(e) => setFormData(prev => ({ ...prev, cap: e.target.value }))}
                    required
                  />
                </div>
              </div>
            </>
          )}

          {/* Password Rule Info */}
          <div className="bg-muted p-4 rounded-lg">
            <h3 className="font-semibold mb-2 text-sm">📋 MINTパスワードルール</h3>
            <div className="text-xs text-muted-foreground space-y-1">
              <p>パスワード形式: <code className="bg-background px-1 rounded">イベント名（スペース除去）-2025</code></p>
              <p>例: イベント名が「Sui Quest」→ パスワードは「SuiQuest-2025」</p>
              <p className="text-amber-600">※ イベント参加者にこのパスワードを配布してください</p>
            </div>
          </div>

          <Button type="submit" disabled={isPending} className="w-full">
            {isPending 
              ? (isEditing ? 'イベント更新中...' : 'イベント作成中...') 
              : (isEditing ? 'イベントを更新' : 'イベントを作成')
            }
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}