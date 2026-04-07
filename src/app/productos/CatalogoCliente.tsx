'use client'

import { useQuery } from '@tanstack/react-query'
import { useSearchParams, useRouter } from 'next/navigation'
import { useState, useEffect } from 'react'
import { Search, SlidersHorizontal, ChevronLeft, ChevronRight } from 'lucide-react'
import { tiendaApi } from '@/lib/api'
import { FiltrosProducto } from '@/types/producto'
import ProductoCard from '@/components/producto/ProductoCard'

const OPCIONES_SORT = [
  { value: 'nombre_asc', label: 'Nombre A-Z' },
  { value: 'precio_asc', label: 'Menor precio' },
  { value: 'precio_desc', label: 'Mayor precio' },
  { value: 'nuevos', label: 'Más nuevos' },
]

export default function CatalogoCliente() {
  const searchParams = useSearchParams()
  const router = useRouter()

  const [search, setSearch]   = useState(searchParams.get('search') ?? '')
  const [sort, setSort]       = useState(searchParams.get('sort') ?? 'nombre_asc')
  const [soloOfertas, setSoloOfertas] = useState(searchParams.get('solo_ofertas') === 'true')
  const [page, setPage]       = useState(Number(searchParams.get('page') ?? 1))

  const filtros: FiltrosProducto = {
    search:       search || undefined,
    sort:         sort as FiltrosProducto['sort'],
    solo_ofertas: soloOfertas || undefined,
    page,
    per_page:     20,
  }

  const { data, isLoading, isError } = useQuery({
    queryKey: ['productos', filtros],
    queryFn:  () => tiendaApi.productos.listar(filtros),
  })

  // Sincroniza URL con filtros
  useEffect(() => {
    const params = new URLSearchParams()
    if (search)       params.set('search', search)
    if (sort !== 'nombre_asc') params.set('sort', sort)
    if (soloOfertas)  params.set('solo_ofertas', 'true')
    if (page > 1)     params.set('page', String(page))
    router.replace(`/productos${params.toString() ? '?' + params.toString() : ''}`, { scroll: false })
  }, [search, sort, soloOfertas, page])

  const productos    = (data?.productos as any)?.data ?? []
  const totalPages   = (data?.productos as any)?.last_page ?? 1
  const total        = (data?.productos as any)?.total ?? 0

  const handleSearch = (val: string) => { setSearch(val); setPage(1) }
  const handleSort   = (val: string) => { setSort(val);   setPage(1) }
  const toggleOfertas = ()           => { setSoloOfertas(!soloOfertas); setPage(1) }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Encabezado */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900">Productos</h1>
        {!isLoading && (
          <p className="text-sm text-gray-500 mt-1">{total} productos encontrados</p>
        )}
      </div>

      {/* Filtros */}
      <div className="flex flex-col sm:flex-row gap-3 mb-6">
        {/* Búsqueda */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            placeholder="Buscar productos..."
            value={search}
            onChange={(e) => handleSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
          />
        </div>

        {/* Ordenar */}
        <div className="flex items-center gap-2">
          <SlidersHorizontal className="w-4 h-4 text-gray-400 shrink-0" />
          <select
            value={sort}
            onChange={(e) => handleSort(e.target.value)}
            className="border border-gray-200 rounded-lg text-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            {OPCIONES_SORT.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        </div>

        {/* Solo ofertas */}
        <button
          onClick={toggleOfertas}
          className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
            soloOfertas
              ? 'bg-red-500 text-white border-red-500'
              : 'bg-white text-gray-600 border-gray-200 hover:border-red-400'
          }`}
        >
          Solo ofertas
        </button>
      </div>

      {/* Grid */}
      {isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="bg-gray-100 rounded-xl aspect-[3/4] animate-pulse" />
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
            onClick={() => setPage(page - 1)}
            disabled={page === 1}
            className="p-2 rounded-lg border border-gray-200 disabled:opacity-40 hover:bg-gray-50 transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>

          <span className="text-sm text-gray-600 px-3">
            Página {page} de {totalPages}
          </span>

          <button
            onClick={() => setPage(page + 1)}
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
