'use client'

import { useState, useRef, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { LayoutGrid, ChevronDown, ChevronRight } from 'lucide-react'
import { tiendaApi } from '@/lib/api'
import { CategoriaArbol } from '@/types/producto'
import { toSlug } from '@/lib/utils'

// ── Item recursivo ────────────────────────────────────────────────────────────

function CategoriaItem({
  cat,
  onSelect,
  nivel = 0,
}: {
  cat: CategoriaArbol
  onSelect: () => void
  nivel?: number
}) {
  const router     = useRouter()
  const [abierto, setAbierto] = useState(false)
  const tieneHijos = cat.children_recursive.length > 0

  const handleSeleccionar = () => {
    router.push(`/productos?categoria=${toSlug(cat.nombre, cat.id)}`)
    onSelect()
  }

  return (
    <div>
      <div
        className="flex items-center rounded-lg overflow-hidden hover:bg-green-50 transition-colors"
        style={{ paddingLeft: `${nivel * 0.75}rem` }}
      >
        {/* Nombre — siempre navega */}
        <button
          onClick={handleSeleccionar}
          className={`flex-1 text-left px-3 py-2 text-sm transition-colors truncate
            ${nivel > 0 ? 'text-gray-500 hover:text-green-600' : 'text-gray-700 font-medium hover:text-green-700'}`}
        >
          {cat.nombre}
        </button>

        {/* Flecha — solo expande/colapsa hijos */}
        {tieneHijos && (
          <button
            onClick={() => setAbierto(!abierto)}
            className="px-3 py-2 text-gray-400 hover:text-green-600 hover:bg-green-50 shrink-0 self-stretch flex items-center"
          >
            <ChevronRight
              className={`w-4 h-4 transition-transform duration-200 ${abierto ? 'rotate-90' : ''}`}
            />
          </button>
        )}
      </div>

      {/* Hijos */}
      {tieneHijos && abierto && (
        <div className="border-l border-gray-100 ml-4">
          {cat.children_recursive.map((hijo) => (
            <CategoriaItem key={hijo.id} cat={hijo} onSelect={onSelect} nivel={nivel + 1} />
          ))}
        </div>
      )}
    </div>
  )
}

// ── Dropdown principal ────────────────────────────────────────────────────────

export default function CategoriasDropdown() {
  const [abierto, setAbierto] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['categorias-tree'],
    queryFn:  () => tiendaApi.categorias.tree(),
    staleTime: 10 * 60 * 1000,
  })

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setAbierto(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const categorias = data?.categorias ?? []

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setAbierto(!abierto)}
        className={`flex items-center gap-1.5 text-sm font-medium px-3 py-2 rounded-xl transition-colors whitespace-nowrap ${
          abierto
            ? 'bg-green-50 text-green-700'
            : 'text-gray-600 hover:bg-gray-100 hover:text-gray-800'
        }`}
      >
        <LayoutGrid className="w-4 h-4" />
        Categorías
        <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-200 ${abierto ? 'rotate-180' : ''}`} />
      </button>

      {abierto && (
        <div className="absolute top-full left-0 mt-1.5 w-60 bg-white rounded-2xl shadow-xl border border-gray-100 py-2 z-50 max-h-80 overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col gap-1 px-2 py-1">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-8 bg-gray-100 rounded-lg animate-pulse" />
              ))}
            </div>
          ) : categorias.length === 0 ? (
            <p className="text-xs text-gray-400 px-4 py-3">Sin categorías disponibles</p>
          ) : (
            <div className="flex flex-col px-1">
              {categorias.map((cat) => (
                <CategoriaItem key={cat.id} cat={cat} onSelect={() => setAbierto(false)} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}