export default function Loading() {
  const cards = Array.from({ length: 12 })
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-6 animate-pulse">
      <div className="h-6 w-52 bg-gray-200 rounded" />
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4">
        {cards.map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="w-full aspect-[4/3] bg-gray-200 rounded-lg" />
            <div className="h-4 w-3/4 bg-gray-200 rounded" />
            <div className="h-5 w-24 bg-gray-200 rounded" />
          </div>
        ))}
      </div>
    </div>
  )
}
