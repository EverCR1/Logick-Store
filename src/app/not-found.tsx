import Link from 'next/link'
import { SearchX } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center px-4 py-24 text-center">
      <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center mb-6">
        <SearchX className="w-9 h-9 text-gray-400" />
      </div>
      <h1 className="text-6xl font-bold text-gray-900 mb-2">404</h1>
      <h2 className="text-xl font-semibold text-gray-700 mb-2">Página no encontrada</h2>
      <p className="text-gray-500 text-sm max-w-sm mb-8">
        La página que buscas no existe o el producto fue eliminado.
      </p>
      <div className="flex flex-wrap gap-3 justify-center">
        <Link
          href="/"
          className="bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
        >
          Ir al inicio
        </Link>
        <Link
          href="/productos"
          className="border border-gray-200 hover:border-green-400 text-gray-600 hover:text-green-600 font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors"
        >
          Ver productos
        </Link>
      </div>
    </div>
  )
}