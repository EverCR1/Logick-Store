'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ShoppingCart, Plus, Minus, Star } from 'lucide-react'
import { Producto } from '@/types/producto'
import { useCarrito } from '@/store/carrito'
import { useFavorito } from '@/hooks/useFavorito'
import { formatPrecio, calcularDescuento, toSlug, nombreConColor } from '@/lib/utils'

interface Props {
  producto: Producto
}

export default function ProductoCard({ producto }: Props) {
  const agregar            = useCarrito((s) => s.agregar)
  const actualizarCantidad = useCarrito((s) => s.actualizarCantidad)
  const items              = useCarrito((s) => s.items)

  const agotado = !producto.disponible
  const href    = `/productos/${toSlug(producto.nombre, producto.id)}`

  const { esFavorito, toggle: toggleFav, isPending: favPending, autenticado } = useFavorito(producto.id)

  const [animando, setAnimando] = useState(false)
  const handleFav = (e: React.MouseEvent) => {
    e.preventDefault()
    if (favPending) return
    setAnimando(false)
    requestAnimationFrame(() => {
      requestAnimationFrame(() => setAnimando(true))
    })
    toggleFav()
  }

  // Evitar hydration mismatch con el carrito (localStorage)
  const [montado, setMontado] = useState(false)
  useEffect(() => setMontado(true), [])

  const itemEnCarrito = montado ? items.find((i) => i.id === producto.id) : undefined
  const cantidad      = itemEnCarrito?.cantidad ?? 0
  const enTope        = cantidad >= producto.stock

  return (
    <div className={`group flex flex-col rounded-2xl overflow-hidden transition-all duration-200 ${
      agotado
        ? 'bg-gray-50 opacity-70'
        : 'bg-white hover:shadow-lg hover:-translate-y-0.5'
    } shadow-sm`}>

      {/* Imagen */}
      <Link href={href} className="relative block aspect-square overflow-hidden bg-gray-100">
        {producto.imagen_principal ? (
          <Image
            src={producto.imagen_principal}
            alt={producto.nombre}
            fill
            className={`object-cover transition-transform duration-300 ${
              agotado ? 'grayscale' : 'group-hover:scale-105'
            }`}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">
            Sin imagen
          </div>
        )}

        {/* Badges */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5">
          {producto.en_oferta && !agotado && (
            <span className="bg-red-500 text-white text-[11px] font-bold px-2 py-0.5 rounded-full leading-tight">
              -{calcularDescuento(producto.precio_venta, producto.precio_oferta!)}
            </span>
          )}
          {agotado && (
            <span className="bg-gray-700 text-white text-[11px] font-semibold px-2 py-0.5 rounded-full leading-tight">
              Agotado
            </span>
          )}
        </div>

        {/* Botón favorito */}
        {autenticado && (
          <button
            type="button"
            onClick={handleFav}
            disabled={favPending}
            onAnimationEnd={() => setAnimando(false)}
            className={`group/fav absolute top-2 right-2 w-7 h-7 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center shadow-sm hover:bg-white hover:shadow-[0_0_0_3px_rgba(250,204,21,0.35)] hover:scale-110 transition-all duration-150 disabled:opacity-60 ${animando ? 'animate-fav-pop' : ''}`}
          >
            <Star className={`w-3.5 h-3.5 transition-all duration-150 ${
              esFavorito
                ? 'fill-yellow-400 text-yellow-400'
                : 'text-gray-300 group-hover/fav:text-yellow-500 group-hover/fav:fill-yellow-300 group-hover/fav:scale-110'
            }`} />
          </button>
        )}
      </Link>

      {/* Info */}
      <div className="flex flex-col flex-1 px-3.5 py-3 gap-1.5">
        {producto.marca && (
          <span className="text-[11px] font-semibold uppercase tracking-widest text-gray-400">
            {producto.marca}
          </span>
        )}

        <Link
          href={href}
          className={`text-[13px] font-medium line-clamp-2 leading-snug ${
            agotado ? 'text-gray-400' : 'text-gray-800 hover:text-green-600'
          }`}
        >
          {nombreConColor(producto.nombre, producto.color)}
        </Link>

        {/* Precio */}
        <div className="mt-auto pt-2">
          {producto.en_oferta && !agotado ? (
            <div className="flex items-baseline gap-2">
              <span className="text-base font-bold text-green-600">
                {formatPrecio(producto.precio_oferta!)}
              </span>
              <span className="text-xs text-gray-400 line-through">
                {formatPrecio(producto.precio_venta)}
              </span>
            </div>
          ) : (
            <span className={`text-base font-bold ${agotado ? 'text-gray-400' : 'text-gray-900'}`}>
              {formatPrecio(producto.precio_venta)}
            </span>
          )}
        </div>

        {/* Botón / Controles carrito */}
        <div className="mt-2">
          {agotado ? (
            <div className="w-full flex items-center justify-center py-2 rounded-xl bg-gray-100 text-gray-400 text-[13px] font-semibold">
              Sin stock
            </div>
          ) : cantidad > 0 ? (
            /* Controles +/− cuando ya está en carrito */
            <div className="flex flex-col gap-1">
              <div className="flex items-center justify-between border-2 border-green-500 rounded-xl overflow-hidden">
                <button
                  onClick={() => actualizarCantidad(producto.id, cantidad - 1)}
                  className="px-3 py-2 text-green-600 hover:bg-green-50 transition-colors active:bg-green-100"
                >
                  <Minus className="w-3.5 h-3.5" />
                </button>
                <span className="text-sm font-bold text-green-700 min-w-[1.5rem] text-center">
                  {cantidad}
                </span>
                <button
                  onClick={() => actualizarCantidad(producto.id, cantidad + 1)}
                  disabled={enTope}
                  className="px-3 py-2 text-green-600 hover:bg-green-50 transition-colors active:bg-green-100 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <Plus className="w-3.5 h-3.5" />
                </button>
              </div>
              {enTope && (
                <p className="text-[11px] text-amber-600 text-center">Máximo disponible</p>
              )}
            </div>
          ) : (
            /* Botón agregar inicial */
            <button
              onClick={() => agregar(producto)}
              className="w-full flex items-center justify-center gap-1.5 text-[13px] font-semibold py-2 rounded-xl bg-green-600 hover:bg-green-700 active:bg-green-800 text-white transition-colors"
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              Agregar
            </button>
          )}
        </div>
      </div>
    </div>
  )
}