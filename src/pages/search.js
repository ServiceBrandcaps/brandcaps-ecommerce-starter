import Head from "next/head";
import Link from "next/link";
import { useMemo, useState } from "react";
import { useRouter } from "next/router";
import { API_BASE } from "@/lib/api";
import NavBar from "@/components/NavBar";
import ProductGrid from "@/components/ProductGrid";
import PromoSection from "../components/PromoSection";
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

export default function Buscar({ items, total, page, totalPages, query }) {
  const loading = false;
  const router = useRouter();

  // ---------- estado de filtros (seed desde query SSR) ----------
  const [sort, setSort] = useState(query.sort || "price_asc"); // default: precio ↑
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
  const priceBounds = { min: minP, max: maxP, step };

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
        <section>
          <PromoSection
            banners={[
              {
                id: "marca",
                family: "Ferias del Agro y Rural",
                image: "/banners/potencia tu marca.webp",
              },
            ]}
          />
        </section>

        <h1 className="text-xl font-semibold">Resultados</h1>

        {/* <ProductGrid items={items} loading={loading} /> */}

        {/* Layout con sidebar a la izquierda */}
        <div className="flex gap-6">
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
            <div className="flex items-center justify-end">
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

            <ProductGrid items={items} loading={loading} />
          </div>
        </div>

        <div className="flex items-center justify-between">
          <span>
            Página {page} de {totalPages} — Total: {total}
          </span>

          <div className="space-x-2">
            <Link
              href={{
                pathname: "/search",
                query: { ...query, page: Math.max(1, page - 1) },
              }}
              className={`px-3 py-1 rounded border ${
                page <= 1 ? "pointer-events-none opacity-50" : ""
              }`}
            >
              ‹ Anterior
            </Link>

            <Link
              href={{
                pathname: "/search",
                query: { ...query, page: Math.min(totalPages, page + 1) },
              }}
              className={`px-3 py-1 rounded border ${
                page >= totalPages ? "pointer-events-none opacity-50" : ""
              }`}
            >
              Siguiente ›
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}

// ── helpers para normalizar ───────────────────────────────────────────────
const _normalize = (s = "") =>
  s.toString().toLowerCase()
   .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
   .replace(/\s+/g, " ").trim();

const _slugify = (s = "") =>
  _normalize(s).replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");

// Ocultar “LOGO 24” y variantes habituales (sirve con título o slug)
function hideFamily(titleOrSlug = "") {
  const n = _normalize(titleOrSlug);   // ej: "logo 24 hs"
  const sl = _slugify(titleOrSlug);     // ej: "logo-24hs"
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
    : String(v).split(",").map((s) => s.trim()).filter(Boolean);

// SSR – llama al backend público
export async function getServerSideProps(ctx) {
  //const { q = "", family = "", sub = "", page = "1" } = ctx.query;
  const {
    q = "",
    family = "",
    sub = "",
    page = "1",
    sort = "price_asc",
    priceFrom = "",
    priceTo = "",
  } = ctx.query;

  // Params que entiende la API pública: q, family, sub (multi), page, limit
  const params = { page, limit: "24", sort };
  if (priceFrom !== "") params.priceFrom = priceFrom;
  if (priceTo !== "") params.priceTo = priceTo;
  if (q) params.q = q; // <- usa q (también soporta name en la API)
  //if (family) params.family = family;

  // normalizamos a array
  // const famArray = Array.isArray(family)
  //   ? family
  //   : family
  //   ? family
  //       .split(",")
  //       .map((s) => s.trim())
  //       .filter(Boolean)
  //   : [];
  const famArray = toArray(family).filter((t) => !hideFamily(t));

  const subArray = Array.isArray(sub)
    ? sub
    : sub
    ? sub
        .split(",")
        .map((s) => s.trim())
        .filter((t)=> !hideFamily(t))
    : [];

  // if (subattribute) {
  //   // soporta múltiples subatributos separados por coma
  //   const arr = String(subattribute)
  //     .split(",")
  //     .map((s) => s.trim())
  //     .filter(Boolean);
  //   if (arr.length) params.sub = arr;   // <- la API lee getAll('sub')
  // }

  try {
    // Construimos la querystring soportando arrays
    const usp = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => {
      if (Array.isArray(v)) v.forEach((x) => usp.append(k, x));
      else usp.set(k, v);
    });
    famArray.forEach((f) => usp.append("family", f));
    subArray.forEach((s) => usp.append("sub", s));

    const url = `${API_BASE}/api/store/products?${usp.toString()}`;
    const res = await fetch(url);

    if (!res.ok) throw new Error(`API ${res.status}`);

    // La API devuelve: { items, total, page, totalPages }
    const data = await res.json();
    //console.log(data);
    const priceOf = (p) => {
      const v = Number(p?.salePrice ?? p?.price ?? p?.basePrice);
      return Number.isFinite(v) ? v : Number.MAX_SAFE_INTEGER; // sin precio al final
    };
    let items = (Array.isArray(data.items) ? data.items : []).slice();

    // Filtro por rango de precio (fallback si el backend no lo hace)
    const min = priceFrom === "" ? undefined : Number(priceFrom);
    const max = priceTo === "" ? undefined : Number(priceTo);
    if (min !== undefined && Number.isFinite(min)) {
      items = items.filter((p) => priceOf(p) >= min);
    }
    if (max !== undefined && Number.isFinite(max)) {
      items = items.filter((p) => priceOf(p) <= max);
    }

    // Ordenamiento
    if (sort === "price_desc") items.sort((a, b) => priceOf(b) - priceOf(a));
    else if (sort === "alpha_asc")
      items.sort((a, b) =>
        String(a?.name || a?.title || "").localeCompare(
          String(b?.name || b?.title || ""),
          "es"
        )
      );
    else items.sort((a, b) => priceOf(a) - priceOf(b)); // price_asc por defecto
    const safeTotal = Number.isFinite(Number(data.total))
      ? Number(data.total)
      : 0;
    const safePage = Number.isFinite(Number(data.page))
      ? Number(data.page)
      : Number(page) || 1;
    const safeTotalPages = Number.isFinite(Number(data.totalPages))
      ? Number(data.totalPages)
      : 1;

    return {
      props: {
        items,
        total: safeTotal,
        page: safePage,
        totalPages: Math.max(1, safeTotalPages),
        query: {
          q,
          family: famArray,
          sub: subArray,
          sort,
          priceFrom,
          priceTo,
        },
      },
    };
  } catch {
    // Fallbacks siempre serializables
    return {
      props: {
        items: [],
        total: 0,
        page: 1,
        totalPages: 1,
        query: { q, family: [], sub: [] },
      },
    };
  }
}
