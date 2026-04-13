'use client'

import Image from 'next/image'
import { useQuery } from '@tanstack/react-query'
import { useSearchParams, useRouter } from 'next/navigation'
import { SlidersHorizontal, ChevronLeft, ChevronRight, X, Folder } from 'lucide-react'
import { tiendaApi } from '@/lib/api'
import { FiltrosProducto } from '@/types/producto'
import ProductoCard from '@/components/producto/ProductoCard'
import { idFromSlug, toSlug } from '@/lib/utils'

const OPCIONES_SORT = [
  { value: 'nombre_asc',   label: 'Nombre A-Z' },
  { value: 'nombre_desc',  label: 'Nombre Z-A' },
  { value: 'precio_asc',   label: 'Menor precio' },
  { value: 'precio_desc',  label: 'Mayor precio' },
  { value: 'nuevos',       label: 'Más nuevos' },
  { value: 'mejor_rating', label: 'Mejor puntuación' },
]

export default function CatalogoCliente() {
  const searchParams = useSearchParams()
  const router       = useRouter()

  // Todo desde la URL — es la fuente de verdad
  const search         = searchParams.get('search')      ?? ''
  const sort           = searchParams.get('sort')        ?? 'nombre_asc'
  const soloOfertas    = searchParams.get('solo_ofertas') === 'true'
  const categoriaSlug  = searchParams.get('categoria')   ?? ''
  const categoriaId    = categoriaSlug ? idFromSlug(categoriaSlug) : undefined
  const categoriaNombre = categoriaSlug
    ? categoriaSlug.split('-').slice(0, -1).map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ')
    : ''
  const page = Number(searchParams.get('page') ?? 1)

  const filtros: FiltrosProducto = {
    search:       search      || undefined,
    sort:         sort as FiltrosProducto['sort'],
    solo_ofertas: soloOfertas || undefined,
    categoria_id: categoriaId || undefined,
    page,
    per_page: 20,
  }

  const { data, isLoading, isError } = useQuery({
    queryKey: ['productos', filtros],
    queryFn:  () => tiendaApi.productos.listar(filtros),
  })

  const { data: dataCategorias } = useQuery({
    queryKey: ['categorias-buscar', search],
    queryFn:  () => tiendaApi.categorias.buscar(search),
    enabled:  search.length >= 2,
  })

  // Actualiza la URL preservando todos los parámetros actuales
  const updateUrl = (updates: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString())
    Object.entries(updates).forEach(([key, val]) => {
      if (val === null || val === '') params.delete(key)
      else params.set(key, val)
    })
    // Resetea la página si el cambio no es de página
    if (!('page' in updates)) params.delete('page')
    router.replace(`/productos?${params.toString()}`, { scroll: false })
  }

  const productos          = (data?.productos as any)?.data ?? []
  const totalPages         = (data?.productos as any)?.last_page ?? 1
  const total              = (data?.productos as any)?.total ?? 0
  const categoriasSugeridas = dataCategorias?.categorias ?? []

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Encabezado */}
      <div className="mb-5">
        <h1 className="text-2xl font-bold text-gray-900">
          {search
            ? `Resultados para "${search}"`
            : categoriaNombre
              ? categoriaNombre
              : 'Productos'}
        </h1>
        {!isLoading && (
          <p className="text-sm text-gray-500 mt-1">{total} productos encontrados</p>
        )}
      </div>

      {/* Sugerencias de categorías */}
      {search && categoriasSugeridas.length > 0 && (
        <div className="mb-6">
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
            Categorías relacionadas
          </p>
          <div className="flex flex-wrap gap-2">
            {categoriasSugeridas.map((cat) => (
              <button
                key={cat.id}
                onClick={() => updateUrl({ categoria: toSlug(cat.nombre, cat.id), search: null, page: null })}
                className="flex flex-col items-center gap-1.5 shrink-0 group/cat"
              >
                <span className="text-[11px] font-medium text-center text-gray-700 group-hover/cat:text-green-700 leading-tight max-w-[80px]">
                  {cat.nombre}
                </span>
                {cat.imagen ? (
                  <div className="relative w-16 h-16 rounded-xl overflow-hidden border border-gray-200 group-hover/cat:border-green-400 transition-colors">
                    <Image src={cat.imagen} alt={cat.nombre} fill className="object-cover" sizes="64px" />
                  </div>
                ) : (
                  <div className="w-16 h-16 rounded-xl bg-gray-100 border border-gray-200 group-hover/cat:border-green-400 flex items-center justify-center transition-colors">
                    <Folder className="w-6 h-6 text-gray-400" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filtros */}
      <div className="flex flex-wrap items-center gap-2 mb-6">

        {/* Ordenar */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-gray-400 shrink-0" />
          <select
            value={sort}
            onChange={(e) => updateUrl({ sort: e.target.value === 'nombre_asc' ? null : e.target.value })}
            className="border border-gray-200 rounded-lg text-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-500 bg-white"
          >
            {OPCIONES_SORT.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Chips activos */}
        {search && (
          <span className="flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-medium px-3 py-1.5 rounded-full border border-green-200">
            Búsqueda: {search}
            <button onClick={() => updateUrl({ search: null })} className="hover:text-green-900">
              <X className="w-3 h-3" />
            </button>
          </span>
        )}
        {categoriaSlug && (
          <span className="flex items-center gap-1.5 bg-green-50 text-green-700 text-xs font-medium px-3 py-1.5 rounded-full border border-green-200">
            {categoriaNombre}
            <button onClick={() => updateUrl({ categoria: null })} className="hover:text-green-900">
              <X className="w-3 h-3" />
            </button>
          </span>
        )}
      </div>

      {/* Grid */}
      {isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="rounded-2xl overflow-hidden shadow-sm">
              <div className="aspect-square bg-gray-100 animate-pulse" />
              <div className="p-3.5 flex flex-col gap-2">
                <div className="h-3 w-16 bg-gray-100 rounded animate-pulse" />
                <div className="h-4 w-full bg-gray-100 rounded animate-pulse" />
                <div className="h-5 w-24 bg-gray-100 rounded animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      )}

      {isError && (
        <div className="text-center py-20 text-gray-500">
          Error al cargar los productos. Intenta de nuevo.
        </div>
      )}

      {!isLoading && !isError && productos.length === 0 && (
        <div className="text-center py-20 text-gray-500">
          No se encontraron productos con esos filtros.
        </div>
      )}

      {!isLoading && productos.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {productos.map((p: any) => (
            <ProductoCard key={p.id} producto={p} />
          ))}
        </div>
      )}

      {/* Paginación */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <button
            onClick={() => updateUrl({ page: String(page - 1) })}
            disabled={page === 1}
            className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-sm text-gray-600 px-3">
            Página {page} de {totalPages}
          </span>
          <button
            onClick={() => updateUrl({ page: String(page + 1) })}
            disabled={page === totalPages}
            className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      )}
    </div>
  )
}