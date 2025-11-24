# Vercel mochila_db データベースの接続文字列を取得する方法

## ステップ1: Vercel Dashboardで接続文字列を取得

1. [Vercel Dashboard](https://vercel.com/dashboard) にログイン
2. プロジェクト（`mochila-app-backend`）を選択
3. **Storage** タブを開く
4. `mochila_db` データベースをクリック
5. 以下のいずれかの方法で接続文字列を取得:

### 方法A: Settingsタブから
1. **Settings** タブを開く
2. **Connection String** セクションを探す
3. 以下の値をコピー:
   - `POSTGRES_PRISMA_URL`
   - `POSTGRES_URL_NON_POOLING`

### 方法B: Environment Variablesから
1. プロジェクトの **Settings** → **Environment Variables** を開く
2. 以下の環境変数を探す:
   - `POSTGRES_PRISMA_URL`
   - `POSTGRES_URL_NON_POOLING`
3. 値をコピー

### 方法C: .env.localタブから（もしあれば）
1. データベースページで **.env.local** タブを開く
2. 接続文字列をコピー

## ステップ2: .envファイルを更新

`mochila-backend` ディレクトリの `.env` ファイルを開いて、以下の行を更新:

```env
POSTGRES_PRISMA_URL=ここに新しい接続文字列を貼り付け
POSTGRES_URL_NON_POOLING=ここに新しい接続文字列を貼り付け
```

**重要**: 古い `db.prisma.io` の接続文字列を削除し、新しい `mochila_db` の接続文字列に置き換えてください。

## ステップ3: マイグレーションを実行

```bash
cd mochila-backend
npx prisma migrate deploy
```

または、初回の場合:

```bash
npx prisma migrate dev --name init
```

## ステップ4: 確認

```bash
node scripts/check-migration.js
```

または、Vercel Dashboard → Storage → mochila_db → **Tables** タブでテーブルを確認

