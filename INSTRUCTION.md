# ブログ運用ガイド

## 記事の作成と投稿

### 1. MDXファイルを作成

`content/posts/[slug].mdx` にファイルを作成：

```mdx
---
title: 記事のタイトル
date: 2025-01-15
excerpt: 記事の概要（ブログ一覧に表示）
tags:
  - CTF
  - Security
  - Web
---

ここに本文をMarkdown形式で記述。

## 見出し

本文の続き...
```

### 2. 記事を投稿

```bash
node --env-file=.env scripts/publish.mts [slug]
```

例: `content/posts/my-first-post.mdx` を投稿する場合：

```bash
node --env-file=.env scripts/publish.mts my-first-post
```

---

## 開発

### ローカル開発

```bash
# ローカルKV/R2エミュレータ使用
npm run dev
```

### リモート接続

```bash
# 本番KV/R2に接続（データ確認用）
npm run dev:remote
```

---

## デプロイ

> **注意**: `wrangler` コマンドは `npx wrangler` で実行してください。

### 初回セットアップ

```bash
# R2バケット作成
npx wrangler r2 bucket create tsuji1-blog-images
```

### デプロイコマンド

```bash
# 本番
npm run deploy

# プレビュー
npm run deploy:preview
```

---

## 画像の管理

### R2に画像をアップロード

```bash
npx wrangler r2 object put tsuji1-blog-images/[filename] --file ./path/to/image.png
```

### 記事内で参照

```html
<img src="/images/[filename]" alt="説明" />
```

---

## 環境変数 (.env)

```env
JWT_SECRET=your-secret-key
JWT_ISSUER=tsuji1-blog
API=http://localhost:8787
```

---

## ディレクトリ構成

```
tsuji1-blog/
├── content/posts/     # MDX記事ファイル
├── public/            # 静的ファイル
├── scripts/
│   ├── publish.mts    # 記事投稿スクリプト
│   └── seed-tags.mts  # テストデータ投入
├── src/
│   └── server/
│       ├── index.tsx  # Hono SSRエントリ
│       └── api.ts     # APIルート
└── wrangler.toml      # Cloudflare設定
```

---

## タグについて

- frontmatterの `tags` 配列にタグを指定
- ブログページ左側にタグサイドバー表示
- `?tag=xxx` でフィルタリング可能
