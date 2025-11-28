/*
  E-commerce Starter con Next.js, Tailwind CSS, autenticación JWT,
  carrusel de productos, secciones de búsqueda y footer.
*/
import Head from "next/head";
import React from "react";
import NavBar from "../components/NavBar";
import Hero from "../components/Hero";
import ProductCarousel from "../components/ProductCarousel";
import MostSearched from "../components/MostSearched";
import DiscoverSection from "../components/DiscoverSection";
//import PopularCategories from '../components/PopularCategories';
import PromoSection from "../components/PromoSection";
import Footer from "../components/Footer";
import FloatingWhatsAppButton from "@/components/FloatingWhatsAppButton";
import banners from "../../public/banners.json"

/**
 * Carga productos desde TU API pública (no Zecat).
 * Usa `section=featured` si tenés destacados; si no, quitalo.
 */
export async function getStaticProps() {
  const base = process.env.NEXT_PUBLIC_API_BASE;
  const url = `${base}/api/store/products?limit=20&section=destacados`;
  // &section=featured

  try {
    const res = await fetch(url, {
      headers: { "Content-Type": "application/json" },
    });
    if (!res.ok) throw new Error(`API ${res.status}`);
    const data = await res.json();

    // data.items viene de tu backend público.
    // Lo adaptamos al formato que espera el carrusel (Zecat-like).
    const productos = Array.isArray(data.items)
      ? data.items.map((it) => ({
          id: it._id || it.id || String(it._id || ""),
          name: it.name,
          price: it.salePrice ?? it.price ?? 0,
          images: it.images, //        ? [{ image_url: it.image, main: true, main_integrator: true }]
          //: (it.images || []).map(u => ({ image_url: u, main: false, main_integrator: false }))
          families: it.families || [],
          products: it.products || [],
        }))
      : [];
    //console.log(productos[0]);
    return { props: { productos }, revalidate: 60 };
  } catch (e) {
    console.error("Error cargando productos del backend público:", e);
    return { props: { productos: [] }, revalidate: 60 };
  }
}

/**
 * Página principal con todas las secciones.
 */
export default function HomePage({ productos }) {
  return (
    <div className="bg-gray-100 min-h-screen">
      <Head>
        <title>Bienvenido a Brandcaps Store!</title>
      </Head>
      <NavBar />
      <Hero />

      <main className="max-w-7xl mx-auto px-3 sm:px-4 lg:px-6"> {/*pt-5 max-w-7xl mx-auto px-4 space-y-16 mb-16*/}
        {/* Sección de promociones */}
        <section>
          <PromoSection
            banners={banners}
          />
        </section>

        {/* Productos Destacados */}
        <section>
          <h2 className="text-2xl font-bold mb-4">Productos Destacados</h2>
          <ProductCarousel productos={productos}/>
        </section>

        {/* Sección de promociones */}
        {/* <section>
          <PromoSection
            banners={[
              {
                id: "mates",
                family: "Mates, termos y materas",
                image: "/banners/mates.webp",
              },
            ]}
          />
        </section> */}

        {/* Los más buscados */}
        <section>
          <MostSearched />
        </section>

        {/* Sección Descubrí */}
        <section className="mb-5">
          <DiscoverSection />
        </section>

        {/* Categorías más visitadas */}
        {/* <section>
          <PopularCategories />
        </section> */}
      </main>

      <Footer />
      <FloatingWhatsAppButton />
    </div>
  );
}
