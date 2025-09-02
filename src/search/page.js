import ProductGrid from '@/components/store/ProductGrid'

async function fetchProducts(searchParams) {
  const sp = new URLSearchParams()
  if (searchParams.q)      sp.set('q', searchParams.q)
  if (searchParams.family) sp.set('family', searchParams.family)
  // sub puede venir múltiples veces
  const sub = searchParams.sub
  if (Array.isArray(sub)) sub.forEach(s => sp.append('sub', s))
  else if (sub) sp.append('sub', sub)

  const page = Number(searchParams.page || 1)
  sp.set('page', String(page))
  sp.set('limit', '30')

  const res = await fetch(`${process.env.NEXT_PUBLIC_SITE_URL || ''}/api/store/products?${sp}`, {
    // que no se quede cacheado
    cache: 'no-store'
  })
  if (!res.ok) return { items: [], total: 0, totalPages: 1, page: 1 }
  return res.json()
}

export default async function SearchPage({ searchParams }) {
  const { items, total, totalPages, page } = await fetchProducts(searchParams)

  const q = searchParams.q || ''
  const family = searchParams.family || ''

  const makePageHref = (p) => {
    const sp = new URLSearchParams(searchParams)
    sp.set('page', String(p))
    return `/search?${sp.toString()}`
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6">
      <h1 className="text-2xl font-bold">
        Resultados {q ? <>para “{q}”</> : family ? <>en “{family}”</> : null}
      </h1>

      <ProductGrid items={items} />

      <div className="flex items-center justify-between text-sm text-gray-600">
        <span>Página {page} de {totalPages} — Total: {total} productos</span>
        <div className="space-x-2">
          <a
            href={makePageHref(Math.max(1, page - 1))}
            className={`px-3 py-1 rounded border ${page <= 1 ? 'pointer-events-none opacity-50' : ''}`}
          >
            ‹ Anterior
          </a>
          <a
            href={makePageHref(Math.min(totalPages, page + 1))}
            className={`px-3 py-1 rounded border ${page >= totalPages ? 'pointer-events-none opacity-50' : ''}`}
          >
            Siguiente ›
          </a>
        </div>
      </div>
    </div>
  )
}
