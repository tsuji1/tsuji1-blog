# ブログ運用ガイド

## クイックスタート

```bash
# 記事を投稿（ローカル開発中）
npm run publish:post [slug]

# プレビュー環境に投稿
npm run publish:preview [slug]
```

---

## 記事の書き方

### 1. ファイルを作成

`content/posts/[slug].mdx` を作成：

```mdx
---
title: 記事のタイトル
date: 2025-01-15
excerpt: 記事の概要（ブログ一覧に表示される）
tags:
  - CTF
  - Security
  - Web
---

記事の本文をMarkdown形式で書く。

## 見出し（h2）

本文の続き...

### サブ見出し（h3）

- リスト項目1
- リスト項目2
```

### Frontmatter フィールド

| フィールド | 必須 | 説明 |
|-----------|-----|------|
| `title` | ✅ | 記事タイトル |
| `date` | ✅ | 投稿日 (YYYY-MM-DD) |
| `excerpt` | 推奨 | ブログ一覧に表示される概要 |
| `tags` | 任意 | タグ配列（サイドバーでフィルタリング可） |

### サポートする記法

| 記法 | 説明 |
|------|------|
| `# `, `## `, `### `... | 見出し（記事内に自動で # プレフィックス表示） |
| `**太字**` | **太字** |
| `` `コード` `` | インラインコード |
| ` ```lang ` | コードブロック（シンタックスハイライト対応） |
| `$E=mc^2$` | インライン数式（KaTeX） |
| `$$..$$` | ブロック数式（KaTeX） |
| `![alt](./image.png)` | 画像（相対パス → R2に自動アップロード） |

---

## 画像を使う

### 方法1: 記事と同じディレクトリに配置（推奨）

```
content/posts/
├── my-article.mdx
└── my-article/
    ├── screenshot1.png
    └── diagram.svg
```

記事内での参照：
```markdown
![スクリーンショット](./screenshot1.png)
```

**`publish:post` 実行時に自動で：**
1. 画像がR2にアップロードされる
2. パスが `/images/my-article/screenshot1.png` に変換される

### 方法2: 手動アップロード

```bash
# R2に直接アップロード
npx wrangler r2 object put tsuji1-blog-images/path/to/image.png --file ./local/image.png --remote

# プレビュー環境用
npx wrangler r2 object put tsuji1-blog-images-preview/path/to/image.png --file ./local/image.png --remote
```

記事内で参照：
```html
<img src="/images/path/to/image.png" alt="説明" />
```

---

## 開発・テスト

### ローカル開発

```bash
npm run dev
# → http://localhost:8787
```

- KV/R2はローカルエミュレータを使用
- 変更したら即座に反映

### プレビュー環境でテスト

```bash
# 1. 記事をプレビューに投稿
npm run publish:preview my-article

# 2. プレビューサイトを確認
# → https://tsuji1-blog-preview.yuzu777yuzu0.workers.dev/my-article
```

### 本番投稿

```bash
# 本番用サーバーを起動してから
# （または本番環境URL設定後）
npm run publish:post my-article
```

---

## デプロイ

```bash
# 本番デプロイ
npm run deploy

# プレビューデプロイ
npm run deploy:preview
```

---

## 環境変数 (.env)

```env
JWT_SECRET=your-secret-key-here
JWT_ISSUER=tsuji1-blog
API=http://localhost:8787
```

### Cloudflare シークレット設定

```bash
# 本番
npx wrangler secret put JWT_SECRET

# プレビュー
npx wrangler secret put JWT_SECRET --env preview
```

---

## npm scripts 一覧

| コマンド | 説明 |
|----------|------|
| `npm run dev` | ローカル開発サーバー起動 |
| `npm run dev:remote` | リモートKV/R2接続で起動 |
| `npm run deploy` | 本番デプロイ |
| `npm run deploy:preview` | プレビューデプロイ |
| `npm run publish:post [slug]` | 記事を投稿（ローカル/本番） |
| `npm run publish:preview [slug]` | 記事をプレビューに投稿 |

---

## ディレクトリ構成

```
tsuji1-blog/
├── content/posts/          # MDX記事
│   ├── my-article.mdx
│   └── my-article/         # 記事用画像（任意）
│       └── image.png
├── public/                 # 静的ファイル
├── scripts/
│   └── publish.mts         # 記事投稿スクリプト
├── src/server/
│   ├── index.tsx           # Hono SSR + ルーティング
│   └── api.ts              # APIルート
├── .env                    # 環境変数（Git管理外）
└── wrangler.toml           # Cloudflare設定
```

---

## トラブルシューティング

### `401 Unauthorized`

→ `JWT_SECRET` が正しく設定されているか確認

```bash
# プレビュー環境のシークレット確認
npx wrangler secret list --env preview
```

### 画像が404

→ `--remote` フラグを付けてR2にアップロードし直す

```bash
npx wrangler r2 object put tsuji1-blog-images/path/image.png --file ./image.png --remote
```

### ローカルでKVが空

→ `npm run dev` 後に seed スクリプトでテストデータ投入

```bash
node --env-file=.env scripts/seed-tags.mts
```
