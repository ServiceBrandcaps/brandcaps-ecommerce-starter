// components/DiscoverSection.js
import React from 'react';
import Link from 'next/link';

const SECTIONS = [
  { id: 'drinkware', title: 'Drinkware', img: '/images/drinkware.jpg', href: '/categoria/drinkware' },
  { id: 'apparel', title: 'Apparel', img: '/images/apparel.jpg', href: '/categoria/apparel' },
];

export default function DiscoverSection() {
  return (
    <div className="mt-8 space-y-6">
      <h3 className="text-xl font-semibold">Descubrí</h3>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {SECTIONS.map((sec) => (
          <div
            key={sec.id}
            className="bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden flex"
          >
            <div className="flex-1 p-6">
              <h4 className="text-lg font-medium mb-4">{sec.title}</h4>
              <Link
                href={`/search?family=${encodeURIComponent(sec.id)}`}
                className="inline-block bg-black text-white px-4 py-2 rounded hover:bg-gray-700 transition"
              >
                Ver más
              </Link>
            </div>
            <div className="w-48 bg-gray-100">
              <img
                src={sec.img}
                alt={sec.title}
                className="w-full h-full object-cover"
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
