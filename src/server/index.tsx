/** @jsxImportSource hono/jsx */
import { Hono } from 'hono';
import { html } from 'hono/html';
import api from './api';

type Bindings = {
  BLOG_POSTS_KV: KVNamespace;
  IMAGES_R2: R2Bucket;
  JWT_SECRET: string;
  JWT_ISSUER: string;
};

const app = new Hono<{ Bindings: Bindings }>();

// API routes
app.route('/api', api);

// R2 Images
app.get('/images/:key', async (c) => {
  const key = c.req.param('key');
  const object = await c.env.IMAGES_R2.get(key);
  if (!object) return c.notFound();
  
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('cache-control', 'public, max-age=31536000');
  
  return new Response(object.body, { headers });
});

// Layout template
const layout = (title: string, content: string) => html`
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | tsuji1 website</title>
  <meta name="description" content="Welcome to my page!">
  <style>
    :root {
      --background: #ffffff;
      --foreground: #171717;
      --gray-50: #f9fafb;
      --gray-100: #f3f4f6;
      --gray-300: #d1d5db;
      --gray-500: #6b7280;
      --gray-600: #4b5563;
      --gray-700: #374151;
      --gray-800: #1f2937;
    }
    @media (prefers-color-scheme: dark) {
      :root {
        --background: #0a0a0a;
        --foreground: #ededed;
        --gray-50: #1a1a1a;
        --gray-100: #2a2a2a;
        --gray-300: #4a4a4a;
        --gray-500: #8a8a8a;
        --gray-600: #a0a0a0;
        --gray-700: #c0c0c0;
        --gray-800: #2a2a2a;
      }
    }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      background: var(--background);
      color: var(--foreground);
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      line-height: 1.6;
    }
    a { color: inherit; text-decoration: none; }
    .nav { background: var(--gray-800); padding: 1rem 0; }
    .nav-container { max-width: 80rem; margin: 0 auto; padding: 0 1rem; display: flex; align-items: center; justify-content: space-between; }
    .nav-brand { color: white; font-weight: bold; font-size: 1.25rem; }
    .nav-links { display: flex; gap: 1rem; }
    .nav-link { color: var(--gray-300); padding: 0.5rem 0.75rem; border-radius: 0.375rem; transition: background 0.2s, color 0.2s; }
    .nav-link:hover { background: var(--gray-700); color: white; }
    .profile-container { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: calc(100vh - 60px); padding: 1rem; }
    .profile-content { display: flex; flex-direction: column; align-items: center; margin-bottom: 1.5rem; }
    @media (min-width: 768px) { .profile-content { flex-direction: row; } }
    .profile-avatar { border-radius: 50%; }
    .profile-info { margin-top: 1rem; text-align: center; }
    @media (min-width: 768px) { .profile-info { margin-top: 0; margin-left: 1.5rem; text-align: left; } }
    .profile-name { font-size: 1.5rem; font-weight: bold; }
    .profile-desc { font-size: 1.125rem; }
    .profile-detail { font-size: 1rem; margin-top: 0.5rem; }
    .social-links { display: flex; gap: 1rem; margin-top: 1rem; }
    .social-link { font-size: 2rem; transition: color 0.2s; }
    .social-link:hover { color: var(--gray-600); }
    .blog-container { max-width: 56rem; margin: 0 auto; padding: 4rem 1rem 2rem; }
    .blog-title { font-size: 2.25rem; font-weight: bold; margin-bottom: 2rem; }
    .blog-list { list-style: none; display: flex; flex-direction: column; gap: 2rem; }
    .blog-item { background: var(--gray-50); border-radius: 0.5rem; transition: background 0.2s; }
    .blog-item:hover { background: var(--gray-100); }
    .blog-link { display: block; padding: 1.5rem; }
    .blog-item-title { color: var(--gray-600); margin-bottom: 0.75rem; margin-top: 0.5rem; }
    .blog-item-date { color: var(--gray-600); }
    .blog-item-excerpt { color: var(--gray-600); margin-top: 1rem; margin-bottom: 0.5rem; }
    .post-container { max-width: 56rem; margin: 0 auto; padding: 3rem 1rem; }
    .post-article { max-width: 65ch; margin: 0 auto; }
    .post-header { margin-bottom: 2rem; text-align: center; }
    .post-title { font-size: 2.5rem; font-weight: bold; margin-bottom: 1rem; }
    @media (min-width: 768px) { .post-title { font-size: 3rem; } }
    .post-date { color: var(--gray-500); }
    .post-content { line-height: 1.8; }
    .post-content h1, .post-content h2, .post-content h3 { margin-top: 2rem; margin-bottom: 1rem; }
    .post-content p { margin-bottom: 1rem; }
    .post-content pre { background: var(--gray-100); padding: 1rem; border-radius: 0.5rem; overflow-x: auto; margin-bottom: 1rem; }
    .post-content code { background: var(--gray-100); padding: 0.125rem 0.25rem; border-radius: 0.25rem; font-size: 0.875em; }
    .post-content pre code { background: none; padding: 0; }
    .post-content a { color: #3b82f6; text-decoration: underline; }
    .post-content img { max-width: 100%; height: auto; border-radius: 0.5rem; }
  </style>
</head>
<body>
  <nav class="nav">
    <div class="nav-container">
      <div><a href="/" class="nav-brand">tsuji1's Webpage</a></div>
      <div class="nav-links">
        <a href="/" class="nav-link">Profile</a>
        <a href="/blog" class="nav-link">Blog</a>
      </div>
    </div>
  </nav>
  ${html([content])}
</body>
</html>
`;

