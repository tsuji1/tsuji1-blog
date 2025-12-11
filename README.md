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
# 1. content/posts/[slug].mdx を作成
# 2. 投稿
node --env-file=.env scripts/publish.mts [slug]
```
