// components/PromoSection.js
import React from 'react';
import Link from 'next/link';

/**
 * PromoSection muestra tres banners clickeables con background-images.
 * Sin texto ni botones: solo imágenes de fondo y enlaces completos.
 */
export default function PromoSection() {
  return (
    <section className="max-w-7xl mx-auto px-4 py-10 grid grid-cols-2 grid-rows-2 gap-2">
      {/* Banner grande izquierdo: ocupa dos filas */}
      <Link
        href={`/search?family=${encodeURIComponent('Novedades')}`}
        className="col-span-1 lg:col-span-1 row-span-2 block rounded-lg overflow-hidden bg-cover bg-center h-[500px] w-[600px]"
        style={{
          backgroundImage: "url('/banners/promo-large.jpg')",
            backgroundPosition: "left center",
            backgroundSize: "cover",
        }}
      />

      {/* Banner superior derecho */}
      <Link
        href={`/search?family=${encodeURIComponent('invierno')}`}
        className="col-span-2 lg:col-span-1 block rounded-lg overflow-hidden bg-cover bg-center h-[240px] w-[500px]"
        style={{
          backgroundImage: "url('/banners/promo-winter.webp')",
            backgroundPosition: "center",
            backgroundSize: "cover",
        }}
      />

      {/* Banner inferior derecho */}
      <Link
        href={`/search?family=${encodeURIComponent('Drinkware')}`}
        className="col-span-2 lg:col-span-1 block rounded-lg overflow-hidden bg-cover bg-center h-[240px] w-[500px] "
        style={{
          backgroundImage: "url('/banners/promo-360.jpg')",
            backgroundPosition: "center",
            backgroundSize: "cover",
        }}
      />
    </section>
  );
}
