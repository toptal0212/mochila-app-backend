# Vercel環境変数の確認と設定方法

## エラー: `POSTGRES_PRISMA_URL` not found

このエラーは、Vercelの環境変数が正しく設定されていないことを示しています。

## 解決方法

### ステップ1: Vercel Dashboardで環境変数を確認

1. [Vercel Dashboard](https://vercel.com/dashboard) にログイン
2. プロジェクト（`mochila-app-backend`）を選択
3. **Settings** → **Environment Variables** を開く
4. 以下の環境変数が存在するか確認:
   - ✅ `POSTGRES_PRISMA_URL`
   - ✅ `POSTGRES_URL_NON_POOLING`
   - ✅ `POSTGRES_URL` (オプション)

### ステップ2: 環境変数が存在しない場合

1. **Storage** タブを開く
2. `mochila_db` データベースをクリック
3. **Settings** タブを開く
4. **Connection String** セクションを探す
5. 以下の値をコピー:
   - `POSTGRES_PRISMA_URL`
   - `POSTGRES_URL_NON_POOLING`

### ステップ3: 環境変数を手動で追加

1. **Settings** → **Environment Variables** に戻る
2. **Add New** をクリック
3. 以下を追加:

   **変数1:**
   - **Key**: `POSTGRES_PRISMA_URL`
   - **Value**: コピーした `POSTGRES_PRISMA_URL` の値
   - **Environment**: Production, Preview, Development すべてにチェック
   - **Save**

   **変数2:**
   - **Key**: `POSTGRES_URL_NON_POOLING`
   - **Value**: コピーした `POSTGRES_URL_NON_POOLING` の値
   - **Environment**: Production, Preview, Development すべてにチェック
   - **Save**

### ステップ4: 再デプロイ

環境変数を追加した後:

1. **Deployments** タブに移動
2. 最新のデプロイメントをクリック
3. **Redeploy** をクリック

または、GitHubにプッシュして自動デプロイをトリガーします。

## 確認方法

再デプロイ後、以下の方法で確認:

1. **Deployments** → 最新のデプロイメント → **Functions** → ログを確認
2. Prismaのエラーが消えているか確認
3. アプリケーションをテスト

## トラブルシューティング

### 環境変数が表示されない

- データベースがプロジェクトにリンクされているか確認
- 正しいプロジェクトを選択しているか確認
- ページをリフレッシュ

### まだエラーが発生する

- 環境変数の値に余分なスペースがないか確認
- 環境変数がすべての環境（Production, Preview, Development）に設定されているか確認
- Vercelのログで詳細なエラーメッセージを確認

