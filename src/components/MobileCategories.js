"use client";
import { useEffect, useState } from "react";
import Link from "next/link";

const slug = (s) =>
  (s || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");

export default function MobileCategories({ open, onClose }) {
  const [items, setItems] = useState([]);
  const apiBase = (process.env.NEXT_PUBLIC_API_BASE || "").replace(/\/$/, "");
  const url = apiBase ? `${apiBase}/api/store/families` : "/api/families";

  useEffect(() => {
    if (!open) return;
    const ac = new AbortController();
    fetch(url, { signal: ac.signal })
      .then((r) => (r.ok ? r.json() : []))
      .then((d) => {
        const arr = Array.isArray(d) ? d : d.families || [];
        const hasTitle = (f) => !!(f?.title ?? f?.name ?? "").toString().trim();
        setItems(arr.filter(hasTitle));
      })
      .catch(() => setItems([]));
    return () => ac.abort();
  }, [open, url]);

  return (
    <div
      className={`fixed inset-0 z-[100] ${open ? "" : "pointer-events-none"}`}
    >
      <div
        className={`absolute inset-0 bg-black/40 transition-opacity ${
          open ? "opacity-100" : "opacity-0"
        }`}
        onClick={onClose}
      />
      <aside
        className={`absolute left-0 top-0 h-full
               w-[78vw] max-w-[18rem]   /* 📏 más angosto en cel */
               sm:w-[70vw] sm:max-w-[22rem]
               bg-white text-gray-900 p-4 overflow-y-auto
               transition-transform ${
                 open ? "translate-x-0" : "-translate-x-full"
               }`}
      >
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-lg font-semibold">Categorías</h2>
          <button className="p-2" aria-label="Cerrar" onClick={onClose}>
            ✕
          </button>
        </div>
        <ul className="space-y-0.5">
          <li>
            <Link
              href="/search"
              className="flex items-center gap-3 rounded-lg px-2 py-2 hover:bg-gray-50 text-gray-900"
              onClick={onClose}
            >
              <span className="grid h-8 w-8 place-items-center rounded-md border">
                <svg viewBox="0 0 20 20" className="h-4 w-4" fill="#9A9A9A">
                  <path d="M3 3h6v6H3V3zm8 0h6v6h-6V3zM3 11h6v6H3v-6zm8 0h6v6h-6v-6z" />
                </svg>
              </span>
              <span>Ver todo</span>
            </Link>
          </li>
          {items.map((f) => {
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
                  onClick={onClose}
                >
                  <span className="grid h-8 w-8 place-items-center rounded-md border">
                    {f.icon_url ? (
                      <img
                        src={f.icon_url}
                        alt=""
                        className="h-5 w-5 object-contain opacity-80"
                      />
                    ) : (
                      <svg viewBox="0 0 20 20" className="h-4 w-4 opacity-70">
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
