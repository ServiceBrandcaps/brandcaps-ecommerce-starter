// pages/product/[id].js
import React from "react";
import NavBar from "../../components/NavBar";
import Footer from "../../components/Footer";
import ProductDetail from "../../components/ProductDetail";
import RelatedProductsCarousel from "../../components/RelatedProductsCarousel";

const API_BASE = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001";

function toZecatLike(p = {}) {
  const imgs = (p?.images || []).map((u) =>
    typeof u === "string"
      ? { image_url: u, main: false, main_integrator: false }
      : {
          image_url: u.image_url || u.url,
          main: !!u.main,
          main_integrator: !!u.main_integrator,
        }
  );
  return {
    id: String(p._id || p.id || ""),
    name: p.name || "",
    description: p.description || "",
    price: p.salePrice ?? p.price ?? 0,
    images: imgs,
    image: p.image || null,
    families: p.families || [],
    subattributes: p.subattributes || [],
    products: p.products || [],
    variants: p.variants || [],
    printing_types: p.printing_types || [],
    dimensions: p.dimensions || [],
    packaging: p.packaging || "",
    brandcapsProduct: p.brandcapsProduct || false,
    units_per_box: p.units_per_box || 0,
    supplementary_information_text: p.supplementary_information_text || "",
    minimum_order_quantity: p.minimum_order_quantity || 0,
    sku: p.sku || null,
    priceTiers: p.priceTiers || [],
    basePrice: typeof p?.basePrice === "number" ? p.basePrice : null,
    tax: typeof p?.tax === "number" ? p.tax : null,
  };
}

export async function getServerSideProps({ params }) {
  const { id } = params;

  try {
    console.log("[GSSP] detalle →", `${API_BASE}/api/store/products/${id}`);
    const res = await fetch(`${API_BASE}/api/store/products/${id}`);
    if (res.status === 404) return { notFound: true };
    if (!res.ok) {
      console.error("Detalle status:", res.status);
      return { notFound: true };
    }
    const raw = await res.json();
    const product = toZecatLike(raw);
    // relacionados por familia (opcional)
    let related = [];
    const usp = new URLSearchParams();

    const family = (product?.families ?? [])
      .map((f) => f?.description)
      .filter(Boolean);
    //console.log(family);
    // normalizamos a array
    const famArray = Array.isArray(family)
      ? family
      : family
      ? family
          .split(",")
          .map((s) => s.trim())
          .filter(Boolean)
      : [];
    famArray.forEach((f) => usp.append("family", f));
    //const fam = product.families?.[0]?.description;
    if (famArray) {
      const url = `${API_BASE}/api/store/products?limit=12&${usp.toString()}`;
      console.log("[GSSP] relacionados →", url);
      try {
        const r = await fetch(url);
        if (r.ok) {
          const rel = await r.json();
          const list = Array.isArray(rel.items)
            ? rel.items
            : rel.products || [];
          related = list
            .filter((it) => String(it._id || it.id) !== product.id)
            .map(toZecatLike);
          //console.log(related)
        } else {
          console.warn("Relacionados status:", r.status);
        }
      } catch (e) {
        console.warn("Relacionados error:", e?.message);
      }
    }

    return { props: { product, related } };
  } catch (e) {
    console.error("GSSP error:", e?.message);
    return { notFound: true };
  }
}

export default function ProductPage({ product, related }) {
  return (
    <>
      <NavBar />
      <main className="max-w-7xl mx-auto px-4 py-12 space-y-12">
        <ProductDetail producto={product} />
        {related?.length > 0 && <RelatedProductsCarousel productos={related} />}
      </main>
      <Footer />
    </>
  );
}
