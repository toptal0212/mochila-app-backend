# Vercel Postgres セットアップ - 代替方法

Queryタブが見つからない場合の方法です。

## 方法1: 環境変数を取得してローカルで実行（最も簡単）

### ステップ1: Vercel Dashboardで接続文字列を取得

1. [Vercel Dashboard](https://vercel.com/dashboard) にログイン
2. プロジェクトを選択
3. **Settings** → **Environment Variables** を開く
4. 以下の環境変数を探す:
   - `POSTGRES_PRISMA_URL`
   - `POSTGRES_URL_NON_POOLING`

または:

1. **Storage** タブを開く
2. Postgresデータベースをクリック
3. **Settings** または **Overview** タブを開く
4. **Connection String** または **.env.local** セクションを探す
5. 接続文字列をコピー

### ステップ2: ローカルに.envファイルを作成

`mochila-backend` ディレクトリに `.env` ファイルを作成:

```env
POSTGRES_PRISMA_URL=your-vercel-prisma-url-here
POSTGRES_URL_NON_POOLING=your-vercel-non-pooling-url-here
```

### ステップ3: マイグレーションを実行

```bash
cd mochila-backend
npx prisma migrate deploy
```

## 方法2: Prisma Migrate Dev を使用（初回セットアップ）

### ステップ1: 環境変数を設定（上記と同じ）

### ステップ2: 初回マイグレーションを作成

```bash
cd mochila-backend
npx prisma migrate dev --name init
```

これで:
- マイグレーションファイルが `prisma/migrations/` に作成されます
- データベースにテーブルが作成されます

### ステップ3: GitHubにプッシュ

```bash
git add prisma/migrations/
git commit -m "Add initial database migration"
git push
```

Vercelが自動的にデプロイし、マイグレーションが実行されます。

## 方法3: Vercel Dashboardの別の場所を確認

Vercel PostgresのUIが更新されている可能性があります。以下を確認してください:

1. **Storage** → データベース → **Data** タブ
2. **Storage** → データベース → **SQL Editor** タブ
3. **Storage** → データベース → **Console** タブ
4. **Storage** → データベース → **Settings** → **Query** セクション

## 方法4: Vercel CLIを使用（推奨）

### ステップ1: Vercel CLIをインストール

```bash
npm install -g vercel
```

### ステップ2: ログイン

```bash
vercel login
```

### ステップ3: プロジェクトにリンク

```bash
cd mochila-backend
vercel link
```

### ステップ4: 環境変数を取得

```bash
vercel env pull .env.local
```

### ステップ5: マイグレーション実行

```bash
npx prisma migrate deploy
```

## 方法5: 直接SQLを実行するAPIエンドポイントを作成（一時的）

一時的なエンドポイントを作成してSQLを実行する方法もありますが、セキュリティ上の理由から推奨しません。

## 推奨される方法

**方法1（環境変数を取得してローカルで実行）** が最も簡単で確実です。

1. Vercel Dashboardから接続文字列をコピー
2. `.env`ファイルを作成
3. `npx prisma migrate deploy` を実行

これで完了です！

