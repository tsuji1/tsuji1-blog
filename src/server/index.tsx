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

// R2 Images (supports nested paths like /images/slug/filename.png)
app.get('/images/*', async (c) => {
  const key = c.req.path.replace('/images/', '');
  console.log('R2 request key:', key);
  const object = await c.env.IMAGES_R2.get(key);
  if (!object) {
    console.log('R2 object not found for key:', key);
    return c.notFound();
  }
  
  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set('cache-control', 'public, max-age=31536000');
  
  return new Response(object.body, { headers });
});

// SEO metadata type
type SEOMeta = {
  description?: string;
  ogImage?: string;
  ogType?: string;
  url?: string;
};

// Layout template with SEO support
const layout = (title: string, content: string, seo: SEOMeta = {}) => {
  const description = seo.description || 'tsuji1のブログです。技術記事やCTFについて書いています。';
  const ogImage = seo.ogImage || 'https://github.com/tsuji1.png';
  const ogType = seo.ogType || 'website';
  const url = seo.url || 'https://tsuji1.dev';
  
  return html`
<!DOCTYPE html>
<html lang="ja">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} | tsuji1 website</title>
  <meta name="description" content="${description}">
  <link rel="icon" type="image/png" href="https://github.com/tsuji1.png">
  <link rel="alternate" type="application/rss+xml" title="tsuji1 blog RSS" href="/feed.xml">
  <!-- Open Graph -->
  <meta property="og:title" content="${title} | tsuji1 website">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${ogImage}">
  <meta property="og:url" content="${url}">
  <meta property="og:type" content="${ogType}">
  <meta property="og:site_name" content="tsuji1 website">
  <!-- Twitter Card -->
  <meta name="twitter:card" content="summary">
  <meta name="twitter:title" content="${title} | tsuji1 website">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${ogImage}">
  <!-- KaTeX for math rendering -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.css">
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/katex.min.js"></script>
  <script defer src="https://cdn.jsdelivr.net/npm/katex@0.16.9/dist/contrib/auto-render.min.js"
    onload="renderMathInElement(document.body, {delimiters: [{left: '$$', right: '$$', display: true}, {left: '$', right: '$', display: false}]});">
  </script>
  <!-- Highlight.js for syntax highlighting (light/dark adaptive) -->
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/styles/github.min.css" media="(prefers-color-scheme: light)">
  <link rel="stylesheet" href="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/styles/github-dark.min.css" media="(prefers-color-scheme: dark)">
  <script src="https://cdn.jsdelivr.net/gh/highlightjs/cdn-release@11.9.0/build/highlight.min.js"></script>
  <script>document.addEventListener('DOMContentLoaded', () => hljs.highlightAll());</script>
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
        --foreground: #f0f0f0;
        --gray-50: #1a1a1a;
        --gray-100: #252525;
        --gray-300: #555555;
        --gray-500: #999999;
        --gray-600: #bbbbbb;
        --gray-700: #dddddd;
        --gray-800: #1f1f1f;
        --content-bg: #111111;
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
    .nav-link:hover { background: var(--gray-700); color: var(--foreground); }
    @media (prefers-color-scheme: dark) {
      .nav-link { color: #bbbbbb; }
      .nav-link:hover { background: #333333; color: white; }
    }
    /* Back button */
    .back-bar { max-width: 80rem; margin: 0 auto; padding: 1rem 1rem 0; }
    .back-btn { display: inline-flex; align-items: center; gap: 0.5rem; color: var(--gray-600); font-size: 0.9rem; padding: 0.5rem 0; transition: color 0.2s; }
    .back-btn:hover { color: var(--foreground); }
    .back-btn svg { width: 1rem; height: 1rem; }
    .profile-container { display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: calc(100vh - 60px); padding: 1rem; }
    .profile-content { display: flex; flex-direction: column; align-items: center; margin-bottom: 1.5rem; }
    @media (min-width: 768px) { .profile-content { flex-direction: row; } }
    .profile-avatar { border-radius: 50%; }
    .profile-info { margin-top: 1rem; text-align: center; }
    @media (min-width: 768px) { .profile-info { margin-top: 0; margin-left: 1.5rem; text-align: left; } }
    .profile-name { font-size: 1.5rem; font-weight: bold; }
    .profile-desc { font-size: 1.125rem; color: var(--gray-600); }
    .profile-detail { font-size: 1rem; margin-top: 0.5rem; color: var(--gray-500); }
    @media (prefers-color-scheme: dark) {
      .profile-desc { color: #cccccc; }
      .profile-detail { color: #aaaaaa; }
    }
    .social-links { display: flex; gap: 1rem; margin-top: 1rem; }
    .social-link { font-size: 2rem; transition: color 0.2s; }
    .social-link:hover { color: var(--gray-600); }
    /* Blog layout with sidebar */
    .blog-layout { display: flex; gap: 2rem; max-width: 72rem; margin: 0 auto; padding: 2rem 1rem; }
    .tags-sidebar { width: 200px; flex-shrink: 0; padding-top: 2rem; }
    .tags-title { font-size: 1rem; font-weight: bold; margin-bottom: 1rem; color: var(--foreground); }
    .tags-list { list-style: none; display: flex; flex-direction: column; gap: 0.5rem; }
    .tag-link { display: block; padding: 0.5rem 0.75rem; border-radius: 0.375rem; color: var(--gray-600); transition: background 0.2s; }
    .tag-link:hover { background: var(--gray-100); }
    .tag-link.active { background: var(--gray-800); color: white; }
    @media (prefers-color-scheme: dark) { .tag-link { color: #cccccc; } .tag-link.active { background: #444444; } }
    @media (max-width: 768px) { .blog-layout { flex-direction: column; } .tags-sidebar { width: 100%; padding-top: 0; } .tags-list { flex-direction: row; flex-wrap: wrap; } }
    .blog-container { flex: 1; max-width: 56rem; padding: 2rem 0; }
    .blog-title { font-size: 2.25rem; font-weight: bold; margin-bottom: 0.5rem; color: var(--foreground); }
    .blog-count { color: var(--gray-500); margin-bottom: 2rem; }
    .blog-list { list-style: none; display: flex; flex-direction: column; gap: 1.5rem; }
    .blog-item { background: var(--gray-50); border-radius: 0.5rem; transition: background 0.2s; }
    .blog-item:hover { background: var(--gray-100); }
    .blog-link { display: block; padding: 1.5rem; }
    .blog-item-title { color: var(--foreground); font-size: 1.25rem; margin-bottom: 0.5rem; margin-top: 0; }
    .blog-item-date { color: var(--gray-500); font-size: 0.875rem; }
    .blog-item-tags { display: flex; gap: 0.5rem; margin-top: 0.5rem; flex-wrap: wrap; }
    .blog-tag { background: var(--gray-200, #e5e7eb); color: var(--gray-600); padding: 0.25rem 0.5rem; border-radius: 0.25rem; font-size: 0.75rem; }
    @media (prefers-color-scheme: dark) { .blog-tag { background: #333; color: #ccc; } }
    .blog-item-excerpt { color: var(--gray-600); margin-top: 0.75rem; margin-bottom: 0; font-size: 0.9rem; }
    /* Pagination */
    .pagination { display: flex; gap: 0.5rem; justify-content: center; margin-top: 2rem; align-items: center; flex-wrap: wrap; }
    .page-link { padding: 0.5rem 1rem; border-radius: 0.375rem; background: var(--gray-100); color: var(--foreground); transition: background 0.2s; }
    .page-link:hover { background: var(--gray-200, #e5e7eb); }
    .page-current { padding: 0.5rem 1rem; border-radius: 0.375rem; background: var(--gray-800); color: white; }
    .page-ellipsis { padding: 0.5rem; color: var(--gray-500); }
    /* Post page with TOC */
    .post-layout { display: flex; max-width: 80rem; margin: 0 auto; padding: 2rem 1rem; gap: 2rem; }
    .post-main { flex: 1; max-width: 56rem; }
    .post-wrapper { background: var(--content-bg, var(--gray-50)); padding: 2rem 3rem; border-radius: 0.75rem; }
    @media (prefers-color-scheme: dark) { .post-wrapper { background: #151515; } }
    .post-article { max-width: 65ch; margin: 0 auto; }
    .post-header { margin-bottom: 2rem; text-align: center; }
    .post-title { font-size: 2.5rem; font-weight: bold; margin-bottom: 1rem; color: var(--foreground); }
    @media (min-width: 768px) { .post-title { font-size: 3rem; } }
    .post-date { color: var(--gray-500); }
    .post-content { line-height: 1.8; }
    .post-content h1, .post-content h2, .post-content h3, .post-content h4, .post-content h5 { margin-top: 2rem; margin-bottom: 1rem; color: var(--foreground); }
    .post-content h1::before { content: "# "; color: var(--gray-500); }
    .post-content h2::before { content: "## "; color: var(--gray-500); }
    .post-content h3::before { content: "### "; color: var(--gray-500); }
    .post-content h4::before { content: "#### "; color: var(--gray-500); }
    .post-content h5::before { content: "##### "; color: var(--gray-500); }
    .post-content p { margin-bottom: 1rem; }
    .post-content pre { background: var(--gray-100); padding: 1rem; border-radius: 0.5rem; overflow-x: auto; margin-bottom: 1rem; }
    .post-content code { background: var(--gray-100); padding: 0.125rem 0.25rem; border-radius: 0.25rem; font-size: 0.875em; }
    .post-content pre code { background: none; padding: 0; }
    .post-content a { color: #60a5fa; text-decoration: underline; }
    .post-content h1 a, .post-content h2 a, .post-content h3 a, .post-content h4 a, .post-content h5 a { color: var(--foreground); text-decoration: none; }
    .post-content h1 a:hover, .post-content h2 a:hover, .post-content h3 a:hover, .post-content h4 a:hover, .post-content h5 a:hover { text-decoration: underline; }
    .post-content img { max-width: 100%; height: auto; border-radius: 0.5rem; }
    .post-content ul, .post-content ol { margin-bottom: 1rem; padding-left: 1.5rem; }
    .post-content li { margin-bottom: 0.5rem; }
    /* TOC Sidebar */
    .toc-sidebar { width: 220px; flex-shrink: 0; position: sticky; top: 2rem; align-self: flex-start; }
    .toc-wrapper { background: rgba(128,128,128,0.1); backdrop-filter: blur(8px); padding: 1rem; border-radius: 0.5rem; }
    .toc-title { font-size: 0.875rem; font-weight: bold; margin-bottom: 0.75rem; color: var(--foreground); text-transform: uppercase; letter-spacing: 0.05em; }
    .toc-list { list-style: none; display: flex; flex-direction: column; gap: 0.375rem; }
    .toc-item { font-size: 0.8rem; }
    .toc-item a { color: var(--foreground); display: block; padding: 0.25rem 0; transition: opacity 0.2s; opacity: 0.7; }
    .toc-item a:hover { opacity: 1; }
    .toc-prefix { color: var(--gray-500); font-family: monospace; font-size: 0.75rem; }
    .toc-item.toc-h2 { padding-left: 0; }
    .toc-item.toc-h3 { padding-left: 0.75rem; }
    .toc-item.toc-h4 { padding-left: 1.5rem; }
    .toc-item.toc-h5 { padding-left: 2.25rem; }
    @media (max-width: 1024px) { .toc-sidebar { display: none; } .post-layout { max-width: 56rem; } }
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
}

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

// Blog list page with pagination and tag filtering
app.get('/blog', async (c) => {
  const POSTS_PER_PAGE = 10;
  const page = parseInt(c.req.query('page') || '1', 10);
  const filterTag = c.req.query('tag') || '';
  
  const idx = await c.env.BLOG_POSTS_KV.get('posts:index');
  const slugs: string[] = idx ? JSON.parse(idx) : [];
  
  // Fetch all posts with their metadata
  const allPosts = await Promise.all(
    slugs.map(async (slug) => {
      const m = await c.env.BLOG_POSTS_KV.get(`post:${slug}:meta`);
      const meta = m ? JSON.parse(m) : {};
      return { slug, ...meta };
    })
  );
  
  // Collect all tags
  const allTags = new Set<string>();
  allPosts.forEach((post: { tags?: string[] }) => {
    if (post.tags && Array.isArray(post.tags)) {
      post.tags.forEach((tag: string) => allTags.add(tag));
    }
  });
  const sortedTags = Array.from(allTags).sort();
  
  // Filter by tag if provided
  let filteredPosts = allPosts;
  if (filterTag) {
    filteredPosts = allPosts.filter((post: { tags?: string[] }) => 
      post.tags && post.tags.includes(filterTag)
    );
  }
  
  // Sort by date (newest first)
  filteredPosts.sort((a: { date?: string }, b: { date?: string }) => {
    const dateA = a.date || '';
    const dateB = b.date || '';
    return dateB.localeCompare(dateA);
  });
  
  // Pagination
  const totalPosts = filteredPosts.length;
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE);
  const startIndex = (page - 1) * POSTS_PER_PAGE;
  const paginatedPosts = filteredPosts.slice(startIndex, startIndex + POSTS_PER_PAGE);
  
  // Generate tags sidebar HTML
  const tagsSidebarHtml = sortedTags.length > 0 ? `
    <aside class="tags-sidebar">
      <h3 class="tags-title">Tags</h3>
      <ul class="tags-list">
        <li><a href="/blog" class="tag-link ${!filterTag ? 'active' : ''}">All</a></li>
        ${sortedTags.map(tag => `
          <li><a href="/blog?tag=${encodeURIComponent(tag)}" class="tag-link ${filterTag === tag ? 'active' : ''}">${tag}</a></li>
        `).join('')}
      </ul>
    </aside>
  ` : '';
  
  // Generate posts HTML
  const postsHtml = paginatedPosts.map((meta: { slug: string; title?: string; date?: string; excerpt?: string; tags?: string[] }) => {
    const title = meta.title ?? meta.slug.replace(/-/g, ' ');
    const dateLabel = meta.date ? meta.date.slice(0, 10) : '';
    const tagsHtml = meta.tags && meta.tags.length > 0 
      ? `<div class="blog-item-tags">${meta.tags.map(t => `<span class="blog-tag">${t}</span>`).join('')}</div>`
      : '';
    return `
      <li class="blog-item">
        <a href="/${meta.slug}" class="blog-link">
          <h2 class="blog-item-title">${title}</h2>
          ${dateLabel ? `<small class="blog-item-date">${dateLabel}</small>` : ''}
          ${tagsHtml}
          ${meta.excerpt ? `<p class="blog-item-excerpt">${meta.excerpt}</p>` : ''}
        </a>
      </li>
    `;
  }).join('');
  
  // Generate pagination HTML
  let paginationHtml = '';
  if (totalPages > 1) {
    const pageLinks = [];
    const baseUrl = filterTag ? `/blog?tag=${encodeURIComponent(filterTag)}&` : '/blog?';
    
    if (page > 1) {
      pageLinks.push(`<a href="${baseUrl}page=${page - 1}" class="page-link">← Prev</a>`);
    }
    
    for (let i = 1; i <= totalPages; i++) {
      if (i === page) {
        pageLinks.push(`<span class="page-current">${i}</span>`);
      } else if (Math.abs(i - page) <= 2 || i === 1 || i === totalPages) {
        pageLinks.push(`<a href="${baseUrl}page=${i}" class="page-link">${i}</a>`);
      } else if (Math.abs(i - page) === 3) {
        pageLinks.push(`<span class="page-ellipsis">...</span>`);
      }
    }
    
    if (page < totalPages) {
      pageLinks.push(`<a href="${baseUrl}page=${page + 1}" class="page-link">Next →</a>`);
    }
    
    paginationHtml = `<nav class="pagination">${pageLinks.join('')}</nav>`;
  }
  
  const content = `
    <div class="blog-layout">
      ${tagsSidebarHtml}
      <div class="blog-container">
        <section class="blog-section">
          <h1 class="blog-title">Blog${filterTag ? ` - #${filterTag}` : ''}</h1>
          ${totalPosts > 0 ? `<p class="blog-count">${totalPosts} posts${filterTag ? ` tagged "${filterTag}"` : ''}</p>` : ''}
          <ul class="blog-list">
            ${postsHtml || '<li>No posts found.</li>'}
          </ul>
          ${paginationHtml}
        </section>
      </div>
    </div>
  `;
  
  return c.html(layout('Blog', content));
});

// RSS Feed (must be before /:slug to match first)
app.get('/feed.xml', async (c) => {
  const idx = await c.env.BLOG_POSTS_KV.get('posts:index');
  const slugs: string[] = idx ? JSON.parse(idx) : [];
  
  const posts = await Promise.all(
    slugs.map(async (slug) => {
      const m = await c.env.BLOG_POSTS_KV.get(`post:${slug}:meta`);
      return { slug, ...(m ? JSON.parse(m) : {}) };
    })
  );
  
  // Sort by date (newest first)
  posts.sort((a, b) => (b.date || '').localeCompare(a.date || ''));
  
  const baseUrl = 'https://tsuji1.dev';
  const items = posts.map(post => `
    <item>
      <title><![CDATA[${post.title || post.slug}]]></title>
      <link>${baseUrl}/${post.slug}</link>
      <guid>${baseUrl}/${post.slug}</guid>
      <pubDate>${post.date ? new Date(post.date).toUTCString() : ''}</pubDate>
      <description><![CDATA[${post.excerpt || ''}]]></description>
    </item>
  `).join('');
  
  const rss = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>tsuji1 blog</title>
    <link>${baseUrl}</link>
    <description>tsuji1のブログです。技術記事やCTFについて書いています。</description>
    <language>ja</language>
    <atom:link href="${baseUrl}/feed.xml" rel="self" type="application/rss+xml"/>
    ${items}
  </channel>
</rss>`;
  
  return c.text(rss, 200, {
    'Content-Type': 'application/rss+xml; charset=utf-8',
    'Cache-Control': 'public, max-age=3600',
  });
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
  
  // Extract headings for TOC (handles nested anchor tags from rehype-autolink-headings)
  const headingRegex = /<h([2-5])(?:\s+id="([^"]*)")?[^>]*>([\s\S]*?)<\/h\1>/gi;
  const tocItems: { level: string; id: string; text: string }[] = [];
  let match;
  let processedHtml = postHtml;
  let headingIndex = 0;
  
  // Create a temp regex to avoid infinite loop
  const tempRegex = /<h([2-5])(?:\s+id="([^"]*)")?[^>]*>([\s\S]*?)<\/h\1>/gi;
  while ((match = tempRegex.exec(postHtml)) !== null) {
    const level = match[1];
    let id = match[2] || '';
    // Strip HTML tags from heading text to get plain text
    const text = match[3].replace(/<[^>]*>/g, '').trim();
    
    if (!id && text) {
      id = `heading-${headingIndex++}`;
      // Add id to heading if it doesn't have one
      const originalHeading = match[0];
      const newHeading = originalHeading.replace(`<h${level}`, `<h${level} id="${id}"`);
      processedHtml = processedHtml.replace(originalHeading, newHeading);
    }
    
    if (text && id) {
      tocItems.push({ level, id, text });
    }
  }
  
  const tocHtml = tocItems.length > 0 ? `
    <aside class="toc-sidebar">
      <div class="toc-wrapper">
        <h3 class="toc-title">目次</h3>
        <ul class="toc-list">
          ${tocItems.map(item => {
            const prefix = '#'.repeat(parseInt(item.level));
            return `
            <li class="toc-item toc-h${item.level}">
              <a href="#${item.id}"><span class="toc-prefix">${prefix}</span> ${item.text}</a>
            </li>
          `;
          }).join('')}
        </ul>
      </div>
    </aside>
  ` : '';
  
  const content = `
    <div class="back-bar">
      <a href="/blog" class="back-btn">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
          <path d="M19 12H5M12 19l-7-7 7-7"/>
        </svg>
        記事一覧に戻る
      </a>
    </div>
    <div class="post-layout">
      <div class="post-main">
        <div class="post-wrapper">
          <article class="post-article">
            <header class="post-header">
              <h1 class="post-title">${title}</h1>
              ${dateLabel ? `<time class="post-date" datetime="${dateLabel}">${dateLabel}</time>` : ''}
            </header>
            <div class="post-content">
              ${processedHtml}
            </div>
          </article>
        </div>
      </div>
      ${tocHtml}
    </div>
  `;
  
  return c.html(layout(title, content));
});

export default app;
