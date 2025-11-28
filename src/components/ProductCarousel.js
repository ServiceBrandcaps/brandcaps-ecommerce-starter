import React, { useRef, useEffect } from 'react';
import { ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import ProductCard from './ProductCard';

export default function ProductCarousel({ productos }) {
  const containerRef = useRef(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    let scrollAmount = 0;
    const step = el.clientWidth;
    const maxScroll = el.scrollWidth - el.clientWidth;

    const interval = setInterval(() => {
      scrollAmount = scrollAmount + step > maxScroll ? 0 : scrollAmount + step;
      el.scrollTo({ left: scrollAmount, behavior: 'smooth' });
    }, 6000);

    return () => clearInterval(interval);
  }, []);

  const scroll = (offset) => {
    if (containerRef.current) {
      containerRef.current.scrollBy({ left: offset, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => scroll(-containerRef.current.clientWidth)}
        className="absolute left-0 top-1/2 z-10 transform -translate-y-1/2 bg-white bg-opacity-75 p-2 rounded-full shadow hover:bg-opacity-100 focus:outline-none cursor-pointer  hover:bg-gray-100"
      >
        <ChevronLeftIcon className="w-6 h-6 text-gray-700" />
      </button>

      <div
        ref={containerRef}
        className="flex space-x-6 overflow-x-auto scrollbar-hide py-4"
      >
        {productos.map((p) => (
          <div key={p.id} className="flex-shrink-0 w-[240px]">
            <ProductCard producto={p} />
          </div>
        ))}
      </div>

      <button
        onClick={() => scroll(containerRef.current.clientWidth)}
        className="absolute right-0 top-1/2 z-10 transform -translate-y-1/2 bg-white bg-opacity-75 p-2 rounded-full shadow hover:bg-opacity-100 focus:outline-none cursor-pointer  hover:bg-gray-100"
      >
        <ChevronRightIcon className="w-6 h-6 text-gray-700" />
      </button>
    </div>
  );
}
