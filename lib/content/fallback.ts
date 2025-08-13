// lib/fallback.ts
export async function withTimeout<T>(p: Promise<T>, ms = 1500): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, rej) => setTimeout(() => rej(new Error("timeout")), ms)),
  ]) as Promise<T>;
}

export async function tryApiThenFile<T>(apiCall: () => Promise<T>, fileCall: () => Promise<T>) {
  try {
    return await withTimeout(apiCall());   // APIを短時間だけ試す
  } catch {
    return await fileCall();               // だめならファイルに即フォールバック
  }
}

