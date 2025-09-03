'use client';

import { useState } from 'react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent } from './ui/card';
import { toast } from 'sonner';
import { Link, X, Check } from 'lucide-react';

interface ImageUploadProps {
  onImageUrl: (url: string) => void;
  currentImageUrl?: string;
}

export function ImageUpload({ onImageUrl, currentImageUrl }: ImageUploadProps) {
  const [blobId, setBlobId] = useState('');
  const [preview, setPreview] = useState<string | null>(currentImageUrl || null);

  const handleBlobIdSubmit = () => {
    try {
      if (!blobId.trim()) {
        toast.error('Blob IDを入力してください');
        return;
      }
      
      const walrusUrl = `https://aggregator.walrus-mainnet.walrus.space/v1/blobs/${blobId.trim()}`;
      onImageUrl(walrusUrl);
      setPreview(walrusUrl);
      setBlobId('');
      
      toast.success('Walrus画像URLを設定しました！', {
        description: `Blob ID: ${blobId.trim().slice(0, 8)}...`,
      });
    } catch (error) {
      console.error('Blob ID submit error:', error);
      toast.error('Blob ID設定に失敗しました');
    }
  };

  return (
    <div className="space-y-4">
      <Label>イベント画像</Label>
      
      {/* Preview Area */}
      {preview && (
        <Card>
          <CardContent className="p-4">
            <div className="relative">
              <img
                src={preview}
                alt="Preview"
                className="w-full aspect-square object-cover rounded-lg"
              />
              <Button
                variant="destructive"
                size="sm"
                className="absolute top-2 right-2"
                onClick={() => {
                  setPreview(null);
                  onImageUrl('');
                }}
              >
                <X className="h-4 w-4" />
              </Button>
              {currentImageUrl && (
                <div className="absolute bottom-2 left-2">
                  <div className="bg-black/50 text-white px-2 py-1 rounded text-xs flex items-center gap-1">
                    <Check className="h-3 w-3" />
                    Walrus保存済み
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Walrus Blob ID Input */}
      <Card className="border-primary/20">
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-center gap-2 mb-2">
              <Link className="h-4 w-4 text-primary" />
              <Label htmlFor="blob-id" className="font-medium">Walrus Blob ID</Label>
            </div>
            <div className="flex gap-2">
              <Input
                id="blob-id"
                value={blobId}
                onChange={(e) => setBlobId(e.target.value)}
                placeholder="GRSuRSQ_hLYR9nyo7mlBlS7MLQVSSXRrfPVOxF6n6Xc..."
                className="flex-1"
              />
              <Button onClick={handleBlobIdSubmit} disabled={!blobId.trim()}>
                設定
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              💡 画像を事前に <code className="bg-muted px-1 rounded">walrus store image.png --epochs 5</code> でアップロードしてBlobIDを取得
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Manual URL Input (fallback) */}
      <div className="space-y-2">
        <Label htmlFor="manual-url">または画像URLを直接入力</Label>
        <Input
          id="manual-url"
          type="url"
          placeholder="https://example.com/image.png"
          value={currentImageUrl || ''}
          onChange={(e) => {
            onImageUrl(e.target.value);
            setPreview(e.target.value);
          }}
        />
      </div>
    </div>
  );
}