// Profile page
app.get('/', (c) => {
  const content = `
    <div class="profile-container">
      <div class="profile-content">
        <img src="https://github.com/tsuji1.png" alt="tsuji1's GitHub profile picture" width="200" height="200" class="profile-avatar" />
        <div class="profile-info">
          <h1 class="profile-name">tsuji1</h1>
          <p class="profile-desc">I'm student of University of Electro-Communications.</p>
          <p class="profile-detail">ネットワークなどITインフラやCTFがスキです．MMAに所属．</p>
        </div>
      </div>
      <div class="social-links">
        <a href="https://github.com/tsuji1" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="GitHub Profile">
          <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
            <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
          </svg>
        </a>
        <a href="https://x.com/t2uj1" target="_blank" rel="noopener noreferrer" class="social-link" aria-label="X.com Profile">
          <svg viewBox="0 0 24 24" width="32" height="32" fill="currentColor">
            <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
          </svg>
        </a>
      </div>
    </div>
  `;
  return c.html(layout('Profile', content));
});

// Blog list page
app.get('/blog', async (c) => {
  const idx = await c.env.BLOG_POSTS_KV.get('posts:index');
  const slugs: string[] = idx ? JSON.parse(idx) : [];
  
  const posts = await Promise.all(
    slugs.map(async (slug) => {
      const m = await c.env.BLOG_POSTS_KV.get(`post:${slug}:meta`);
      const meta = m ? JSON.parse(m) : {};
      return { slug, ...meta };
    })
  );
  
  const postsHtml = posts.map((meta: { slug: string; title?: string; date?: string; excerpt?: string }) => {
    const title = meta.title ?? meta.slug.replace(/-/g, ' ');
    const dateLabel = meta.date ? meta.date.slice(0, 10) : '';
    return `
      <li class="blog-item">
        <a href="/${meta.slug}" class="blog-link">
          <h2 class="blog-item-title">${title}</h2>
          ${dateLabel ? `<small class="blog-item-date">${dateLabel}</small>` : ''}
          ${meta.excerpt ? `<p class="blog-item-excerpt">${meta.excerpt}</p>` : ''}
        </a>
      </li>
    `;
  }).join('');
  
  const content = `
    <div class="blog-container">
      <section class="blog-section">
        <h1 class="blog-title">Blog</h1>
        <ul class="blog-list">
          ${postsHtml || '<li>No posts yet.</li>'}
        </ul>
      </section>
    </div>
  `;
  
  return c.html(layout('Blog', content));
});

// Post detail page
app.get('/:slug', async (c) => {
  const slug = c.req.param('slug');
  
  // Skip if it looks like a file request
  if (slug.includes('.')) return c.notFound();
  
  const [metaRaw, postHtml] = await Promise.all([
    c.env.BLOG_POSTS_KV.get(`post:${slug}:meta`),
    c.env.BLOG_POSTS_KV.get(`post:${slug}:html`),
  ]);
  
  if (!metaRaw || !postHtml) return c.notFound();
  
  let meta: { title?: string; date?: string; excerpt?: string } = {};
  try { meta = JSON.parse(metaRaw); } catch {}
  
  const title = meta.title ?? slug.replace(/-/g, ' ');
  const dateLabel = meta.date ? meta.date.slice(0, 10) : '';
  
  const content = `
    <div class="post-container">
      <article class="post-article">
        <header class="post-header">
          <h1 class="post-title">${title}</h1>
          ${dateLabel ? `<time class="post-date" datetime="${dateLabel}">${dateLabel}</time>` : ''}
        </header>
        <div class="post-content">
          ${postHtml}
        </div>
      </article>
    </div>
  `;
  
  return c.html(layout(title, content));
});

export default app;
