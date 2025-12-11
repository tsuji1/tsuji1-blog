# tsuji1-blog

[tsuji1](https://github.com/tsuji1)の個人サイト・ブログ。

**技術スタック**: Hono SSR + Cloudflare Workers + KV + R2

## 開発

```bash
# 依存インストール
npm install

# ローカル開発サーバー起動
npm run dev

# リモートKV/R2を使って開発
npm run dev:remote
```

## デプロイ

```bash
# 本番デプロイ
npm run deploy

# プレビュー環境デプロイ
npm run deploy:preview
```

## 記事の投稿

詳細は [INSTRUCTION.md](./INSTRUCTION.md) を参照。

```bash
npm run blog publish [slug]
```

## RSS

RSSフィードは以下で購読できます：

```
https://tsuji1.dev/feed.xml
```

## SEO

以下のSEO対策が実装されています：

- Open Graph (og:title, og:description, og:image, og:url)
- Twitter Card (summary)
- meta description
- RSS autodiscovery (`<link rel="alternate">`)

