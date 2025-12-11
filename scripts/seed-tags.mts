// scripts/seed-tags.mts
// Usage: node --env-file=.env scripts/seed-tags.mts
import { SignJWT } from "jose";

// Use localhost for local testing
const API = "http://localhost:8787";
const JWT_ISSUER = process.env.JWT_ISSUER ?? "tsuji1-blog";
const JWT_SECRET = process.env.JWT_SECRET!;
if (!JWT_SECRET) {
  console.error("JWT_SECRET is missing");
  process.exit(1);
}

// Generate JWT token
const token = await new SignJWT({ role: "editor" })
  .setProtectedHeader({ alg: "HS256" })
  .setIssuer(JWT_ISSUER)
  .setIssuedAt()
  .setExpirationTime("10m")
  .sign(new TextEncoder().encode(JWT_SECRET));

// Test posts with tags
const posts = [
  { slug: "hello-world", meta: { title: "Hello World - 最初の投稿", date: "2025-01-15", excerpt: "このブログの最初の投稿です。", tags: ["Blog", "Hono"] }, html: "<p>こんにちは！</p>" },
  { slug: "ctf-writeup-2025", meta: { title: "CTF Writeup - Example CTF 2025", date: "2025-02-10", excerpt: "CTFのWriteupです。", tags: ["CTF", "Security", "Web"] }, html: "<p>CTF参加レポート</p>" },
  { slug: "network-fundamentals", meta: { title: "ネットワークの基礎 - OSI参照モデル", date: "2025-02-20", excerpt: "OSI参照モデル解説。", tags: ["Network", "Infrastructure"] }, html: "<p>OSIモデル解説</p>" },
  { slug: "cloudflare-workers-intro", meta: { title: "Cloudflare Workers入門", date: "2025-03-05", excerpt: "サーバーレス入門。", tags: ["Cloudflare", "Serverless", "Web"] }, html: "<p>Workers入門</p>" },
  { slug: "hono-framework-guide", meta: { title: "Honoフレームワーク完全ガイド", date: "2025-03-15", excerpt: "Hono使い方ガイド。", tags: ["Hono", "Web", "TypeScript"] }, html: "<p>Hono解説</p>" },
  { slug: "linux-commands", meta: { title: "よく使うLinuxコマンド集", date: "2025-04-01", excerpt: "Linuxコマンドまとめ。", tags: ["Linux", "Infrastructure"] }, html: "<p>コマンド集</p>" },
  { slug: "docker-basics", meta: { title: "Docker入門", date: "2025-04-15", excerpt: "コンテナの基礎。", tags: ["Docker", "Infrastructure", "DevOps"] }, html: "<p>Docker解説</p>" },
  { slug: "git-workflow", meta: { title: "Gitワークフロー", date: "2025-05-01", excerpt: "チーム開発の基本。", tags: ["Git", "DevOps"] }, html: "<p>Gitワークフロー</p>" },
  { slug: "typescript-tips", meta: { title: "TypeScript実践Tips", date: "2025-05-15", excerpt: "TypeScript使いこなし。", tags: ["TypeScript", "Web"] }, html: "<p>TS Tips</p>" },
  { slug: "security-basics", meta: { title: "Webセキュリティの基礎", date: "2025-06-01", excerpt: "セキュリティ入門。", tags: ["Security", "Web"] }, html: "<p>セキュリティ入門</p>" },
  { slug: "ctf-writeup-2025-2", meta: { title: "CTF Writeup - Another CTF", date: "2025-06-15", excerpt: "別のCTFのWriteup。", tags: ["CTF", "Security"] }, html: "<p>CTF #2</p>" },
  { slug: "kubernetes-intro", meta: { title: "Kubernetes入門", date: "2025-07-01", excerpt: "K8sの基礎。", tags: ["Kubernetes", "Infrastructure", "DevOps"] }, html: "<p>K8s入門</p>" },
];

console.log(`Seeding ${posts.length} posts to ${API}...`);

for (const post of posts) {
  const res = await fetch(`${API}/api/posts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(post),
  });
  console.log(`${post.slug}: ${res.status}`);
}

console.log("Done!");
