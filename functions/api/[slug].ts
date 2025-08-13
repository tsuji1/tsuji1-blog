import type { KVNamespace, PagesFunction} from '@cloudflare/workers-types'


type Env = { BLOG_POSTS_KV: KVNamespace }

export const onRequestGet: PagesFunction<Env> = async ({ params, env }) => {
  const slug = params.slug as string
  const [metaRaw, mdx] = await Promise.all([
    env.BLOG_POSTS_KV.get(`post:${slug}:meta`),
    env.BLOG_POSTS_KV.get(`post:${slug}:mdx`),
  ])
  if (!metaRaw || !mdx) return new Response('Not Found', { status: 404 }) 
  return Response.json({ meta: JSON.parse(metaRaw), mdx }) 
}
