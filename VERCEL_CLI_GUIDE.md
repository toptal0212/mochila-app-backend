# Vercel CLI 使い方ガイド

## インストール

### Windows (PowerShell)

```powershell
npm install -g vercel
```

### Mac/Linux

```bash
npm install -g vercel
```

インストール確認:
```bash
vercel --version
```

## 基本的な使い方

### 1. ログイン

初回のみ、Vercelアカウントにログインします:

```bash
vercel login
```

ブラウザが開き、Vercelアカウントで認証します。

### 2. プロジェクトにリンク

既存のVercelプロジェクトにリンクします:

```bash
cd mochila-backend
vercel link
```

以下の質問に答えます:
- **Set up and develop?** → `Y`
- **Which scope?** → あなたのアカウントを選択
- **Link to existing project?** → `Y`
- **What's the name of your existing project?** → `mochila-app-backend` (またはあなたのプロジェクト名)

### 3. 環境変数を取得

Vercelから環境変数をローカルに取得:

```bash
vercel env pull .env.local
```

これで、`.env.local`ファイルにVercelの環境変数が保存されます。

### 4. データベースマイグレーションを実行

環境変数を取得した後、マイグレーションを実行:

```bash
npx prisma migrate deploy
```

## 完全なセットアップ手順

### Step 1: Vercel CLIをインストール

```bash
npm install -g vercel
```

### Step 2: ログイン

```bash
vercel login
```

### Step 3: プロジェクトディレクトリに移動

```bash
cd mochila-backend
```

### Step 4: プロジェクトにリンク

```bash
vercel link
```

プロンプトに従って:
- 既存のプロジェクトを選択
- プロジェクト名を入力（例: `mochila-app-backend`）

### Step 5: 環境変数を取得

```bash
vercel env pull .env.local
```

これで以下の環境変数が`.env.local`に保存されます:
- `POSTGRES_PRISMA_URL`
- `POSTGRES_URL_NON_POOLING`
- `POSTGRES_URL`
- その他の環境変数

### Step 6: データベースマイグレーションを実行

```bash
# Prisma Clientを生成（念のため）
npx prisma generate

# マイグレーションを実行
npx prisma migrate deploy
```

### Step 7: データベースの状態を確認（オプション）

```bash
node scripts/check-migration.js
```

## よく使うコマンド

### 環境変数の確認

```bash
# すべての環境変数を表示
vercel env ls

# 特定の環境変数を表示
vercel env ls POSTGRES_PRISMA_URL
```

### 環境変数の追加

```bash
vercel env add POSTGRES_PRISMA_URL
```

### デプロイ

```bash
# プレビューデプロイ
vercel

# 本番デプロイ
vercel --prod
```

### ログの確認

```bash
# 最新のログを表示
vercel logs

# リアルタイムでログを表示
vercel logs --follow
```

## トラブルシューティング

### "Not logged in" エラー

```bash
vercel login
```

### "Project not found" エラー

```bash
# プロジェクトを再リンク
vercel link
```

### 環境変数が取得できない

1. Vercel Dashboardで環境変数が設定されているか確認
2. 正しいプロジェクトにリンクされているか確認:
   ```bash
   vercel link
   ```

### マイグレーションエラー

1. 環境変数が正しく取得されているか確認:
   ```bash
   cat .env.local
   ```

2. Prismaスキーマを検証:
   ```bash
   npx prisma validate
   ```

3. データベース接続を確認:
   ```bash
   node scripts/check-migration.js
   ```

## クイックリファレンス

```bash
# インストール
npm install -g vercel

# ログイン
vercel login

# プロジェクトにリンク
cd mochila-backend
vercel link

# 環境変数を取得
vercel env pull .env.local

# マイグレーション実行
npx prisma migrate deploy

# データベース確認
node scripts/check-migration.js
```

## 次のステップ

マイグレーションが成功したら:

1. Vercel Dashboardで再デプロイ
2. アプリケーションをテスト
3. エラーが解決されたか確認

