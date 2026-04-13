export default function LoadingHome() {
  return (
    <div className="flex flex-col animate-pulse">

      {/* Hero skeleton */}
      <div className="bg-green-700/20 h-72 sm:h-80" />

      {/* Destacados skeleton */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14 w-full">
        <div className="h-7 w-40 bg-gray-200 rounded-lg mb-1" />
        <div className="h-4 w-56 bg-gray-100 rounded mb-6" />
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden shadow-sm">
              <div className="aspect-square bg-gray-200" />
              <div className="p-3.5 flex flex-col gap-2">
                <div className="h-3 w-16 bg-gray-200 rounded" />
                <div className="h-4 w-full bg-gray-200 rounded" />
                <div className="h-4 w-3/4 bg-gray-200 rounded" />
                <div className="h-5 w-24 bg-gray-200 rounded mt-1" />
                <div className="h-8 w-full bg-gray-200 rounded-xl mt-1" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}