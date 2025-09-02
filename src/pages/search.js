import Head from "next/head";
import NavBar from "@/components/NavBar";
import ProductGrid from "@/components/ProductGrid";
import Link from "next/link";
import { API_BASE } from "@/lib/api";

export default function Buscar({ items, total, page, totalPages, query }) {
  const loading = false;

  return (
    <>
      <Head>
        <title>Resultados – Brandcaps</title>
      </Head>

      <NavBar />

      <main className="max-w-6xl mx-auto px-4 py-6 space-y-6">
        <h1 className="text-xl font-semibold">Resultados</h1>

        <ProductGrid items={items} loading={loading} />

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
    </>
  );
}

// SSR – llama al backend público
export async function getServerSideProps(ctx) {
  const { q = "", family = "", sub = "", page = "1" } = ctx.query;

  // Params que entiende la API pública: q, family, sub (multi), page, limit
  const params = { page, limit: "24" };
  if (q) params.q = q; // <- usa q (también soporta name en la API)
  //if (family) params.family = family;

  // normalizamos a array
  const famArray = Array.isArray(family)
    ? family
    : family
    ? family
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
    : [];

  const subArray = Array.isArray(sub)
    ? sub
    : sub
    ? sub
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean)
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
    const items = Array.isArray(data.items) ? data.items : [];
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
        query: { q, family: famArray, sub: subArray },
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
