# Vercel環境変数の追加方法

Vercel Dashboardに`POSTGRES_PRISMA_URL`と`POSTGRES_URL_NON_POOLING`が存在しない場合の対処法です。

## 解決方法: 環境変数を手動で追加

### ステップ1: POSTGRES_URLの値をコピー

1. Vercel Dashboard → プロジェクト → **Settings** → **Environment Variables**
2. `POSTGRES_URL` の値をコピー（例: `postgres://...`）

### ステップ2: POSTGRES_PRISMA_URLを追加

1. **Environment Variables** ページで **Add New** をクリック
2. 以下を入力:
   - **Key**: `POSTGRES_PRISMA_URL`
   - **Value**: `POSTGRES_URL`の値をそのまま貼り付け
   - **Environment**: 
     - ✅ Production
     - ✅ Preview  
     - ✅ Development
   - **Save** をクリック

### ステップ3: POSTGRES_URL_NON_POOLINGを追加

1. 再度 **Add New** をクリック
2. 以下を入力:
   - **Key**: `POSTGRES_URL_NON_POOLING`
   - **Value**: `POSTGRES_URL`の値をそのまま貼り付け（同じ値でOK）
   - **Environment**: 
     - ✅ Production
     - ✅ Preview
     - ✅ Development
   - **Save** をクリック

### ステップ4: 確認

**Environment Variables** ページで以下が表示されることを確認:
- ✅ `POSTGRES_URL` (既存)
- ✅ `POSTGRES_PRISMA_URL` (新規追加)
- ✅ `POSTGRES_URL_NON_POOLING` (新規追加)

### ステップ5: 再デプロイ

1. **Deployments** タブに移動
2. 最新のデプロイメントをクリック
3. **Redeploy** をクリック

## 重要

- `POSTGRES_PRISMA_URL`と`POSTGRES_URL_NON_POOLING`には、`POSTGRES_URL`と同じ値を設定してください
- すべての環境（Production, Preview, Development）に設定してください
- 環境変数を追加した後、必ず再デプロイしてください

## 完了後

再デプロイ後、アプリケーションをテストして「表示名の保存に失敗しました」エラーが解決されたか確認してください。

