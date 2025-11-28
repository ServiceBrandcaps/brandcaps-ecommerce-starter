import Head from "next/head";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/router";
import { API_BASE } from "@/lib/api";
import NavBar from "@/components/NavBar";
import ProductGrid from "@/components/ProductGrid";
// import PromoSection from "../components/PromoSection";
import Footer from "@/components/Footer";
import FilterSidebar from "@/components/FilterSidebar";

// Facetas a partir de los productos ya cargados
function buildFacets(products) {
  const colors = new Set();
  const materials = new Set();
  const sizes = new Set();

  for (const p of products || []) {
    const items = Array.isArray(p?.products) ? p.products : [];
    const vars = Array.isArray(p?.variants) ? p.variants : [];

    for (const it of items) {
      if (it?.color) colors.add(String(it.color));
      if (it?.material) materials.add(String(it.material));
      if (it?.size) sizes.add(String(it.size));
    }
    for (const v of vars) {
      if (v?.color) colors.add(String(v.color));
      if (v?.material) materials.add(String(v.material));
      if (v?.size) sizes.add(String(v.size));
    }
  }
  const toList = (set) => [...set].filter(Boolean).map((value) => ({ value }));
  return {
    colors: toList(colors),
    materials: toList(materials),
    sizes: toList(sizes),
  };
}

