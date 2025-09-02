export default function SkeletonCard() {
  return (
    <div className="animate-pulse rounded border p-3">
      <div className="aspect-square bg-gray-200 mb-2 rounded" />
      <div className="h-3 bg-gray-200 rounded w-3/4 mb-2" />
      <div className="h-3 bg-gray-200 rounded w-1/2" />
    </div>
  )
}
