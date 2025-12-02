// lib/safeFetch.js
export async function fetchWithTimeout(url, init = {}, opts = {}) {
  const { timeout = 18000, retries = 2, retryDelay = 800 } = opts;
  let lastErr;

  for (let attempt = 0; attempt <= retries; attempt++) {
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    try {
      const res = await fetch(url, { ...init, signal: controller.signal, cache: "no-store" });
      clearTimeout(id);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      return res;
    } catch (err) {
      clearTimeout(id);
      lastErr = err;
      const isAbort = err.name === "AbortError" || String(err).includes("aborted");
      const canRetry = attempt < retries;
      if (!canRetry) break;
      // backoff simple
      await new Promise(r => setTimeout(r, retryDelay * (attempt + 1)));
      // en abort también reintento (por cold start)
      if (isAbort || err) continue;
    }
  }
  throw lastErr;
}
