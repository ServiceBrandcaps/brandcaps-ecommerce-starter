import React from 'react';
import Link from 'next/link';
import {
  ShoppingBagIcon,
  CollectionIcon,
  ArrowPathIcon,
} from '@heroicons/react/24/outline';

const POPULAR = [
  {
    id: 'bolsosyMochilas',
    title: 'Bolsos y Mochilas',
    icon: <ShoppingBagIcon className="w-5 h-5 mr-2" />,  
    href: '/categoria/bolsos',
  },
  {
    id: 'apparel',
    title: 'Apparel',
    icon: <CollectionIcon className="w-5 h-5 mr-2" />,  
    href: '/categoria/apparel',
  },
  {
    id: 'drinkware',
    title: 'Drinkware',
    icon: <ArrowPathIcon className="w-5 h-5 mr-2" />,   
    href: '/categoria/drinkware',
  },
  {
    id: 'sustentables',
    title: 'Sustentables',
    icon: <ArrowPathIcon className="w-5 h-5 mr-2" />,  
    href: '/categoria/sustentables',
  },
];

export default function PopularCategories() {
  return (
    <div className="mt-8">
      <h3 className="text-xl font-semibold mb-4">Categorías más visitadas</h3>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {POPULAR.map((cat) => (
          <Link
            key={cat.id}
            href={`/search?family=${encodeURIComponent(cat.id)}`}
            className="flex items-center justify-center bg-white border rounded-lg py-3 hover:shadow transition"
          >
            {cat.icon}
            <span className="text-gray-800">{cat.title}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
