import Link from 'next/link'
import {
  ArrowRight, Tag, Gamepad2, Headphones, HardDrive,
  Wifi, Monitor, Smartphone, Tv2, Zap,
} from 'lucide-react'
import { tiendaApi } from '@/lib/api'
import { toSlug } from '@/lib/utils'
import { Producto } from '@/types/producto'
import ProductoCard from '@/components/producto/ProductoCard'

// ── Categorías conocidas (IDs de BD) ──────────────────────────────────────────
const CAT = {
  gaming:       2,
  audio:        19,
  almacen:      13,
  redes:        16,
  computadoras: 6,
  celulares:    7,
  monitores:    17,
  television:   5,
  energia:      8,
} as const

// ── Fetchers ──────────────────────────────────────────────────────────────────

async function getPorCategoria(categoriaId: number): Promise<Producto[]> {
  try {
    const data = await tiendaApi.productos.listar({ categoria_id: categoriaId, per_page: 4 })
    return (data.productos as any)?.data?.slice(0, 4) ?? []
  } catch {
    return []
  }
}

// ── Categorías del grid de exploración ───────────────────────────────────────
const CATEGORIAS_GRID = [
  { id: CAT.gaming,       nombre: 'Gaming',           Icon: Gamepad2,   color: 'bg-purple-50 text-purple-600 hover:bg-purple-100' },
  { id: CAT.audio,        nombre: 'Audio',            Icon: Headphones, color: 'bg-blue-50   text-blue-600   hover:bg-blue-100'   },
  { id: CAT.computadoras, nombre: 'Computadoras',     Icon: Monitor,    color: 'bg-green-50  text-green-600  hover:bg-green-100'  },
  { id: CAT.celulares,    nombre: 'Celulares',        Icon: Smartphone, color: 'bg-orange-50 text-orange-600 hover:bg-orange-100' },
  { id: CAT.almacen,      nombre: 'Almacenamiento',   Icon: HardDrive,  color: 'bg-gray-100  text-gray-600   hover:bg-gray-200'   },
  { id: CAT.redes,        nombre: 'Internet y Redes', Icon: Wifi,       color: 'bg-cyan-50   text-cyan-600   hover:bg-cyan-100'   },
  { id: CAT.television,   nombre: 'Televisión',       Icon: Tv2,        color: 'bg-red-50    text-red-600    hover:bg-red-100'    },
  { id: CAT.energia,      nombre: 'Energía',          Icon: Zap,        color: 'bg-yellow-50 text-yellow-600 hover:bg-yellow-100' },
]

// ── Secciones de productos por categoría ────────────────────────────────────
const SECCIONES = [
  {
    id:          CAT.gaming,
    nombre:      'Gaming',
    descripcion: 'Equípate para el siguiente nivel',
    Icon:        Gamepad2,
    iconColor:   'text-purple-500',
    bg:          '',
  },
  {
    id:          CAT.audio,
    nombre:      'Audio',
    descripcion: 'Bocinas, audífonos y más',
    Icon:        Headphones,
    iconColor:   'text-blue-500',
    bg:          'bg-gray-50',
  },
  {
    id:          CAT.computadoras,
    nombre:      'Computadoras y Accesorios',
    descripcion: 'Todo para tu PC y laptop',
    Icon:        Monitor,
    iconColor:   'text-green-600',
    bg:          '',
  },
  {
    id:          CAT.celulares,
    nombre:      'Celulares y Accesorios',
    descripcion: 'Dispositivos y accesorios móviles',
    Icon:        Smartphone,
    iconColor:   'text-orange-500',
    bg:          'bg-gray-50',
  },
]

// ── Página ────────────────────────────────────────────────────────────────────

export default async function HomePage() {
  const productos = await Promise.all(
    SECCIONES.map((s) => getPorCategoria(s.id))
  )

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

      {/* ── Explorar por categoría ── */}
      <section className="bg-gray-50 py-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-lg font-semibold text-gray-700 mb-5">Explorar por categoría</h2>
          <div className="grid grid-cols-4 sm:grid-cols-8 gap-3">
            {CATEGORIAS_GRID.map(({ id, nombre, Icon, color }) => (
              <Link
                key={id}
                href={`/productos?categoria=${toSlug(nombre, id)}`}
                className={`flex flex-col items-center gap-2 py-4 px-2 rounded-2xl transition-colors ${color}`}
              >
                <Icon className="w-6 h-6" />
                <span className="text-[11px] font-semibold text-center leading-tight">{nombre}</span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── Secciones por categoría ── */}
      {SECCIONES.map((sec, i) => {
        const lista = productos[i]
        if (!lista.length) return null
        const { Icon } = sec
        return (
          <section key={sec.id} className={`${sec.bg} py-14`}>
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              <div className="flex items-end justify-between mb-6">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <Icon className={`w-5 h-5 ${sec.iconColor}`} />
                    <h2 className="text-2xl font-bold text-gray-900">{sec.nombre}</h2>
                  </div>
                  <p className="text-sm text-gray-500">{sec.descripcion}</p>
                </div>
                <Link
                  href={`/productos?categoria=${toSlug(sec.nombre, sec.id)}`}
                  className="text-sm font-medium text-green-600 hover:text-green-700 flex items-center gap-1 transition-colors"
                >
                  Ver todos <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {lista.map((p) => (
                  <ProductoCard key={p.id} producto={p} />
                ))}
              </div>
            </div>
          </section>
        )
      })}

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