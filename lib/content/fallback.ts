// lib/fallback.ts
export async function withTimeout<T>(p: Promise<T>, ms = 1500): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, rej) => setTimeout(() => rej(new Error("timeout")), ms)),
  ]) as Promise<T>;
}
export async function apiThenFile<T>(api: () => Promise<T>, file: () => Promise<T>, ms = 1500) {
  try { return await withTimeout(api(), ms); }
  catch { return await file(); }
}
