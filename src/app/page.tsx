import Link from 'next/link'
import { ArrowRight, Tag } from 'lucide-react'
import { tiendaApi } from '@/lib/api'
import { Producto } from '@/types/producto'
import ProductoCard from '@/components/producto/ProductoCard'

async function getDestacados(): Promise<Producto[]> {
  try {
    const data = await tiendaApi.productos.destacados()
    return data.productos?.slice(0, 4) ?? []
  } catch {
    return []
  }
}

async function getOfertas(): Promise<Producto[]> {
  try {
    const data = await tiendaApi.productos.ofertas(1)
    return (data.productos as any)?.data?.slice(0, 4) ?? []
  } catch {
    return []
  }
}

export default async function HomePage() {
  const [destacados, ofertas] = await Promise.all([getDestacados(), getOfertas()])

  return (
    <div className="flex flex-col">

      {/* ── Hero ── */}
      <section className="bg-gradient-to-br from-green-600 to-green-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28 flex flex-col items-start gap-6">
          <span className="text-green-200 text-sm font-semibold uppercase tracking-widest">
            Tecnología y más
          </span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight max-w-2xl">
            Lo que necesitas, en un solo lugar
          </h1>
          <p className="text-green-100 text-lg max-w-xl leading-relaxed">
            Encuentra productos de calidad a un precio accesible. Envíos a toda Guatemala y garantía en todos los productos.
          </p>
          <div className="flex flex-wrap gap-3 mt-2">
            <Link
              href="/productos"
              className="inline-flex items-center gap-2 bg-white text-green-700 font-semibold px-6 py-3 rounded-xl hover:bg-green-50 transition-colors"
            >
              Ver productos
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/productos?solo_ofertas=true"
              className="inline-flex items-center gap-2 border border-white/40 text-white font-semibold px-6 py-3 rounded-xl hover:bg-white/10 transition-colors"
            >
              <Tag className="w-4 h-4" />
              Ver ofertas
            </Link>
          </div>
        </div>
      </section>

      {/* ── Destacados ── */}
      {destacados.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
          <div className="flex items-end justify-between mb-6">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Más vendidos</h2>
              <p className="text-sm text-gray-500 mt-1">Los favoritos de nuestros clientes</p>
            </div>
            <Link
              href="/productos"
              className="text-sm font-medium text-green-600 hover:text-green-700 flex items-center gap-1 transition-colors"
            >
              Ver todos <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {destacados.map((p) => (
              <ProductoCard key={p.id} producto={p} />
            ))}
          </div>
        </section>
      )}

      {/* ── Ofertas ── */}
      {ofertas.length > 0 && (
        <section className="bg-gray-50 py-14">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-end justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Ofertas</h2>
                <p className="text-sm text-gray-500 mt-1">Precios especiales por tiempo limitado</p>
              </div>
              <Link
                href="/productos?solo_ofertas=true"
                className="text-sm font-medium text-green-600 hover:text-green-700 flex items-center gap-1 transition-colors"
              >
                Ver todas <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {ofertas.map((p) => (
                <ProductoCard key={p.id} producto={p} />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── CTA final ── */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">¿No encontraste lo que buscas?</h2>
        <p className="text-gray-500 mb-6">Tenemos cientos de productos disponibles en nuestro catálogo completo.</p>
        <Link
          href="/productos"
          className="inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white font-semibold px-7 py-3 rounded-xl transition-colors"
        >
          Ver catálogo completo
          <ArrowRight className="w-4 h-4" />
        </Link>
      </section>
    </div>
  )
}