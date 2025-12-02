"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

/* ============ utils ============ */
const chunk = (arr, n) => {
  const out = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
};
const slugify = (s = "") =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
const hideFamily = (title = "") => {
  const t = title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
  const s = slugify(title);
  return (
    t.includes("logo 24") ||
    t.includes("logo 24hs") ||
    t.includes("logo 24 hs") ||
    s === "logo-24" ||
    s === "logo-24hs" ||
    s === "logo24" ||
    s.startsWith("logo-24")
  );
};
function dedupeFamilies(fams = []) {
  const map = new Map();
  for (const f of fams) {
    if (!f) continue;
    const id = (f.id ?? f._id ?? "").toString().trim();
    //console.log(f);
    const title = (f.title ?? f.name ?? "").toString().trim();
    if (!title || hideFamily(title)) continue;
    const key = id || slugify(title);
    if (!key) continue;
    const current = map.get(key);
    const item = {
      id: id || key,
      title,
      url: f.url || "",
      icon_url: f.icon_url || f.icon_active_url || f.iconURL || "",
    };
    if (!current) map.set(key, item);
    else {
      if (!current.icon_url && item.icon_url) current.icon_url = item.icon_url;
      if (!current.url && item.url) current.url = item.url;
    }
  }
  return [...map.values()].sort((a, b) =>
    a.title.localeCompare(b.title, "es", { sensitivity: "base" })
  );
}

/* ============ client cache ============ */
const CACHE_KEY = "bc_families_v1";
const ETAG_KEY = "bc_families_etag";
const HINT_COOKIE = "bc_fam_hint=1; Path=/; Max-Age=2592000"; // 30 días

function readCache() {
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}
function writeCache(payload, etag) {
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
    if (etag) window.localStorage.setItem(ETAG_KEY, etag);
    // cookie indicador (no ponemos el JSON en cookie para no exceder tamaño)
    document.cookie = HINT_COOKIE;
  } catch {}
}
function readETag() {
  try {
    return window.localStorage.getItem(ETAG_KEY) || "";
  } catch {
    return "";
  }
}

