export function abs(path: string): string {
  const base = process.env.BLOG_API_BASE ?? 'http://127.0.0.1:8788';
  return new URL(path, base).toString();
}
