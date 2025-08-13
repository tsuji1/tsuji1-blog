import type { KVNamespace, PagesFunction } from '@cloudflare/workers-types'
import { jwtVerify } from 'jose'

type Env = {
  BLOG_POSTS_KV: KVNamespace
  JWT_SECRET: string
  JWT_ISSUER: string
}

async function verifyJWT(req: Request, env: Env) {
  const auth = req.headers.get('authorization') || ''
  const m = auth.match(/^Bearer\s+(.+)$/i)
  if (!m) return null
  const secret = new TextEncoder().encode(env.JWT_SECRET)
  try {
    const { payload } = await jwtVerify(m[1], secret, {
      issuer: env.JWT_ISSUER,
      algorithms: ['HS256'],
    })
    return payload
  } catch {
    return null
  }
}

export const onRequestGet: PagesFunction<Env> = async ({ env }) => {
  const raw = await env.BLOG_POSTS_KV.get('posts:index')
  const slugs: string[] = raw ? JSON.parse(raw) : []
  return Response.json({ slugs })
}

export const onRequestPost: PagesFunction<Env> = async ({ request, env }) => {
  const jwt = await verifyJWT(request, env)
  if (!jwt) return new Response('Unauthorized', { status: 401 })

  type Body = { slug: string; mdx: string; meta?: Record<string, any> }
  const body = await request.json() as Body
  if (!body.slug || !body.mdx) return new Response('Bad Request', { status: 400 })

  const indexRaw = await env.BLOG_POSTS_KV.get('posts:index')
  const list: string[] = indexRaw ? JSON.parse(indexRaw) : []
  if (!list.includes(body.slug)) list.push(body.slug)

  await Promise.all([
    env.BLOG_POSTS_KV.put('posts:index', JSON.stringify(list)),
    env.BLOG_POSTS_KV.put(`post:${body.slug}:meta`, JSON.stringify(body.meta ?? {})),
    env.BLOG_POSTS_KV.put(`post:${body.slug}:mdx`, body.mdx, { metadata: { updatedAt: Date.now() } }),
  ])

  return Response.json({ ok: true, slug: body.slug })
}