/* ============ component ============ */
export default function CategoriesMenu({ className = "" }) {
  const [open, setOpen] = useState(false);
  const [families, setFamilies] = useState([]);

  const btnRef = useRef(null);
  const panelRef = useRef(null);
  const hoverOpenTimer = useRef(null);
  const hoverCloseTimer = useRef(null);

  //const apiBase = (process.env.NEXT_PUBLIC_API_BASE || "").replace(/\/$/, "");
  const familiesUrl = "/api/families";

  // 1) Cargar al instante desde cache, si existe
  useEffect(() => {
    const cached = readCache();
    if (cached && Array.isArray(cached)) {
      setFamilies(dedupeFamilies(cached));
    }
    //console.log(cached)
  }, []);

  // 2) Refrescar en background con If-None-Match
  useEffect(() => {
    const ac = new AbortController();
    const headers = { "Cache-Control": "no-cache" };
    const etag = readETag();
    if (etag) headers["If-None-Match"] = etag;
    fetch(familiesUrl, { cache: "no-store", signal: ac.signal, headers })
      .then(async (r) => {
        if (r.status === 304) return null; // nada nuevo
        if (!r.ok) throw new Error(`HTTP ${r.status}`);
        const arr = Array.isArray(data) ? data : data?.families || [];
        const next = dedupeFamilies(arr);
        const newTag = r.headers.get("etag") || "";
        writeCache(arr, newTag);
        //console.log(arr);
        return next;
      })
      .then((next) => {
        if (next) setFamilies(next);
      })
      .catch(() => {
        // si no había cache, evitamos menú vacío mostrando fallback simple
        setFamilies((prev) => (prev && prev.length ? prev : []));
      });

    return () => ac.abort();
  }, [familiesUrl]);

  const columns = useMemo(() => {
    const list = families || [];
    const perCol = Math.max(1, Math.ceil(list.length / 4));
    return chunk(list, perCol);
  }, [families]);

  useEffect(() => {
    if (!open) return;
    const onKey = (e) => e.key === "Escape" && setOpen(false);
    const onClick = (e) => {
      if (!panelRef.current) return;
      if (
        !panelRef.current.contains(e.target) &&
        !btnRef.current?.contains(e.target)
      )
        setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    window.addEventListener("mousedown", onClick);
    return () => {
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("mousedown", onClick);
    };
  }, [open]);

  const openWithDelay = () => {
    clearTimeout(hoverCloseTimer.current);
    hoverOpenTimer.current = setTimeout(() => setOpen(true), 80);
  };
  const closeWithDelay = () => {
    clearTimeout(hoverOpenTimer.current);
    hoverCloseTimer.current = setTimeout(() => setOpen(false), 120);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        ref={btnRef}
        className="inline-flex items-center gap-2 rounded-lg px-3 py-2 font-medium hover:bg-gray-100 hover:text-gray-600"
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => setOpen((v) => !v)}
        onMouseEnter={openWithDelay}
        onMouseLeave={closeWithDelay}
      >
        Categorías
        <svg
          width="14"
          height="14"
          viewBox="0 0 20 20"
          className={`transition ${open ? "rotate-180" : ""}`}
        >
          <path d="M5 7l5 6 5-6" fill="currentColor" />
        </svg>
      </button>

      {open && (
        <div
          ref={panelRef}
          role="menu"
          aria-label="Categorías"
          className="absolute left-0 top-full mt-2 z-50 w-[900px] max-w-[95vw] rounded-xl border bg-white shadow-xl min-h-[120px] text-gray-900"
          onMouseEnter={openWithDelay}
          onMouseLeave={closeWithDelay}
        >
          <div className="absolute -top-2 left-6 h-4 w-4 rotate-45 bg-white border-l border-t" />
          <div className="grid grid-cols-4 divide-x">
            {columns.map((col, ci) => (
              <ul key={ci} className="p-3">
                {ci === 0 && (
                  <li className="mb-1">
                    <Link
                      href="/search"
                      className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-gray-50 text-gray-900"
                      onClick={() => setOpen(false)}
                      prefetch={false}
                    >
                      <span className="flex items-center justify-center h-10 w-10 shrink-0">
                        <svg
                          viewBox="0 0 20 20"
                          className="h-6 w-6"
                          fill="#9A9A9A"
                        >
                          <path d="M3 3h6v6H3V3zm8 0h6v6h-6V3zM3 11h6v6H3v-6zm8 0h6v6h-6v-6z" />
                        </svg>
                      </span>
                      <span className=" text-gray-900">Ver todo</span>
                    </Link>
                  </li>
                )}

                {(!col || col.length === 0) && ci === 0 && (
                  <li className="px-2 py-2 text-sm text-gray-500">Cargando…</li>
                )}

                {col.map((f) => {
                  const toArray = (v) => (Array.isArray(v) ? v : v ? [v] : []);
                  const href = {
                    pathname: "/search",
                    query: { family: toArray(f.title) },
                  };
                  return (
                    <li key={`${f.id}-${f.title}`}>
                      <Link
                        href={href}
                        className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-gray-50 text-gray-900"
                        onClick={() => setOpen(false)}
                        prefetch={false}
                      >
                        <span
                          className="    flex items-center justify-center h-10 w-10 shrink-0"
                        >
                          {f.icon_url ? (
                            <img
                              src={f.icon_url}
                              alt=""
                              className="h-6 w-6 object-contain"
                            />
                          ) : (
                            <svg
                              viewBox="0 0 20 20"
                              className="h-6 w-6"
                            >
                              <circle cx="10" cy="10" r="8" />
                            </svg>
                          )}
                        </span>
                        <span className=" text-gray-900">{f.title}</span>
                      </Link>
                    </li>
                  );
                })}
              </ul>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
