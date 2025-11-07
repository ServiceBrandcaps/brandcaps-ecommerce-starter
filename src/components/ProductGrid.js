import ProductCard from './ProductCard'
import SkeletonCard from './SkeletonCard'
import EmptyState from './EmptyState'
import ErrorMessage from './ErrorMessage'
import Link from 'next/link'

export default function ProductGrid({ items, loading, error, onRetry }) {
  // Loading state
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <ErrorMessage
        title="Error al cargar productos"
        message={error.message || "No pudimos cargar los productos. Por favor, intenta nuevamente."}
        onRetry={onRetry}
      />
    )
  }

  // Empty state
  if (!items?.length) {
    return (
      <EmptyState
        icon="🔍"
        title="No encontramos productos"
        message="No hay productos disponibles en este momento. Prueba ajustando tus filtros o vuelve más tarde."
        action={
          <Link 
            href="/"
            className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition"
          >
            Volver al inicio
          </Link>
        }
      />
    )
  }

  // Success state
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
      {items.map(p => (
        <ProductCard key={p._id || p.id} product={p} />
      ))}
    </div>
  )
}
