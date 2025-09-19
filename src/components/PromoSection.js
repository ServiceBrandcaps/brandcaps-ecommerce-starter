// components/PromoSection.js
import React from 'react';
import Link from 'next/link';

/**
 * PromoSection muestra tres banners clickeables con background-images.
 * Sin texto ni botones: solo imágenes de fondo y enlaces completos.
 */
export default function PromoSection(props) {
  const { banners = [] } = props || {};

  return (
    <section className="max-w-7xl mx-auto px-4 py-10  gap-2 w-full">
      {/* Banner grande izquierdo: ocupa dos filas */}
    {banners.map((b) => (
      <Link
        key={b.id}
        href={`/search?family=${encodeURIComponent(b.family)}`}
        className="col-span-1 lg:col-span-1 row-span-2 block rounded-lg overflow-hidden bg-cover bg-center h-[200px] w-full"
        style={{
          backgroundImage: `url('${b.image}')`,
            backgroundPosition: "left center",
            backgroundSize: "cover",
        }}
      />
    ))}
{/*
      <Link
        href={`/search?family=${encodeURIComponent('invierno')}`}
        className="col-span-2 lg:col-span-1 block rounded-lg overflow-hidden bg-cover bg-center h-[240px] w-[500px]"
        style={{
          backgroundImage: "url('/banners/promo-winter.webp')",
            backgroundPosition: "center",
            backgroundSize: "cover",
        }}
      />
      <Link
        href={`/search?family=${encodeURIComponent('Drinkware')}`}
        className="col-span-2 lg:col-span-1 block rounded-lg overflow-hidden bg-cover bg-center h-[240px] w-[500px] "
        style={{
          backgroundImage: "url('/banners/promo-360.jpg')",
            backgroundPosition: "center",
            backgroundSize: "cover",
        }}
      /> */}
    </section>
  );
}
