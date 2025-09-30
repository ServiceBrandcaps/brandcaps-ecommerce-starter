"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";

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

// 🔧 dedupe por id o slug(title), prioriza el que tenga icon_url/url
function dedupeFamilies(fams = []) {
  const map = new Map();
  for (const f of fams) {
    if (!f) continue;
    const id = (f.id ?? f._id ?? "").toString().trim();
    const title = (f.description ?? f.title ?? "").toString().trim();
    const key = id || slugify(title);
    if (!key) continue;

    const current = map.get(key);
    const item = {
      id: id || key,
      title,
      url: f.url || "",
      icon_url: f.icon_url || f.icon_active_url || f.iconURL || "",
    };
    if (!current) {
      map.set(key, item);
    } else {
      // completa campos faltantes del que ya está
      if (!current.icon_url && item.icon_url) current.icon_url = item.icon_url;
      if (!current.url && item.url) current.url = item.url;
    }
  }
  return [...map.values()].sort((a, b) =>
    a.title.localeCompare(b.title, "es", { sensitivity: "base" })
  );
}

export default function CategoriesMenu({ className = "" }) {
  const [open, setOpen] = useState(false);
  const [families, setFamilies] = useState([]);

  const btnRef = useRef(null);
  const panelRef = useRef(null);
  const hoverOpenTimer = useRef(null);
  const hoverCloseTimer = useRef(null);

  const apiBase = (process.env.NEXT_PUBLIC_API_BASE || "").replace(/\/$/, "");
  // si tenés backend externo:
  const familiesUrl = apiBase
    ? `${apiBase}/api/store/families`
    : "/api/families";

  useEffect(() => {
    const ac = new AbortController();
    fetch(familiesUrl, { cache: "no-store", signal: ac.signal })
      .then((r) =>
        r.ok ? r.json() : Promise.reject(new Error(`HTTP ${r.status}`))
      )
      .then((d) =>
        setFamilies(dedupeFamilies(Array.isArray(d) ? d : d?.families || []))
      )
      .catch(() => setFamilies([]));
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
          // 👇 ahora se posiciona exactamente debajo del botón
          className="absolute left-0 top-full mt-2 z-50 w-[900px] max-w-[95vw] rounded-xl border bg-white shadow-xl min-h-[120px]  text-gray-900"
          onMouseEnter={openWithDelay}
          onMouseLeave={closeWithDelay}
        >
          {/* flechita */}
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
                      <span className="grid h-8 w-8 place-items-center rounded-md border">
                        {/* iconito de “grid” */}
                        <svg viewBox="0 0 20 20" className="h-4 w-4" fill="#9A9A9A">
                          <path d="M3 3h6v6H3V3zm8 0h6v6h-6V3zM3 11h6v6H3v-6zm8 0h6v6h-6v-6z" />
                        </svg>
                      </span>
                      <span className=" text-gray-900">Ver todo</span>
                    </Link>
                  </li>
                )}

                {(!col || col.length === 0) && ci === 0 && (
                  <li className="px-2 py-2 text-sm text-gray-500">
                    No hay categorías disponibles
                  </li>
                )}
                {col.map((f) => {
                  const toArray = (v) => (Array.isArray(v) ? v : v ? [v] : []);
                  const href = {
                    pathname: "/search",
                    query: {
                      family: toArray(f.title), // p.ej ["Escritura","Logo 24hs"]
                    },
                  };
                  return (
                    <li key={`${f.id}-${f.title}`}>
                      <Link
                        href={href}
                        className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-gray-50  text-gray-900"
                        onClick={() => setOpen(false)}
                        prefetch={false}
                      >
                        <span className="grid h-8 w-8 place-items-center rounded-md border">
                          {f.icon_url ? (
                            <img
                              src={f.icon_url}
                              alt=""
                              className="h-5 w-5 object-contain opacity-80"
                            />
                          ) : (
                            <svg
                              viewBox="0 0 20 20"
                              className="h-4 w-4 opacity-70"
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
