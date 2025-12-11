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

## JWT認証の仕組み

### 概要

記事投稿API (`POST /api/posts`) は **JWT (JSON Web Token)** で認証されています。
これにより、秘密鍵を持つ人だけが記事を投稿・更新できます。

### フロー

```
┌─────────────┐    ┌─────────────┐    ┌─────────────┐
│ publish.mts │───>│ JWT Token   │───>│ API Server  │
│   (ローカル) │    │ (署名付き)   │    │ (検証)      │
└─────────────┘    └─────────────┘    └─────────────┘
      │                   │                  │
      │ JWT_SECRET で署名  │ Bearerトークン    │ JWT_SECRET で検証
      │                   │ として送信        │ issuer/期限チェック
```

### 関係するファイル

| ファイル | 役割 |
|---------|------|
| `.env` | `JWT_SECRET` を保存（ローカル用、Gitignore対象） |
| `publish.mts` | JWTを生成してAPIに送信 |
| `src/server/api.ts` | JWTを検証、正しければ投稿許可 |
| Cloudflare Secret | 本番/プレビュー環境の `JWT_SECRET` |

### JWT生成（publish.mts）

```typescript
const token = await new SignJWT({ role: "editor" })
  .setProtectedHeader({ alg: "HS256" })
  .setIssuer(JWT_ISSUER)      // "tsuji1-blog" or "tsuji1-blog-preview"
  .setExpirationTime("10m")   // 10分で期限切れ
  .sign(new TextEncoder().encode(JWT_SECRET));
```

### JWT検証（api.ts）

```typescript
const { payload } = await jwtVerify(token, secret, {
  issuer: env.JWT_ISSUER,     // 環境変数と一致するかチェック
  clockTolerance: '60s',
});
```

### セキュリティポイント

1. **JWT_SECRET は絶対に公開しない** - `.env` は `.gitignore` に含まれている
2. **issuer が一致しないとエラー** - 本番とプレビューで別々の issuer
3. **10分で期限切れ** - 長時間有効なトークンは危険
4. **Cloudflare Secret** - `wrangler secret put` で安全に保存される（暗号化）

### 環境別のシークレット設定

```bash
# 本番環境
npx wrangler secret put JWT_SECRET

# プレビュー環境
npx wrangler secret put JWT_SECRET --env preview
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
