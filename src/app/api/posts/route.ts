// src/app/api/posts/route.ts
export const runtime = 'edge';

import { getRequestContext } from "@cloudflare/next-on-pages";
import { jwtVerify, type JWTPayload } from "jose";

type Env = { BLOG_POSTS_KV: KVNamespace; JWT_SECRET: string; JWT_ISSUER: string };
type Body = { slug: string; html: string; meta?: Record<string, unknown> };

function getBearer(req: Request): string | null {
  const h = req.headers.get("authorization") ?? req.headers.get("Authorization");
  if (!h) return null;
  const m = /^Bearer\s+(.+)$/i.exec(h);
  return m?.[1] ?? null;
}

async function verifyJWT(req: Request, env: Env): Promise<JWTPayload | null> {
  const token = getBearer(req);
  if (!token) return null;
  try {
    const secret = new TextEncoder().encode(env.JWT_SECRET);
    const { payload, protectedHeader } = await jwtVerify(token, secret, {
      issuer: env.JWT_ISSUER,
      clockTolerance: "60s",
    });
    if (protectedHeader.alg !== "HS256") return null;
    return payload;
  } catch {
    return null;
  }
}

export async function POST(request: Request) {
  const { env } = getRequestContext<Env>();

  const jwt = await verifyJWT(request, env);
  if (!jwt) return new Response("Unauthorized", { status: 401 });

  const body = (await request.text()); // ← textで受けてからJSON.parse（json()は使わない）
  let parsed: Body;
  try {
    parsed = JSON.parse(body) as Body;
  } catch {
    return new Response("Bad JSON", { status: 400 });
  }

  const { slug, html, meta } = parsed;
  if (!slug || !html) return new Response("Bad Request", { status: 400 });

  const idxRaw = await env.BLOG_POSTS_KV.get("posts:index");
  const list: string[] = idxRaw ? JSON.parse(idxRaw) : [];
  if (!list.includes(slug)) list.push(slug);

  await Promise.all([
    env.BLOG_POSTS_KV.put("posts:index", JSON.stringify(list)),
    env.BLOG_POSTS_KV.put(`post:${slug}:meta`, JSON.stringify(meta ?? {})),
    env.BLOG_POSTS_KV.put(`post:${slug}:html`, html, { metadata: { updatedAt: Date.now() } }),
  ]);

  return new Response(JSON.stringify({ ok: true, slug }), {
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": "no-store",
    },
  });
}
