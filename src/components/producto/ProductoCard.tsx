'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ShoppingCart } from 'lucide-react'
import { Producto } from '@/types/producto'
import { useCarrito } from '@/store/carrito'
import { formatPrecio, calcularDescuento } from '@/lib/utils'

interface Props {
  producto: Producto
}

export default function ProductoCard({ producto }: Props) {
  const agregar = useCarrito((s) => s.agregar)

  const agotado = !producto.disponible

  return (
    <div className={`rounded-xl border shadow-sm flex flex-col group transition-shadow ${
      agotado
        ? 'bg-gray-50 border-gray-200 opacity-75'
        : 'bg-white border-gray-100 hover:shadow-md'
    }`}>

      {/* Imagen */}
      <Link href={`/productos/${producto.id}`} className="relative block aspect-square overflow-hidden rounded-t-xl bg-gray-100">
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
          <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">
            Sin imagen
          </div>
        )}

        {/* Badge agotado */}
        {agotado && (
          <div className="absolute inset-0 flex items-end justify-center pb-3 rounded-t-xl">
            <span className="bg-gray-800/80 text-white text-xs font-semibold px-3 py-1 rounded-full">
              Agotado
            </span>
          </div>
        )}

        {/* Badge oferta */}
        {producto.en_oferta && !agotado && (
          <span className="absolute top-2 left-2 bg-red-500 text-white text-xs font-bold px-2 py-0.5 rounded-full">
            -{calcularDescuento(producto.precio_venta, producto.precio_oferta!)}
          </span>
        )}
      </Link>

      {/* Info */}
      <div className="flex flex-col flex-1 p-3 gap-2">
        {producto.marca && (
          <span className={`text-xs uppercase tracking-wide ${agotado ? 'text-gray-300' : 'text-gray-400'}`}>
            {producto.marca}
          </span>
        )}

        <Link
          href={`/productos/${producto.id}`}
          className={`text-sm font-medium line-clamp-2 leading-snug ${
            agotado ? 'text-gray-400' : 'text-gray-800 hover:text-green-600'
          }`}
        >
          {producto.nombre}
        </Link>

        {/* Precio */}
        <div className="mt-auto">
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

        {/* Botón */}
        <button
          onClick={() => !agotado && agregar(producto)}
          disabled={agotado}
          className={`mt-2 w-full flex items-center justify-center gap-2 text-sm font-medium py-2 rounded-lg transition-colors ${
            agotado
              ? 'bg-gray-200 text-gray-400 cursor-not-allowed'
              : 'bg-green-600 hover:bg-green-700 text-white'
          }`}
        >
          <ShoppingCart className="w-4 h-4" />
          {agotado ? 'Sin stock' : 'Agregar al carrito'}
        </button>
      </div>
    </div>
  )
}