"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

/* ============ utils & cache (compatibles con desktop) ============ */

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

function normalizeFamilies(fams = []) {
  const map = new Map();

  for (const f of fams) {
    if (!f) continue;

    const id = (f.id ?? f._id ?? "").toString().trim();
    const description = (f.description ?? f.title ?? f.name ?? "")
      .toString()
      .trim();
    if (!description || hideFamily(description)) continue;

    const title = (f.title ?? description).toString().trim();
    const key = id || slugify(description);
    if (!key) continue;

    const item = {
      id: id || key,
      title,
      description,
      icon_url: f.icon_url || f.icon_active_url || f.iconURL || "",
    };

    const current = map.get(key);
    if (!current) {
      map.set(key, item);
    } else {
      if (!current.icon_url && item.icon_url) current.icon_url = item.icon_url;
    }
  }

  return [...map.values()].sort((a, b) =>
    a.description.localeCompare(b.description, "es", { sensitivity: "base" })
  );
}

const CACHE_KEY = "bc_families_v1";
const ETAG_KEY = "bc_families_etag";
const HINT_COOKIE = "bc_fam_hint=1; Path=/; Max-Age=2592000";

function readCache() {
  if (typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch {
    return null;
  }
}

function writeCache(payload, etag) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(CACHE_KEY, JSON.stringify(payload));
    if (etag) window.localStorage.setItem(ETAG_KEY, etag);
    document.cookie = HINT_COOKIE;
  } catch {
    // ignore
  }
}

function readETag() {
  if (typeof window === "undefined") return "";
  try {
    return window.localStorage.getItem(ETAG_KEY) || "";
  } catch {
    return "";
  }
}

/* ============ component ============ */

export default function MobileCategories({ open, onClose }) {
  const [items, setItems] = useState([]);

  const familiesUrl = "/api/families";

  // 1) hidratar desde cache
  useEffect(() => {
    const cached = readCache();
    if (cached && Array.isArray(cached)) {
      setItems(normalizeFamilies(cached));
    }
  }, []);

  // 2) al abrir, refresca en background
  useEffect(() => {
    if (!open) return;

    const ac = new AbortController();
    const headers = { "Cache-Control": "no-cache" };
    const etag = readETag();
    if (etag) headers["If-None-Match"] = etag;

    fetch(familiesUrl, { cache: "no-store", signal: ac.signal, headers })
      .then(async (r) => {
        if (r.status === 304) return null;
        if (!r.ok) throw new Error(`HTTP ${r.status}`);

        const data = await r.json();
        const arr = Array.isArray(data) ? data : data?.families || [];
        const normalized = normalizeFamilies(arr);
        const newTag = r.headers.get("etag") || "";
        writeCache(arr, newTag);
        return normalized;
      })
      .then((next) => {
        if (next) setItems(next);
      })
      .catch(() => {
        // si falla la red, nos quedamos con el cache si había
      });

    return () => ac.abort();
  }, [open, familiesUrl]);

  const toArray = (v) => (Array.isArray(v) ? v : v ? [v] : []);

  return (
    <div className={`fixed inset-0 z-[100] ${open ? "" : "pointer-events-none"}`}>
      {/* backdrop */}
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />

      {/* panel */}
      <aside
        className={`absolute left-0 top-0 h-full w-[78vw] max-w-[18rem] sm:w-[70vw] sm:max-w-[22rem]
                    bg-white text-gray-900 p-4 overflow-y-auto transition-transform
                    ${open ? "translate-x-0" : "-translate-x-full"}`}
        aria-label="Categorías"
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Categorías</h2>
          <button
            className="p-2 rounded-full hover:bg-gray-100"
            aria-label="Cerrar"
            onClick={onClose}
          >
            ✕
          </button>
        </div>

        <ul className="space-y-0.5">
          <li>
            <Link
              href="/search"
              className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-gray-50 text-gray-900"
              onClick={onClose}
              prefetch={false}
            >
              <span className="flex items-center justify-center h-10 w-10 shrink-0 rounded-lg border">
                <svg viewBox="0 0 20 20" className="h-6 w-6" fill="#9A9A9A">
                  <path d="M3 3h6v6H3V3zm8 0h6v6h-6V3zM3 11h6v6H3v-6zm8 0h6v6h-6v-6z" />
                </svg>
              </span>
              <span>Ver todo</span>
            </Link>
          </li>

          {items.length === 0 && (
            <li className="px-2 py-2 text-sm text-gray-500">
              Cargando categorías…
            </li>
          )}

          {items.map((f) => {
            const label = f.description || f.title;
            const href = {
              pathname: "/search",
              query: { family: toArray(label) },
            };
            return (
              <li key={`${f.id}-${slugify(label)}`}>
                <Link
                  href={href}
                  className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-gray-50 text-gray-900"
                  onClick={onClose}
                  prefetch={false}
                >
                  <span className="flex items-center justify-center h-10 w-10 shrink-0 rounded-lg border">
                    {f.icon_url ? (
                      <img
                        src={f.icon_url}
                        alt=""
                        className="h-6 w-6 object-contain"
                      />
                    ) : (
                      <svg viewBox="0 0 20 20" className="h-6 w-6 opacity-70">
                        <circle cx="10" cy="10" r="8" />
                      </svg>
                    )}
                  </span>
                  <span className="text-gray-900">{label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </aside>
    </div>
  );
}
