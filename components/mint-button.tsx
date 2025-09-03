'use client';

import { useState } from 'react';
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { toast } from 'sonner';
import type { Event } from '@/lib/types';

interface MintButtonProps {
  event: Event;
}

export function MintButton({ event }: MintButtonProps) {
  const currentAccount = useCurrentAccount();
  const suiClient = useSuiClient();
  const { mutate: signAndExecute, isPending } = useSignAndExecuteTransaction();
  const [isMinting, setIsMinting] = useState(false);
  const [password, setPassword] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);

  const packageId = process.env.NEXT_PUBLIC_PACKAGE_ID;
  
  const handleMint = async () => {
    if (!currentAccount || !packageId) {
      toast.error('ウォレットが接続されていないか、コントラクトが設定されていません');
      return;
    }

    // パスワードチェック
    if (!password.trim()) {
      toast.error('イベントパスワードを入力してください');
      return;
    }

    // 固定ルールでパスワード検証
    const expectedPassword = `${event.name.replace(/\s+/g, '')}-2025`;
    
    if (password.trim() !== expectedPassword) {
      toast.error('パスワードが正しくありません');
      return;
    }

    const now = Date.now();
    if (now < event.startMs) {
      toast.error('イベントはまだ開始されていません');
      return;
    }
    
    if (now > event.endMs) {
      toast.error('イベントは終了しました');
      return;
    }

    if (event.minted >= event.cap) {
      toast.error('発行上限に達しました');
      return;
    }

    setIsMinting(true);
    
    try {
      const tx = new Transaction();
      
      // Note: In production, you would use the actual event object ID and clock
      tx.moveCall({
        target: `${packageId}::core::mint_pass`,
        arguments: [
          tx.object(event.id), // Event object
          tx.object('0x6'), // Clock object
        ],
      });

      signAndExecute(
        { transaction: tx },
        {
          onSuccess: async (result) => {
            try {
              await suiClient.waitForTransaction({
                digest: result.digest,
              });
              
              toast.success('スタンプをゲットしました！', {
                description: `トランザクション: ${result.digest.slice(0, 8)}...`,
              });
              
              // ダイアログを閉じてパスワードをリセット
              setDialogOpen(false);
              setPassword('');
            } catch (error) {
              console.error('Transaction wait error:', error);
              toast.error('トランザクションの確認に失敗しました');
            } finally {
              setIsMinting(false);
            }
          },
          onError: (error) => {
            console.error('Transaction error:', error);
            toast.error('ミントに失敗しました');
            setIsMinting(false);
          },
        }
      );
    } catch (error) {
      console.error('Mint error:', error);
      toast.error('予期しないエラーが発生しました');
      setIsMinting(false);
    }
  };

  if (!currentAccount) {
    return (
      <div className="text-center p-4 bg-muted rounded-lg">
        <p className="text-muted-foreground">スタンプを獲得するにはウォレットを接続してください</p>
      </div>
    );
  }

  const now = Date.now();
  const isUpcoming = now < event.startMs;
  const isEnded = now > event.endMs;
  const isSoldOut = event.minted >= event.cap;

  let buttonText = 'スタンプをゲット！';
  let disabled = false;

  if (isUpcoming) {
    buttonText = 'イベント開始前';
    disabled = true;
  } else if (isEnded) {
    buttonText = 'イベント終了';
    disabled = true;
  } else if (isSoldOut) {
    buttonText = '発行上限達成';
    disabled = true;
  } else if (isMinting || isPending) {
    buttonText = 'ミント中...';
    disabled = true;
  }

  return (
    <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
      <DialogTrigger asChild>
        <Button
          disabled={disabled}
          size="lg"
          className="w-full max-w-md text-lg py-6"
        >
          {buttonText}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>🎫 スタンプをゲット</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">
            イベント参加者に配布されたパスワードを入力してください
          </p>
          
          <div className="space-y-2">
            <Label htmlFor="password">イベントパスワード</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="イベントで配布されたパスワード"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleMint();
                }
              }}
            />
          </div>
          
          
          <Button 
            onClick={handleMint} 
            disabled={isMinting || isPending || !password.trim()}
            className="w-full"
          >
            {isMinting || isPending ? 'ミント中...' : 'スタンプをゲット！'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}