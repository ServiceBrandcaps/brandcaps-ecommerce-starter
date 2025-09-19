import ProductCard from './ProductCard'
import SkeletonCard from './SkeletonCard'

export default function ProductGrid({ items, loading }) {
  //console.log(items);
  if (loading) {
    return (
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 12 }).map((_, i) => <SkeletonCard key={i} />)}
      </div>
    )
  }
  if (!items?.length) {
    return <p className="text-gray-500">No encontramos productos.</p>
  }
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
      {items.map(p => <ProductCard key={p._id} product={p} />)}
    </div>
  )
}
