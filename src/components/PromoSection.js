// components/PromoSection.js
"use client";
import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import useEmblaCarousel from "embla-carousel-react";
import Autoplay from "embla-carousel-autoplay";

export default function PromoSection({ banners = [] }) {
  // Cada banner: { id, image, href? , family? }
  const slides = Array.isArray(banners) ? banners : [];
  const [emblaRef, emblaApi] = useEmblaCarousel(
    { loop: true, align: "start", dragFree: false, skipSnaps: false },
    [Autoplay({ delay: 4000, stopOnInteraction: false })]
  );
  const [selected, setSelected] = useState(0);

  const onSelect = useCallback(() => {
    if (!emblaApi) return;
    setSelected(emblaApi.selectedScrollSnap());
  }, [emblaApi]);

  const scrollTo = useCallback(
    (i) => emblaApi && emblaApi.scrollTo(i),
    [emblaApi]
  );
  const scrollPrev = useCallback(
    () => emblaApi && emblaApi.scrollPrev(),
    [emblaApi]
  );
  const scrollNext = useCallback(
    () => emblaApi && emblaApi.scrollNext(),
    [emblaApi]
  );

  useEffect(() => {
    if (!emblaApi) return;
    onSelect();
    emblaApi.on("select", onSelect);
    emblaApi.on("reInit", onSelect);
  }, [emblaApi, onSelect]);

  if (!slides.length) return null;

  return (
    <section className="relative max-w-7xl mx-auto px-4 py-6">
      {/* Viewport */}
      <div className="overflow-hidden rounded-xl" ref={emblaRef}>
        {/* Container */}
        <div className="flex">
          {slides.map((b, idx) => {
            const href =
              b.href ??
              (b.family ? `/search?family=${encodeURIComponent(b.family)}` : "#");
            return (
              <div
                key={b.id ?? idx}
                className="min-w-0 flex-[0_0_100%] md:flex-[0_0_100%] pr-0"
              >
                <Link
                  href={href}
                  aria-label={`Banner ${idx + 1}`}
                  className="block w-full h-[200px] md:h-[320px] bg-center bg-no-repeat bg-cover"
                  style={{
                    backgroundImage: `url('${b.image}')`,
                    // si preferís que entre completa sin recorte:
                    // backgroundSize: "contain"
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>

      {/* Controles */}
      <div className="pointer-events-none absolute inset-y-0 left-0 right-0 flex items-center justify-between px-2">
        <button
          type="button"
          className="pointer-events-auto inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition"
          onClick={scrollPrev}
          aria-label="Anterior"
        >
          ‹
        </button>
        <button
          type="button"
          className="pointer-events-auto inline-flex h-9 w-9 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition"
          onClick={scrollNext}
          aria-label="Siguiente"
        >
          ›
        </button>
      </div>

      {/* Dots */}
      <div className="mt-3 flex items-center justify-center gap-2">
        {slides.map((_, i) => (
          <button
            key={i}
            onClick={() => scrollTo(i)}
            aria-label={`Ir al banner ${i + 1}`}
            className={`h-2.5 w-2.5 rounded-full transition ${
              i === selected ? "bg-black" : "bg-gray-300 hover:bg-gray-400"
            }`}
          />
        ))}
      </div>
    </section>
  );
}
