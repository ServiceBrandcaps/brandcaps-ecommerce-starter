// Enhanced Skeleton Card with better loading animation
export default function SkeletonCard({ variant = "default" }) {
  const compact = variant === "compact";

  return (
    <div className={`bg-white rounded-xl border overflow-hidden animate-pulse ${compact ? "w-[250px] h-[400px]" : "max-w-[320px] w-full mx-auto"}`}>
      {/* Image skeleton */}
      <div className={`${compact ? "aspect-square" : "aspect-[4/5]"} max-h-72 bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%] animate-shimmer`}></div>
      
      {/* Content skeleton */}
      <div className={`p-3 ${compact ? "space-y-1" : "sm:p-4 space-y-2"}`}>
        {/* Title lines */}
        <div className={`bg-gray-200 rounded ${compact ? "h-3" : "h-4"} w-4/5`}></div>
        <div className={`bg-gray-200 rounded ${compact ? "h-3" : "h-4"} w-3/5`}></div>
        
        {/* Category */}
        <div className={`bg-gray-200 rounded ${compact ? "h-2" : "h-3"} w-2/5 mt-2`}></div>
        
        {/* Price */}
        <div className={`bg-gray-200 rounded ${compact ? "h-4" : "h-5"} w-1/3 mt-2`}></div>
        
        {!compact && (
          <>
            {/* Stock section */}
            <div className="border-t pt-2 mt-2">
              <div className="flex justify-between items-center">
                <div className="bg-gray-200 rounded h-3 w-1/3"></div>
                <div className="bg-gray-200 rounded h-3 w-1/4"></div>
              </div>
            </div>
          </>
        )}
      </div>

      {/* Button skeleton */}
      <div className={`p-3 ${compact ? "" : "sm:p-4 pt-0"} mt-auto`}>
        <div className={`bg-gray-200 rounded-lg ${compact ? "h-8" : "h-10"} w-full`}></div>
      </div>
    </div>
  );
}
