# ブログ運用ガイド

## クイックスタート

```bash
# ヘルプを表示
npm run blog

# 記事を投稿
npm run blog publish my-article

# プレビュー環境に投稿
npm run blog publish my-article -- --preview

# 記事一覧を表示
npm run blog list

# 記事を削除
npm run blog delete old-article
```

---

## 記事の構成

### 構成パターン

記事は2つの形式で作成できます：

```
content/posts/
├── simple-article.mdx              # パターン1: 単一ファイル
│
└── article-with-images/            # パターン2: ディレクトリ形式
    ├── index.mdx                   # 記事本文
    ├── screenshot.png              # 画像（自動アップロード）
    └── diagram.svg
```

### Frontmatter

```yaml
---
title: 記事のタイトル
date: 2025-01-15
excerpt: ブログ一覧に表示される概要（1-2行）
tags:
  - CTF
  - Security
  - Web
---
```

| フィールド | 必須 | 説明 |
|-----------|-----|------|
| `title` | ✅ | 記事タイトル |
| `date` | ✅ | 投稿日 (YYYY-MM-DD) |
| `excerpt` | 推奨 | 概要文 |
| `tags` | 任意 | タグ配列 |

### サポートする記法

| 記法 | 説明 |
|------|------|
| `# `, `## `, `### `... | 見出し（自動で # プレフィックス表示） |
| `**太字**` | **太字** |
| `` `コード` `` | インラインコード |
| ` ```lang ` | コードブロック（シンタックスハイライト） |
| `$E=mc^2$` | インライン数式（KaTeX） |
| `$$..$$` | ブロック数式 |
| `![alt](./image.png)` | 画像（相対パス → R2に自動アップロード） |

---

## Blog CLI コマンド

### publish - 記事を投稿

```bash
npm run blog publish <slug> [--preview]
```

- MDXファイルを読み込んでHTMLに変換
- 画像を自動でR2にアップロード
- KVに記事を保存

### delete - 記事を削除

```bash
npm run blog delete <slug> [--preview]
```

- KVから記事を削除（R2の画像は手動削除が必要）

### list - 記事一覧

```bash
npm run blog list [--preview]
```

- 投稿済みの記事を日付順で一覧表示

### update-tags - タグのみ更新

```bash
npm run blog update-tags <slug> [--preview]
```

- MDXのfrontmatterからタグを再読み込みして更新

---

## 開発

```bash
# ローカル開発
npm run dev

# プレビュー環境にデプロイ
npm run deploy:preview

# 本番デプロイ
npm run deploy
```

---

## 環境変数 (.env)

```env
JWT_SECRET=your-secret-key-here
JWT_ISSUER=tsuji1-blog
API=http://localhost:8787
```

### Cloudflare シークレット

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
| `npm run dev` | ローカル開発サーバー |
| `npm run deploy` | 本番デプロイ |
| `npm run deploy:preview` | プレビューデプロイ |
| `npm run blog` | Blog CLI ヘルプ |
| `npm run blog publish <slug>` | 記事投稿 |
| `npm run blog delete <slug>` | 記事削除 |
| `npm run blog list` | 記事一覧 |
| `npm run blog update-tags <slug>` | タグ更新 |

---

## ディレクトリ構成

```
tsuji1-blog/
├── content/posts/          # 記事ファイル
│   ├── _template.mdx       # テンプレート
│   ├── my-article.mdx      # 単一ファイル形式
│   └── another-article/    # ディレクトリ形式
│       ├── index.mdx
│       └── image.png
├── scripts/
│   └── blog-cli.mts        # Blog CLI
├── src/server/
│   ├── index.tsx           # Hono SSR
│   └── api.ts              # API
├── .env                    # 環境変数
└── wrangler.toml           # Cloudflare設定
```