export default function Buscar({
  items,
  total,
  page,
  totalPages,
  query,
  priceBounds: boundsFromServer,
}) {
  const loading = false;
  const router = useRouter();

  // ---------- estado de filtros (seed desde query SSR) ----------
  const [sort, setSort] = useState(query.sort || "price_asc"); // default: precio ↑
  const [openFilters, setOpenFilters] = useState(false);
  const [priceMin, setPriceMin] = useState(query.priceFrom || "");
  const [priceMax, setPriceMax] = useState(query.priceTo || "");
  const [selectedFamilies, setSelectedFamilies] = useState(
    Array.isArray(query.family) ? query.family.map(String) : []
  );

  const priceOf = (p) =>
    Number(p?.salePrice ?? p?.price ?? p?.basePrice ?? NaN);
  const prices = (items || []).map(priceOf).filter((n) => Number.isFinite(n));
  const minP = prices.length ? Math.max(0, Math.floor(Math.min(...prices))) : 0;
  const maxP = prices.length ? Math.ceil(Math.max(...prices)) : 100000;
  const step = Math.max(1, Math.round((maxP - minP) / 100));
  const computedBounds = { min: minP, max: maxP, step };
  const priceBounds = boundsFromServer || computedBounds;

  // Subatributos: guardamos objetos { key, value }
  const [selectedSubattrs, setSelectedSubattrs] = useState(() => {
    const arr = Array.isArray(query.sub) ? query.sub : [];
    // aceptamos formato "colors:Rojo" | "material:Metal" | "size:M"
    return arr
      .map((s) => String(s))
      .map((s) => {
        const [key, ...rest] = s.split(":");
        return { key: key || "colors", value: rest.join(":") || s };
      });
  });

  // ---------- datos para el sidebar ----------
  const familiesFromItems = useMemo(() => {
    const map = new Map();
    for (const p of items || []) {
      (p.families || []).forEach((f) => {
        const id = String(
          f.id ?? f._id ?? f.value ?? f.description ?? f.title ?? ""
        );
        const title = f.title || f.description || f.name || `Familia ${id}`;
        if (id) map.set(id, { id, title });
      });
    }
    return [...map.values()].sort((a, b) =>
      a.title.localeCompare(b.title, "es")
    );
  }, [items]);

  const facets = useMemo(() => buildFacets(items), [items]);

  // ---------- helpers de navegación ----------
  const pushWith = ({
    nextFamilies = selectedFamilies,
    nextSubattrs = selectedSubattrs,
    nextPriceMin = priceMin,
    nextPriceMax = priceMax,
    nextSort = sort,
    nextPage = 1,
  } = {}) => {
    const usp = new URLSearchParams();
    if (query.q) usp.set("q", query.q);
    nextFamilies.forEach((f) => usp.append("family", f));
    nextSubattrs.forEach(({ key, value }) =>
      usp.append("sub", `${key}:${value}`)
    );
    if (nextPriceMin !== "") usp.set("priceFrom", String(nextPriceMin));
    if (nextPriceMax !== "") usp.set("priceTo", String(nextPriceMax));
    if (nextSort) usp.set("sort", nextSort);
    usp.set("page", String(nextPage));

    router.push({ pathname: "/search", query: Object.fromEntries(usp) });
  };

  // Sidebar handlers
  const toggleFamily = (id) => {
    const next = selectedFamilies.includes(id)
      ? selectedFamilies.filter((f) => f !== id)
      : [...selectedFamilies, id];
    setSelectedFamilies(next);
    pushWith({ nextFamilies: next });
  };
  const toggleSubattr = (key, value) => {
    const exists = selectedSubattrs.some(
      (e) => e.key === key && e.value === value
    );
    const next = exists
      ? selectedSubattrs.filter((e) => !(e.key === key && e.value === value))
      : [...selectedSubattrs, { key, value }];
    setSelectedSubattrs(next);
    pushWith({ nextSubattrs: next });
  };
  const clearAll = () => {
    setSelectedFamilies([]);
    setSelectedSubattrs([]);
    setPriceMin("");
    setPriceMax("");
    setSort("price_asc");
    pushWith({
      nextFamilies: [],
      nextSubattrs: [],
      nextPriceMin: "",
      nextPriceMax: "",
      nextSort: "price_asc",
    });
  };

  return (
    <>
      <Head>
        <title>Resultados – Brandcaps</title>
      </Head>

      <NavBar />

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        {/* Sección de promociones */}
        {/* <section>
          <PromoSection
            banners={[
              {
                id: "marca",
                family: "Ferias del Agro y Rural",
                image: "/banners/potencia tu marca.webp",
              },
            ]}
          />
        </section> */}

        <h1 className="text-xl font-semibold">Resultados</h1>

        {/* Controles superiores (orden + botón filtros en mobile) */}
        <div className="flex items-center justify-between md:justify-end gap-3">
          {/* Botón Filtros sólo mobile */}
          <button
            className="md:hidden inline-flex items-center gap-2 border rounded px-3 py-2 text-sm"
            onClick={() => setOpenFilters(true)}
            aria-expanded={openFilters}
            aria-controls="mobile-filters"
          >
            <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
              <path d="M3 5h18v2H3V5zm4 6h10v2H7v-2zm-2 6h14v2H5v-2z" />
            </svg>
            Filtros
          </button>

          {/* Ordenar (tu select) */}
          <div className="flex items-center">
            <label className="text-sm text-gray-600 mr-2">Ordenar por:</label>
            <select
              className="rounded border px-2 py-1 text-sm"
              value={sort}
              onChange={(e) => {
                setSort(e.target.value);
                pushWith({ nextSort: e.target.value });
              }}
            >
              <option value="price_asc">Precio: menor a mayor</option>
              <option value="price_desc">Precio: mayor a menor</option>
              <option value="alpha_asc">Alfabético: A → Z</option>
            </select>
          </div>
        </div>

        {/* <ProductGrid items={items} loading={loading} /> */}

        {/* Layout con sidebar a la izquierda */}
        <div className="flex gap-6">
          <FilterSidebar
            className="hidden md:block" // ← sidebar sólo en md+
            families={familiesFromItems.map((f) => ({
              id: f.id,
              title: f.title,
            }))}
            facets={facets}
            selectedFamilies={selectedFamilies}
            selectedSubattrs={selectedSubattrs}
            priceMin={priceMin}
            priceMax={priceMax}
            // ⬇️ reemplaza tus handlers de precio por:
            onCommitPrice={(minStr, maxStr) => {
              setPriceMin(minStr);
              setPriceMax(maxStr);
              pushWith({ nextPriceMin: minStr, nextPriceMax: maxStr });
            }}
            onToggleFamily={toggleFamily}
            onToggleSubattr={toggleSubattr}
            onClearAll={clearAll}
            // ⬇️ NUEVO: límites para el slicer
            priceBounds={priceBounds}
          />

          <div className="flex-1 space-y-4">
            {/* <div className="flex items-center justify-end">
              <label className="text-sm text-gray-600 mr-2">Ordenar por:</label>
              <select
                className="rounded border px-2 py-1 text-sm"
                value={sort}
                onChange={(e) => {
                  setSort(e.target.value);
                  pushWith({ nextSort: e.target.value });
                }}
              >
                <option value="price_asc">Precio: menor a mayor</option>
                <option value="price_desc">Precio: mayor a menor</option>
                <option value="alpha_asc">Alfabético: A → Z</option>
              </select>
            </div> */}

            <ProductGrid items={items} loading={loading} />
          </div>
        </div>
        {/* Paginación */}
        <div className="mt-6 px-2 md:px-0 overflow-visible">
          <div className="flex items-center gap-2">
            <span className="text-sm">
              Página {page} de {totalPages} — Total: {total}
            </span>

            <div className="ml-auto flex items-center gap-2">
              <button
                className="inline-flex items-center rounded border px-3 py-1.5
                   focus:outline-none focus-visible:outline-none
                   ring-0 focus:ring-2 focus:ring-black"
                disabled={page <= 1}
                onClick={() => pushWith({ nextPage: page - 1 })}
              >
                ‹ Anterior
              </button>

              <button
                className="inline-flex items-center rounded border px-3 py-1.5
                   focus:outline-none focus-visible:outline-none
                   ring-0 focus:ring-2 focus:ring-black"
                disabled={page >= totalPages}
                onClick={() => pushWith({ nextPage: page + 1 })}
              >
                Siguiente ›
              </button>
            </div>
          </div>
        </div>
      </main>
      {/* Drawer de filtros para mobile */}
      {openFilters && (
        <div
          id="mobile-filters"
          className="fixed inset-0 z-40 md:hidden"
          role="dialog"
          aria-modal="true"
        >
          {/* Backdrop */}
          <div
            className="absolute left-0 right-0 bottom-0 top-14 md:top-0 bg-black/40"
            onClick={() => setOpenFilters(false)}
          />

          {/* Panel */}
          <div className="absolute left-0 bottom-0 top-14 md:top-0 w-[85%] max-w-[360px] bg-gray-100 shadow-xl flex flex-col rounded-r-lg">
            <div className="flex items-center justify-between px-4 py-3 border-b">
              <h2 className="font-semibold">Filtros</h2>
              <button aria-label="Cerrar" onClick={() => setOpenFilters(false)}>
                ✕
              </button>
            </div>

            <div className="overflow-y-auto p-4 grow">
              <FilterSidebar
                families={familiesFromItems.map((f) => ({
                  id: f.id,
                  title: f.title,
                }))}
                facets={facets}
                selectedFamilies={selectedFamilies}
                selectedSubattrs={selectedSubattrs}
                priceMin={priceMin}
                priceMax={priceMax}
                onCommitPrice={(minStr, maxStr) => {
                  setPriceMin(minStr);
                  setPriceMax(maxStr);
                  pushWith({ nextPriceMin: minStr, nextPriceMax: maxStr });
                }}
                onToggleFamily={toggleFamily}
                onToggleSubattr={toggleSubattr}
                onClearAll={clearAll}
                priceBounds={priceBounds}
              />
            </div>

            <div className="p-4">
              <button
                className="w-full bg-black text-white rounded px-4 py-2"
                onClick={() => setOpenFilters(false)}
              >
                Aplicar filtros
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  );
}

// ── helpers para normalizar ───────────────────────────────────────────────
const _normalize = (s = "") =>
  s
    .toString()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();

const _slugify = (s = "") =>
  _normalize(s)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

// Ocultar “LOGO 24” y variantes habituales (sirve con título o slug)
function hideFamily(titleOrSlug = "") {
  const n = _normalize(titleOrSlug); // ej: "logo 24 hs"
  const sl = _slugify(titleOrSlug); // ej: "logo-24hs"
  return (
    n.includes("logo 24") ||
    n.includes("logo24") ||
    sl === "logo-24" ||
    sl === "logo-24hs" ||
    sl === "logo24" ||
    sl.startsWith("logo-24")
  );
}

// util para aceptar string o array en la query (?family=a&family=b o ?family=a,b)
const toArray = (v) =>
  v == null
    ? []
    : Array.isArray(v)
    ? v
    : String(v)
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

// SSR – llama al backend público
export async function getServerSideProps(ctx) {
  const {
    q = "",
    family = "",
    sub = "",
    page = "1",
    sort = "price_asc",
    priceFrom = "",
    priceTo = "",
  } = ctx.query;

  const PAGE_SIZE = 24;

  // const toArray = (v) =>
  //   Array.isArray(v)
  //     ? v
  //     : v
  //     ? String(v)
  //         .split(",")
  //         .map((s) => s.trim())
  //         .filter(Boolean)
  //     : [];
  // Acepta repetidos (?family=a&family=b) y valores simples con comas en el nombre sin partirlos.
  const toArray = (v) => {
    if (Array.isArray(v)) return v;
    if (v === undefined || v === null) return [];
    const s = String(v).trim();
    return s ? [s] : [];
  };

  const _normalize = (s = "") =>
    s
      .toString()
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  const _slugify = (s = "") =>
    _normalize(s)
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  const hideFamily = (titleOrSlug = "") => {
    const n = _normalize(titleOrSlug);
    const sl = _slugify(titleOrSlug);
    return (
      n.includes("logo 24") ||
      n.includes("logo24") ||
      sl === "logo-24" ||
      sl === "logo-24hs" ||
      sl === "logo24" ||
      sl.startsWith("logo-24")
    );
  };

  const famArray = toArray(family).filter((t) => !hideFamily(t));
  const subArray = toArray(sub).filter((t) => !hideFamily(t));

  // --- helper: fetch con try/catch y timeout ---
  const safeFetch = async (url, ms = 15000) => {
    try {
      const ctrl = new AbortController();
      const t = setTimeout(() => ctrl.abort(), ms);
      const res = await fetch(url, { signal: ctrl.signal });
      clearTimeout(t);
      const ok = res.ok;
      let json = null;
      try {
        json = await res.json();
      } catch {
        json = null;
      }
      return { ok, json, status: res.status };
    } catch (err) {
      console.error("[SSR search] safeFetch error", url, err?.message || err);
      return { ok: false, json: null, status: 0 };
    }
  };

  const priceOf = (p) => {
    const v = Number(p?.salePrice ?? p?.price ?? p?.basePrice);
    return Number.isFinite(v) ? v : Number.MAX_SAFE_INTEGER;
  };

  try {
    // params BASE sin page/limit
    const base = new URLSearchParams();
    if (q) base.set("q", q);
    famArray.forEach((f) => base.append("family", f));
    subArray.forEach((s) => base.append("sub", s));
    if (priceFrom !== "") base.set("priceFrom", priceFrom);
    if (priceTo !== "") base.set("priceTo", priceTo);
    if (sort) base.set("sort", sort);

    // 1) primera página para conocer total
    const first = new URLSearchParams(base);
    first.set("page", "1");
    first.set("limit", String(PAGE_SIZE));
    const firstUrl = `${API_BASE}/api/store/products?${first.toString()}`;

    const r1 = await safeFetch(firstUrl);
    if (!r1.ok || !r1.json) {
      console.error("[SSR search] first page failed", r1.status);
      return {
        props: {
          items: [],
          total: 0,
          page: 1,
          totalPages: 1,
          query: {
            q,
            family: famArray,
            sub: subArray,
            sort,
            priceFrom,
            priceTo,
          },
          priceBounds: { min: 0, max: 100000, step: 1000 },
        },
      };
    }

    const d1 = r1.json;
    const apiTotalPages = Number.isFinite(+d1.totalPages) ? +d1.totalPages : 1;

    // 2) restantes en paralelo
    const fetchPage = async (p) => {
      const usp = new URLSearchParams(base);
      usp.set("page", String(p));
      usp.set("limit", String(PAGE_SIZE));
      const url = `${API_BASE}/api/store/products?${usp.toString()}`;
      const r = await safeFetch(url);
      return r.ok && r.json ? r.json : { items: [] };
    };

    let allItems = Array.isArray(d1.items) ? d1.items.slice() : [];
    if (apiTotalPages > 1) {
      const promises = [];
      for (let p = 2; p <= apiTotalPages; p++) promises.push(fetchPage(p));
      const pages = await Promise.all(promises);
      for (const pg of pages)
        if (Array.isArray(pg.items)) allItems = allItems.concat(pg.items);
    }

    // 3) filtros de precio locales (defensivos)
    const min = priceFrom === "" ? undefined : Number(priceFrom);
    const max = priceTo === "" ? undefined : Number(priceTo);
    if (min !== undefined && Number.isFinite(min))
      allItems = allItems.filter((p) => priceOf(p) >= min);
    if (max !== undefined && Number.isFinite(max))
      allItems = allItems.filter((p) => priceOf(p) <= max);

    // 4) ordenar TODO el set
    if (sort === "price_desc") allItems.sort((a, b) => priceOf(b) - priceOf(a));
    else if (sort === "alpha_asc")
      allItems.sort((a, b) =>
        String(a?.name || a?.title || "").localeCompare(
          String(b?.name || b?.title || ""),
          "es"
        )
      );
    else allItems.sort((a, b) => priceOf(a) - priceOf(b)); // price_asc por defecto

    // 5) bounds de precio con TODO el set
    const prices = allItems.map(priceOf).filter((n) => Number.isFinite(n));
    const minP = prices.length
      ? Math.max(0, Math.floor(Math.min(...prices)))
      : 0;
    const maxP = prices.length ? Math.ceil(Math.max(...prices)) : 100000;
    const step = Math.max(1, Math.round((maxP - minP) / 100));
    const priceBounds = { min: minP, max: maxP, step };

    // 6) paginar en memoria
    const curPage = Math.max(1, Number(page) || 1);
    const total = allItems.length;
    const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));
    const start = (curPage - 1) * PAGE_SIZE;
    const items = allItems.slice(start, start + PAGE_SIZE);

    return {
      props: {
        items,
        total,
        page: Math.min(curPage, totalPages),
        totalPages,
        query: { q, family: famArray, sub: subArray, sort, priceFrom, priceTo },
        priceBounds,
      },
    };
  } catch (err) {
    console.error("[SSR search] fatal", err?.message || err);
    return {
      props: {
        items: [],
        total: 0,
        page: 1,
        totalPages: 1,
        query: { q, family: famArray, sub: subArray, sort, priceFrom, priceTo },
        priceBounds: { min: 0, max: 100000, step: 1000 },
      },
    };
  }
}
