'use client'

import Image from 'next/image'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { Search, X } from 'lucide-react'
import { useQuery } from '@tanstack/react-query'
import { tiendaApi } from '@/lib/api'
import { formatPrecio, toSlug, nombreConColor } from '@/lib/utils'

interface Props {
  onSearch?: () => void // callback al navegar (ej: cerrar menú móvil)
}

export default function BuscadorAutocomplete({ onSearch }: Props) {
  const router  = useRouter()
  const wrapRef = useRef<HTMLDivElement>(null)

  const [valor,      setValor]      = useState('')
  const [debouncedQ, setDebouncedQ] = useState('')
  const [abierto,    setAbierto]    = useState(false)

  // Debounce 300 ms
  useEffect(() => {
    const t = setTimeout(() => setDebouncedQ(valor.trim()), 300)
    return () => clearTimeout(t)
  }, [valor])

  // Abrir dropdown cuando hay texto suficiente
  useEffect(() => {
    setAbierto(debouncedQ.length >= 2)
  }, [debouncedQ])

  // Cerrar al hacer click fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (wrapRef.current && !wrapRef.current.contains(e.target as Node)) {
        setAbierto(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const { data, isFetching } = useQuery({
    queryKey: ['autocomplete', debouncedQ],
    queryFn:  () => tiendaApi.productos.buscar(debouncedQ),
    enabled:  debouncedQ.length >= 2,
    staleTime: 1000 * 30,
  })

  const sugerencias = data?.productos ?? []

  const irABusqueda = () => {
    const q = valor.trim()
    if (!q) return
    setAbierto(false)
    router.push(`/productos?search=${encodeURIComponent(q)}`)
    onSearch?.()
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    irABusqueda()
  }

  const handleSeleccionar = (href: string) => {
    setAbierto(false)
    setValor('')
    router.push(href)
    onSearch?.()
  }

  const handleLimpiar = () => {
    setValor('')
    setDebouncedQ('')
    setAbierto(false)
  }

  return (
    <div ref={wrapRef} className="relative w-full">

      {/* Input */}
      <form onSubmit={handleSubmit} className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
        <input
          type="text"
          value={valor}
          onChange={(e) => setValor(e.target.value)}
          onFocus={() => debouncedQ.length >= 2 && setAbierto(true)}
          onKeyDown={(e) => e.key === 'Escape' && setAbierto(false)}
          placeholder="Buscar productos..."
          className="w-full pl-9 pr-8 py-2 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:bg-white transition-colors"
        />
        {valor && (
          <button
            type="button"
            onClick={handleLimpiar}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-3.5 h-3.5" />
          </button>
        )}
      </form>

      {/* Dropdown */}
      {abierto && (
        <div className="absolute top-full mt-1.5 left-0 right-0 bg-white rounded-xl border border-gray-200 shadow-xl z-50 overflow-hidden">

          {/* Cargando */}
          {isFetching && sugerencias.length === 0 && (
            <div className="px-4 py-3 text-sm text-gray-400">Buscando...</div>
          )}

          {/* Sin resultados */}
          {!isFetching && sugerencias.length === 0 && (
            <div className="px-4 py-3 text-sm text-gray-500">
              Sin resultados para <strong>"{debouncedQ}"</strong>
            </div>
          )}

          {/* Resultados */}
          {sugerencias.map((p) => {
            const href = `/productos/${toSlug(p.nombre, p.id)}`
            return (
              <button
                key={p.id}
                onClick={() => handleSeleccionar(href)}
                className="w-full flex items-center gap-3 px-3 py-2.5 hover:bg-gray-50 transition-colors text-left border-b border-gray-50 last:border-0"
              >
                {/* Imagen */}
                <div className="relative w-11 h-11 rounded-lg overflow-hidden bg-gray-100 shrink-0">
                  {p.imagen_principal ? (
                    <Image
                      src={p.imagen_principal}
                      alt={p.nombre}
                      fill
                      className="object-cover"
                      sizes="44px"
                    />
                  ) : null}
                </div>

                {/* Nombre + marca */}
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-800 truncate leading-tight">
                    {nombreConColor(p.nombre, p.color)}
                  </p>
                  {p.marca && (
                    <p className="text-xs text-gray-400 mt-0.5">{p.marca}</p>
                  )}
                </div>

                {/* Precio */}
                <span className={`text-sm font-bold shrink-0 ${p.en_oferta ? 'text-green-600' : 'text-gray-800'}`}>
                  {formatPrecio(p.precio_final)}
                </span>
              </button>
            )
          })}

          {/* Ver todos */}
          {sugerencias.length > 0 && (
            <button
              onClick={irABusqueda}
              className="w-full px-4 py-2.5 text-xs font-semibold text-green-600 hover:bg-green-50 border-t border-gray-100 transition-colors text-center"
            >
              Ver todos los resultados para "{debouncedQ}"
            </button>
          )}
        </div>
      )}
    </div>
  )
}