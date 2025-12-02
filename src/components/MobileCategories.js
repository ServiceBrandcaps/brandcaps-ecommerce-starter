"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

/* ============ utils & cache ============ */
const slug = (s = "") =>
  s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
   .replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const hideFamily = (title = "") => {
  const t = title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ").trim();
  const s = slug(title);
  return (
    t.includes("logo 24") || t.includes("logo 24hs") || t.includes("logo 24 hs") ||
    s === "logo-24" || s === "logo-24hs" || s === "logo24" || s.startsWith("logo-24")
  );
};
const CACHE_KEY = "bc_families_v1";
const ETAG_KEY  = "bc_families_etag";
const HINT_COOKIE = "bc_fam_hint=1; Path=/; Max-Age=2592000";
function readCache() { try { const raw = localStorage.getItem(CACHE_KEY); return raw ? JSON.parse(raw) : null; } catch { return null; } }
function writeCache(payload, etag) { try {
  localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
  if (etag) localStorage.setItem(ETAG_KEY, etag);
  document.cookie = HINT_COOKIE;
} catch {} }
function readETag() { try { return localStorage.getItem(ETAG_KEY) || ""; } catch { return ""; } }

export default function MobileCategories({ open, onClose }) {
  const [items, setItems] = useState([]);

  //const apiBase = (process.env.NEXT_PUBLIC_API_BASE || "").replace(/\/$/, "");
  const url ="/api/families";

  // 1) hidratar desde cache
  useEffect(() => {
    const cached = readCache();
    if (cached && Array.isArray(cached)) {
      const filtered = cached
        .filter((f) => !!(f?.title ?? f?.name ?? "").toString().trim())
        .filter((f) => !hideFamily(f.title || f.name));
      setItems(filtered);
    }
  }, []);

  // 2) al abrir, refresca en background con If-None-Match
  useEffect(() => {
    if (!open) return;
    const ac = new AbortController();
    const headers = { "Cache-Control": "no-cache" };
    const etag = readETag();
    if (etag) headers["If-None-Match"] = etag;

    fetch(url, { signal: ac.signal, cache: "no-store", headers })
      .then(async (r) => {
        if (r.status === 304) return null;
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const d = await r.json();
        const arr = Array.isArray(d) ? d : d.families || [];
        const filtered = arr
          .filter((f) => !!(f?.title ?? f?.name ?? "").toString().trim())
          .filter((f) => !hideFamily(f.title || f.name));
        const newTag = r.headers.get("etag") || "";
        writeCache(arr, newTag);
        return filtered;
      })
      .then((next) => { if (next) setItems(next); })
      .catch(() => { /* dejamos lo del cache */ });

    return () => ac.abort();
  }, [open, url]);

  return (
    <div className={`fixed inset-0 z-[100] ${open ? "" : "pointer-events-none"}`}>
      <div className={`absolute inset-0 bg-black/40 transition-opacity ${open ? "opacity-100" : "opacity-0"}`} onClick={onClose} />
      <aside
        className={`absolute left-0 top-0 h-full w-[78vw] max-w-[18rem] sm:w-[70vw] sm:max-w-[22rem]
                    bg-white text-gray-900 p-4 overflow-y-auto transition-transform
                    ${open ? "translate-x-0" : "-translate-x-full"}`}
        aria-label="Categorías"
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Categorías</h2>
          <button className="p-2" aria-label="Cerrar" onClick={onClose}>✕</button>
        </div>

        <ul className="space-y-0.5">
          <li>
            <Link
              href="/search"
              className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-gray-50 text-gray-900"
              onClick={onClose}
              prefetch={false}
            >
              <span className="flex items-center justify-center h-10 w-10 shrink-0">
                <svg viewBox="0 0 20 20" className="h-6 w-6" fill="#9A9A9A">
                  <path d="M3 3h6v6H3V3zm8 0h6v6h-6V3zM3 11h6v6H3v-6zm8 0h6v6h-6v-6z" />
                </svg>
              </span>
              <span>Ver todo</span>
            </Link>
          </li>

          {items.map((f) => {
            const toArray = (v) => (Array.isArray(v) ? v : v ? [v] : []);
            const href = { pathname: "/search", query: { family: toArray(f.title) } };
            return (
              <li key={`${f.id}-${f.title}`}>
                <Link
                  href={href}
                  className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-gray-50 text-gray-900"
                  onClick={onClose}
                  prefetch={false}
                >
                  <span className="flex items-center justify-center h-10 w-10 shrink-0">
                    {f.icon_url ? (
                      <img src={f.icon_url} alt="" className="h-6 w-6 object-contain" />
                    ) : (
                      <svg viewBox="0 0 20 20" className="h-6 w-6">
                        <circle cx="10" cy="10" r="8" />
                      </svg>
                    )}
                  </span>
                  <span className=" text-gray-900">{f.title}</span>
                </Link>
              </li>
            );
          })}

          {items.length === 0 && (
            <li className="px-2 py-2 text-sm text-gray-500">Cargando…</li>
          )}
        </ul>
      </aside>
    </div>
  );
}
