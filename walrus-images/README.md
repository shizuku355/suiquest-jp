# Walrus 画像アップロード用フォルダ

このフォルダにイベント画像を保存して、Walrus CLI でアップロードしてください。

## 使い方

1. **画像を保存**
   ```bash
   # このフォルダに画像をコピー
   cp your-event-image.png walrus-images/
   ```

2. **Walrus にアップロード**
   ```bash
   # フォルダ内の画像をアップロード
   walrus store walrus-images/your-event-image.png --epochs 5
   ```

3. **Blob ID をコピー**
   ```
   Blob ID: GRSuRSQ_hLYR9nyo7mlBlS7MLQVSSXRrfPVOxF6n6Xc
   ```

4. **dApp で Blob ID を入力**
   - 管理者ページでイベント作成
   - Walrus Blob ID 欄に貼り付け

## 注意事項

- 画像サイズ: 10MB以下推奨
- 形式: JPG, PNG, GIF
- エポック数: 5 (約10週間保存)
- コスト: 少額の WAL が必要