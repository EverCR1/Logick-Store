export default function LoadingProductos() {
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-pulse">

      {/* Encabezado */}
      <div className="mb-6">
        <div className="h-7 w-32 bg-gray-200 rounded-lg mb-2" />
        <div className="h-4 w-44 bg-gray-100 rounded" />
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        <div className="flex-1 h-10 bg-gray-100 rounded-lg" />
        <div className="w-36 h-10 bg-gray-100 rounded-lg" />
        <div className="w-28 h-10 bg-gray-100 rounded-lg" />
      </div>

      {/* Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="rounded-2xl overflow-hidden shadow-sm bg-white">
            <div className="aspect-square bg-gray-200" />
            <div className="p-3.5 flex flex-col gap-2">
              <div className="h-3 w-16 bg-gray-200 rounded" />
              <div className="h-4 w-full bg-gray-200 rounded" />
              <div className="h-4 w-3/4 bg-gray-100 rounded" />
              <div className="h-5 w-24 bg-gray-200 rounded mt-1" />
              <div className="h-8 w-full bg-gray-100 rounded-xl mt-1" />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}