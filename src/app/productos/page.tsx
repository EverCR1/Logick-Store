import type { Metadata } from 'next'
import { Suspense } from 'react'
import CatalogoCliente from './CatalogoCliente'

export const metadata: Metadata = { title: 'Productos' }

export default function ProductosPage() {
  return (
    <Suspense fallback={
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-xl aspect-[3/4] animate-pulse" />
          ))}
        </div>
      </div>
    }>
      <CatalogoCliente />
    </Suspense>
  )
}
