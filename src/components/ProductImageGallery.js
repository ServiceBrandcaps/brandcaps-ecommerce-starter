// components/ProductImageGallery.js
import React, { useState } from 'react';
import { ChevronUpIcon, ChevronDownIcon } from '@heroicons/react/24/solid';

/**
 * Galería vertical de miniaturas:
 * - 5 visibles
 * - Flechas arriba/abajo para paginar
 * - Imagen grande a la derecha
 */
export default function ProductImageGallery({ images = [] }) {
  const visibleCount = 5;
  const [startIdx, setStartIdx] = useState(0);
  const [selectedIdx, setSelectedIdx] = useState(0);

  const endIdx = startIdx + visibleCount;
  const canScrollUp = startIdx > 0;
  const canScrollDown = endIdx < images.length;

  const handleUp = () => {
    if (!canScrollUp) return;
    const newStart = Math.max(0, startIdx - 1);
    setStartIdx(newStart);
    if (selectedIdx < newStart) setSelectedIdx(newStart);
  };

  const handleDown = () => {
    if (!canScrollDown) return;
    const newStart = Math.min(images.length - visibleCount, startIdx + 1);
    setStartIdx(newStart);
    if (selectedIdx >= newStart + visibleCount) setSelectedIdx(newStart + visibleCount - 1);
  };

  const thumbs = images.slice(startIdx, endIdx);
  const selected = images[selectedIdx] || {};

  return (
    <div className="flex">
      {/* Columna de miniaturas */}
      <div className="flex flex-col items-center mr-4">
        <button onClick={handleUp} disabled={!canScrollUp} className="p-1 disabled:opacity-50">
          <ChevronUpIcon className="w-6 h-6 text-gray-600" />
        </button>
        <div className="flex flex-col space-y-2 overflow-hidden h-[400px]">
          {thumbs.map((img, i) => {
            const idx = startIdx + i;
            const isSel = idx === selectedIdx;
            return (
              <button
                key={img.id || i}
                onClick={() => setSelectedIdx(idx)}
                className={`w-16 h-16 rounded overflow-hidden border ${
                  isSel ? 'ring-3 ring-black' : 'ring-1 ring-gray-300'
                }`}
              >
                <img
                  src={img.image_url}
                  alt={img.alt || ''}
                  className="w-full h-full object-cover"
                />
              </button>
            );
          })}
        </div>
        <button onClick={handleDown} disabled={!canScrollDown} className="p-1 disabled:opacity-50">
          <ChevronDownIcon className="w-6 h-6 text-gray-600" />
        </button>
      </div>

      {/* Imagen principal */}
      <div className="flex-1 w-full h-[400px] bg-gray-50 rounded overflow-hidden">
        {selected.image_url ? (
          <img
            src={selected.image_url}
            alt={selected.alt || ''}
            className="w-full h-full object-contain"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-500">
            Sin imagen
          </div>
        )}
      </div>
    </div>
  );
}
