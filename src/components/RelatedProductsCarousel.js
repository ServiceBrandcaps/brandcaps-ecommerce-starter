// components/RelatedProductsCarousel.js
import React, { useRef } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/solid';
import ProductCard from './ProductCard';

/**
 * Galería horizontal de productos relacionados con flechas.
 * @param {{ productos: Array }} props
 */
export default function RelatedProductsCarousel({ productos = [] }) {
  const containerRef = useRef(null);

  const scroll = (direction) => {
    const container = containerRef.current;
    if (!container) return;
    const scrollAmount = container.offsetWidth * 0.8;
    container.scrollBy({ left: direction * scrollAmount, behavior: 'smooth' });
  };

  if (!productos.length) return null;

  return (
    <section className="relative max-w-7xl mx-auto px-4 py-12">
      <h2 className="text-2xl font-semibold mb-6">Productos relacionados</h2>

      {/* Flecha izquierda */}
      <button
        onClick={() => scroll(-1)}
        className="absolute left-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-75 rounded-full p-2 shadow z-10 hover:bg-opacity-100"
      >
        <ChevronLeftIcon className="w-6 h-6 text-gray-700" />
      </button>

      {/* Contenedor scroll */}
      <div
        ref={containerRef}
        className="flex space-x-4 overflow-x-auto scrollbar-hide scroll-smooth"
      >
        {productos.map((p) => (
          <div key={p.id} className="flex-shrink-0">
            <ProductCard producto={p} />
          </div>
        ))}
      </div>

      {/* Flecha derecha */}
      <button
        onClick={() => scroll(1)}
        className="absolute right-2 top-1/2 transform -translate-y-1/2 bg-white bg-opacity-75 rounded-full p-2 shadow z-10 hover:bg-opacity-100"
      >
        <ChevronRightIcon className="w-6 h-6 text-gray-700" />
      </button>
    </section>
  );
}
