// scripts/publish.mts  (Node 18+)
// ex) node --env-file=.env scripts/publish.mts my-first-post 
import { SignJWT } from 'jose'
import { readFile } from 'node:fs/promises'
const API = process.env.API ?? 'https://tsuji1.dev'
const JWT_ISSUER = process.env.JWT_ISSUER ?? 'tsuji1-blog-preview'
const JWT_SECRET = process.env.JWT_SECRET! // .env などで渡す

if (!JWT_SECRET) {
  console.error('JWT_SECRET is missing')
  process.exit(1)
}

const token = await new SignJWT({ role: 'editor' })
  .setProtectedHeader({ alg: 'HS256' })
  .setIssuer(JWT_ISSUER)
  .setIssuedAt()
  .setExpirationTime('10m')
  .sign(new TextEncoder().encode(JWT_SECRET))

// ここではローカルのMDXファイルを送る例
const slug = process.argv[2] ?? 'hello-world'
const mdx = await readFile(`content/posts/${slug}.mdx`, 'utf8')
const meta = { title: 'Hello from CLI', date: new Date().toISOString().slice(0,10) }

const res = await fetch(`${API}/api/posts`, {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({ slug, meta, mdx })
})
console.log(res.status, await res.text())
