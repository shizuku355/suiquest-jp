'use client';

import { useState } from 'react';
import { useCurrentAccount, useSignAndExecuteTransaction, useSuiClient } from '@mysten/dapp-kit';
import { Transaction } from '@mysten/sui/transactions';
import { Button } from './ui/button';
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

  const packageId = process.env.NEXT_PUBLIC_PACKAGE_ID;
  
  const handleMint = async () => {
    if (!currentAccount || !packageId) {
      toast.error('ウォレットが接続されていないか、コントラクトが設定されていません');
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
  const isActive = now >= event.startMs && now <= event.endMs;
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
    <Button
      onClick={handleMint}
      disabled={disabled}
      size="lg"
      className="w-full max-w-md text-lg py-6"
    >
      {buttonText}
    </Button>
  );
}