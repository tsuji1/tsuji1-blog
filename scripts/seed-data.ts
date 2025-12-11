// scripts/seed-local.ts
// Run with: npx wrangler kv:key put --local --binding BLOG_POSTS_KV "posts:index" "[...slugs]"

const posts = [
  {
    slug: "hello-world",
    meta: {
      title: "Hello World - 最初の投稿",
      date: "2025-01-15",
      excerpt: "このブログの最初の投稿です。Hono SSRで動いています！"
    },
    html: `
      <p>こんにちは！これは<strong>tsuji1のブログ</strong>の最初の投稿です。</p>
      <p>このサイトは <a href="https://hono.dev">Hono</a> + Cloudflare Workers で動いています。</p>
      <h2>技術スタック</h2>
      <ul>
        <li>Hono - 軽量なWebフレームワーク</li>
        <li>Cloudflare Workers - エッジコンピューティング</li>
        <li>Cloudflare KV - 記事の永続化</li>
        <li>Cloudflare R2 - 画像ストレージ</li>
      </ul>
      <p><img src="/images/hello-world.png" alt="Hello World" /></p>
    `
  },
  {
    slug: "ctf-writeup-2025",
    meta: {
      title: "CTF Writeup - Example CTF 2025",
      date: "2025-02-10",
      excerpt: "Example CTF 2025のWeb問題のWriteupです。"
    },
    html: `
      <p>先日開催された <strong>Example CTF 2025</strong> に参加しました！</p>
      <h2>Web 100: SQL Injection</h2>
      <p>典型的なSQLインジェクションの問題でした。</p>
      <pre><code>' OR 1=1 --</code></pre>
      <p>これでバイパスできました。フラグは <code>flag{sql_1nj3ct10n_101}</code></p>
      <p><img src="/images/ctf-writeup.png" alt="CTF Screenshot" /></p>
    `
  },
  {
    slug: "network-fundamentals",
    meta: {
      title: "ネットワークの基礎 - OSI参照モデル",
      date: "2025-02-20",
      excerpt: "ネットワークエンジニアを目指す人向けのOSI参照モデル解説。"
    },
    html: `
      <p>ネットワークを理解する上で欠かせない<strong>OSI参照モデル</strong>について解説します。</p>
      <h2>7つの層</h2>
      <ol>
        <li>物理層 - ケーブルや電気信号</li>
        <li>データリンク層 - MACアドレス</li>
        <li>ネットワーク層 - IPアドレス</li>
        <li>トランスポート層 - TCP/UDP</li>
        <li>セッション層</li>
        <li>プレゼンテーション層</li>
        <li>アプリケーション層 - HTTP, HTTPS</li>
      </ol>
      <p><img src="/images/osi-model.png" alt="OSI Model" /></p>
    `
  },
  {
    slug: "cloudflare-workers-intro",
    meta: {
      title: "Cloudflare Workers入門",
      date: "2025-03-05",
      excerpt: "Cloudflare Workersでサーバーレスアプリを作る方法を解説。"
    },
    html: `
      <p><strong>Cloudflare Workers</strong> は、CDNエッジで動くサーバーレス環境です。</p>
      <h2>メリット</h2>
      <ul>
        <li>グローバルに低レイテンシ</li>
        <li>無料枠が充実（10万リクエスト/日）</li>
        <li>KV, R2, D1など豊富なサービス</li>
      </ul>
      <pre><code>export default {
  fetch(req) {
    return new Response("Hello from the edge!");
  }
}</code></pre>
    `
  },
  {
    slug: "hono-framework-guide",
    meta: {
      title: "Honoフレームワーク完全ガイド",
      date: "2025-03-15",
      excerpt: "日本発の軽量WebフレームワークHonoの使い方。"
    },
    html: `
      <p><strong>Hono</strong> は日本で開発された超軽量なWebフレームワークです。</p>
      <h2>特徴</h2>
      <ul>
        <li>超高速 - 12KB以下のバンドルサイズ</li>
        <li>TypeScript対応</li>
        <li>Cloudflare, Deno, Bun, Node.js対応</li>
      </ul>
      <pre><code>import { Hono } from 'hono';
const app = new Hono();
app.get('/', (c) => c.text('Hello Hono!'));
export default app;</code></pre>
      <p><img src="/images/hono-logo.png" alt="Hono" /></p>
    `
  },
  {
    slug: "linux-commands-cheatsheet",
    meta: {
      title: "よく使うLinuxコマンド集",
      date: "2025-04-01",
      excerpt: "日常的に使うLinuxコマンドをまとめました。"
    },
    html: `
      <p>サーバー管理でよく使う<strong>Linuxコマンド</strong>をまとめました。</p>
      <h2>ファイル操作</h2>
      <pre><code>ls -la          # 詳細一覧
cd /path/to/dir # ディレクトリ移動
cp src dst      # コピー
mv src dst      # 移動
rm -rf dir      # 再帰削除</code></pre>
      <h2>ネットワーク</h2>
      <pre><code>ip a            # IPアドレス確認
ss -tlnp        # ポート確認
curl -I url     # ヘッダー取得</code></pre>
    `
  },
  {
    slug: "docker-basics",
    meta: {
      title: "Docker入門 - コンテナの基礎",
      date: "2025-04-15",
      excerpt: "Dockerコンテナの基本的な使い方を解説。"
    },
    html: `
      <p><strong>Docker</strong> はアプリケーションをコンテナ化するツールです。</p>
      <h2>基本コマンド</h2>
      <pre><code>docker run -d nginx       # コンテナ起動
docker ps                  # 実行中コンテナ一覧
docker logs container_id   # ログ確認
docker exec -it id bash    # コンテナに入る</code></pre>
      <h2>Dockerfile例</h2>
      <pre><code>FROM node:20-alpine
WORKDIR /app
COPY . .
RUN npm install
CMD ["npm", "start"]</code></pre>
    `
  },
  {
    slug: "git-workflow",
    meta: {
      title: "Gitワークフロー - チーム開発の基本",
      date: "2025-05-01",
      excerpt: "チーム開発で使えるGitワークフローを紹介。"
    },
    html: `
      <p>チーム開発では適切な<strong>Gitワークフロー</strong>が重要です。</p>
      <h2>GitHub Flow</h2>
      <ol>
        <li>mainブランチから feature/xxx を作成</li>
        <li>コミット & プッシュ</li>
        <li>Pull Requestを作成</li>
        <li>レビュー後マージ</li>
      </ol>
      <pre><code>git checkout -b feature/new-feature
git add .
git commit -m "feat: add new feature"
git push origin feature/new-feature</code></pre>
    `
  },
  {
    slug: "typescript-tips",
    meta: {
      title: "TypeScript実践Tips",
      date: "2025-05-15",
      excerpt: "TypeScriptをより効果的に使うためのTips集。"
    },
    html: `
      <p><strong>TypeScript</strong> を使いこなすためのTipsを紹介します。</p>
      <h2>型推論を活用</h2>
      <pre><code>// 明示的な型指定は不要
const num = 42;  // number と推論される
const arr = [1, 2, 3];  // number[] と推論される</code></pre>
      <h2>Union Types</h2>
      <pre><code>type Status = "pending" | "success" | "error";
function handle(status: Status) { ... }</code></pre>
    `
  },
  {
    slug: "security-basics",
    meta: {
      title: "Webセキュリティの基礎",
      date: "2025-06-01",
      excerpt: "Webアプリ開発で知っておくべきセキュリティの基礎。"
    },
    html: `
      <p>Web開発者が知っておくべき<strong>セキュリティの基礎</strong>を解説します。</p>
      <h2>OWASP Top 10</h2>
      <ul>
        <li>インジェクション（SQL, XSS）</li>
        <li>認証の不備</li>
        <li>機密データの露出</li>
        <li>アクセス制御の不備</li>
      </ul>
      <h2>対策</h2>
      <ul>
        <li>入力値のバリデーション</li>
        <li>プリペアドステートメント</li>
        <li>CSP（Content Security Policy）</li>
        <li>HTTPS必須化</li>
      </ul>
      <p><img src="/images/security.png" alt="Security" /></p>
    `
  }
];

// 出力用
console.log("Posts to seed:");
posts.forEach(p => console.log(`- ${p.slug}: ${p.meta.title}`));
console.log("\nIndex:", JSON.stringify(posts.map(p => p.slug)));
