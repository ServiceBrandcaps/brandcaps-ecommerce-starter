// components/MostSearched.js
import React from 'react';
import Link from 'next/link';

const CATS = [
  { id: 'botellas', title: 'Botellas', img: '/images/botellas.jpg', filterFamily:[ 'drinkware'], subattrs: 'botella' },
  { id: 'mochilas', title: 'Mochilas', img: '/images/mochilas.jpg', filterFamily: ['bolsos y mochilas'], subattrs: ''},
  { id: 'remeras', title: 'Remeras', img: '/images/remeras.jpg', filterFamily: ['remeras'], subattrs: '' },
  // agregá más categorías según necesites
];

export default function MostSearched() {
  return (
    <div>
      <h3 className="text-xl font-semibold mb-4">Los más buscados</h3>
      <div className="flex space-x-4 overflow-x-auto scrollbar-hide">
        {CATS.map((cat) => (
          <Link
            key={cat.id}
            //{{ pathname: '/search', query: { q, family: ['Escritura', 'Logo 24hs'] } }}
            //{`/search?family=${encodeURIComponent(cat.filterFamily)}`}
            href={{ pathname: '/search', query: { family: cat.filterFamily, sub: cat.subattrs} } }
            className="flex-shrink-0 w-100 bg-white rounded-lg shadow hover:shadow-lg transition overflow-hidden"
          >
            <div className="h-32 bg-gray-100">
              <img
                src={cat.img}
                alt={cat.title}
                className="w-full h-full object-cover"
              />
            </div>
            <div className="p-3 text-center">
              <span className="text-gray-800 font-medium">{cat.title}</span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
