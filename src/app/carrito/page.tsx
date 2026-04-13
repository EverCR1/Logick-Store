'use client'

import Image from 'next/image'
import Link from 'next/link'
import { Trash2, ShoppingBag, ChevronLeft, Plus, Minus } from 'lucide-react'
import { useCarrito } from '@/store/carrito'
import { formatPrecio, toSlug } from '@/lib/utils'

export default function CarritoPage() {
  const { items, quitar, actualizarCantidad, vaciar, total } = useCarrito()

  if (items.length === 0) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 flex flex-col items-center gap-5 text-center">
        <div className="w-20 h-20 rounded-full bg-gray-100 flex items-center justify-center">
          <ShoppingBag className="w-9 h-9 text-gray-400" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-gray-800">Tu carrito está vacío</h1>
          <p className="text-sm text-gray-500 mt-1">Agrega productos para continuar</p>
        </div>
        <Link
          href="/productos"
          className="mt-2 inline-flex items-center gap-2 bg-green-600 hover:bg-green-700 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
        >
          <ChevronLeft className="w-4 h-4" />
          Ver productos
        </Link>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Encabezado */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Carrito</h1>
          <p className="text-sm text-gray-500 mt-0.5">
            {items.reduce((s, i) => s + i.cantidad, 0)} producto{items.reduce((s, i) => s + i.cantidad, 0) !== 1 ? 's' : ''}
          </p>
        </div>
        <button
          onClick={vaciar}
          className="text-xs text-gray-400 hover:text-red-500 transition-colors flex items-center gap-1"
        >
          <Trash2 className="w-3.5 h-3.5" />
          Vaciar carrito
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

        {/* Lista de items */}
        <div className="lg:col-span-2 flex flex-col gap-3">
          {items.map((item) => (
            <div key={item.id} className="flex gap-4 bg-white rounded-2xl p-4 shadow-sm">

              {/* Imagen */}
              <Link href={`/productos/${toSlug(item.nombre, item.id)}`} className="relative w-20 h-20 shrink-0 rounded-xl overflow-hidden bg-gray-100">
                {item.imagen ? (
                  <Image src={item.imagen} alt={item.nombre} fill className="object-cover" sizes="80px" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 text-xs">Sin img</div>
                )}
              </Link>

              {/* Info */}
              <div className="flex flex-col flex-1 min-w-0 gap-1">
                <Link
                  href={`/productos/${toSlug(item.nombre, item.id)}`}
                  className="text-sm font-medium text-gray-800 hover:text-green-600 line-clamp-2 leading-snug transition-colors"
                >
                  {item.nombre}
                </Link>
                <span className="text-sm font-bold text-green-600">
                  {formatPrecio(item.precio)}
                </span>

                {/* Controles cantidad */}
                <div className="flex items-center justify-between mt-auto pt-1">
                  <div className="flex flex-col gap-1">
                    <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden">
                      <button
                        onClick={() => actualizarCantidad(item.id, item.cantidad - 1)}
                        className="px-2.5 py-1.5 text-gray-500 hover:bg-gray-50 transition-colors"
                      >
                        <Minus className="w-3.5 h-3.5" />
                      </button>
                      <span className="px-3 py-1.5 text-sm font-semibold text-gray-800 min-w-[2rem] text-center">
                        {item.cantidad}
                      </span>
                      <button
                        onClick={() => actualizarCantidad(item.id, item.cantidad + 1)}
                        disabled={item.cantidad >= item.stock}
                        className="px-2.5 py-1.5 text-gray-500 hover:bg-gray-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                    {item.cantidad >= item.stock && (
                      <p className="text-[11px] text-amber-600">Máximo disponible</p>
                    )}
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-gray-700">
                      {formatPrecio(item.precio * item.cantidad)}
                    </span>
                    <button
                      onClick={() => quitar(item.id)}
                      className="text-gray-300 hover:text-red-400 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Resumen del pedido */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24 flex flex-col gap-4">
            <h2 className="font-bold text-gray-900 text-lg">Resumen</h2>

            {/* Desglose */}
            <div className="flex flex-col gap-2 text-sm text-gray-600 border-b border-gray-100 pb-4">
              {items.map((item) => (
                <div key={item.id} className="flex justify-between gap-2">
                  <span className="line-clamp-1 flex-1 text-gray-500">{item.nombre} ×{item.cantidad}</span>
                  <span className="shrink-0 font-medium text-gray-700">{formatPrecio(item.precio * item.cantidad)}</span>
                </div>
              ))}
            </div>

            {/* Total */}
            <div className="flex justify-between items-center">
              <span className="font-bold text-gray-900">Total</span>
              <span className="text-xl font-bold text-green-600">{formatPrecio(total())}</span>
            </div>

            {/* Botón pedido */}
            <Link
              href="/checkout"
              className="w-full bg-green-600 hover:bg-green-700 active:scale-95 text-white font-semibold py-3 rounded-xl transition-all text-sm text-center block"
            >
              Realizar pedido
            </Link>

            <Link
              href="/productos"
              className="text-center text-sm text-gray-400 hover:text-green-600 transition-colors"
            >
              ← Seguir comprando
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}