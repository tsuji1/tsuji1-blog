import { Hono } from 'hono';
import { jwtVerify, type JWTPayload } from 'jose';

type Bindings = {
  BLOG_POSTS_KV: KVNamespace;
  JWT_SECRET: string;
  JWT_ISSUER: string;
};

type PostBody = { slug: string; html: string; meta?: Record<string, unknown> };

const api = new Hono<{ Bindings: Bindings }>();

// Helper: Extract Bearer token
function getBearer(req: Request): string | null {
  const h = req.headers.get('authorization') ?? req.headers.get('Authorization');
  if (!h) return null;
  const m = /^Bearer\s+(.+)$/i.exec(h);
  return m?.[1] ?? null;
}

// Helper: Verify JWT
async function verifyJWT(req: Request, env: Bindings): Promise<JWTPayload | null> {
  const token = getBearer(req);
  if (!token) return null;
  try {
    const secret = new TextEncoder().encode(env.JWT_SECRET);
    const { payload, protectedHeader } = await jwtVerify(token, secret, {
      issuer: env.JWT_ISSUER,
      clockTolerance: '60s',
    });
    if (protectedHeader.alg !== 'HS256') return null;
    return payload;
  } catch {
    return null;
  }
}

// GET /api/posts - List all posts
api.get('/posts', async (c) => {
  const idx = await c.env.BLOG_POSTS_KV.get('posts:index');
  const slugs: string[] = idx ? JSON.parse(idx) : [];

  const posts = await Promise.all(
    slugs.map(async (slug) => {
      const m = await c.env.BLOG_POSTS_KV.get(`post:${slug}:meta`);
      const meta = m ? JSON.parse(m) : {};
      return { slug, ...meta };
    })
  );

  return c.json(
    { posts },
    200,
    {
      'cache-control': 'public, max-age=60, s-maxage=60, stale-while-revalidate=30',
    }
  );
});

// GET /api/posts/:slug - Get single post
api.get('/posts/:slug', async (c) => {
  const slug = c.req.param('slug');

  const [metaRaw, mdx, html] = await Promise.all([
    c.env.BLOG_POSTS_KV.get(`post:${slug}:meta`),
    c.env.BLOG_POSTS_KV.get(`post:${slug}:mdx`),
    c.env.BLOG_POSTS_KV.get(`post:${slug}:html`),
  ]);

  if (!metaRaw || (!mdx && !html)) {
    return c.json({ error: 'Not Found' }, 404);
  }

  let body: unknown;
  try {
    const meta = JSON.parse(metaRaw) as Record<string, unknown>;
    body = mdx
      ? { kind: 'mdx' as const, meta, mdx }
      : { kind: 'html' as const, meta, html };
  } catch {
    return c.json({ error: 'Bad meta' }, 500);
  }

  return c.json(body, 200, {
    'cache-control': 'public, max-age=60, s-maxage=60, stale-while-revalidate=30',
  });
});

// POST /api/posts - Create/update post (requires JWT)
api.post('/posts', async (c) => {
  const jwt = await verifyJWT(c.req.raw, c.env);
  if (!jwt) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const body = await c.req.text();
  let parsed: PostBody;
  try {
    parsed = JSON.parse(body) as PostBody;
  } catch {
    return c.json({ error: 'Bad JSON' }, 400);
  }

  const { slug, html, meta } = parsed;
  if (!slug || !html) {
    return c.json({ error: 'Bad Request' }, 400);
  }

  const idxRaw = await c.env.BLOG_POSTS_KV.get('posts:index');
  const list: string[] = idxRaw ? JSON.parse(idxRaw) : [];
  if (!list.includes(slug)) list.push(slug);

  await Promise.all([
    c.env.BLOG_POSTS_KV.put('posts:index', JSON.stringify(list)),
    c.env.BLOG_POSTS_KV.put(`post:${slug}:meta`, JSON.stringify(meta ?? {})),
    c.env.BLOG_POSTS_KV.put(`post:${slug}:html`, html, { metadata: { updatedAt: Date.now() } }),
  ]);

  return c.json({ ok: true, slug }, 200, {
    'cache-control': 'no-store',
  });
});

// DELETE /api/posts/:slug - Delete post (requires JWT)
api.delete('/posts/:slug', async (c) => {
  const jwt = await verifyJWT(c.req.raw, c.env);
  if (!jwt) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const slug = c.req.param('slug');

  // Check if post exists
  const metaRaw = await c.env.BLOG_POSTS_KV.get(`post:${slug}:meta`);
  if (!metaRaw) {
    return c.json({ error: 'Not Found' }, 404);
  }

  // Remove from index
  const idxRaw = await c.env.BLOG_POSTS_KV.get('posts:index');
  const list: string[] = idxRaw ? JSON.parse(idxRaw) : [];
  const newList = list.filter(s => s !== slug);

  await Promise.all([
    c.env.BLOG_POSTS_KV.put('posts:index', JSON.stringify(newList)),
    c.env.BLOG_POSTS_KV.delete(`post:${slug}:meta`),
    c.env.BLOG_POSTS_KV.delete(`post:${slug}:html`),
    c.env.BLOG_POSTS_KV.delete(`post:${slug}:mdx`),
  ]);

  return c.json({ ok: true, slug }, 200, {
    'cache-control': 'no-store',
  });
});

// PUT /api/posts/:slug/meta - Update post metadata only (requires JWT)
api.put('/posts/:slug/meta', async (c) => {
  const jwt = await verifyJWT(c.req.raw, c.env);
  if (!jwt) {
    return c.json({ error: 'Unauthorized' }, 401);
  }

  const slug = c.req.param('slug');

  // Check if post exists
  const oldMeta = await c.env.BLOG_POSTS_KV.get(`post:${slug}:meta`);
  if (!oldMeta) {
    return c.json({ error: 'Not Found' }, 404);
  }

  const body = await c.req.text();
  let meta: Record<string, unknown>;
  try {
    meta = JSON.parse(body);
  } catch {
    return c.json({ error: 'Bad JSON' }, 400);
  }

  await c.env.BLOG_POSTS_KV.put(`post:${slug}:meta`, JSON.stringify(meta));

  return c.json({ ok: true, slug, meta }, 200, {
    'cache-control': 'no-store',
  });
});

export default api;
