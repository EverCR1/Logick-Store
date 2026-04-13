'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect } from 'react'
import { ShoppingCart, ChevronLeft, Check, Shield, Plus, Minus, Star } from 'lucide-react'
import { Producto, ImagenProducto } from '@/types/producto'
import { useCarrito } from '@/store/carrito'
import { useFavorito } from '@/hooks/useFavorito'
import { formatPrecio, calcularDescuento, toSlug, nombreConColor } from '@/lib/utils'
import ResenasPreguntasSection from './ResenasPreguntasSection'

interface Props {
  producto: Producto
}

export default function DetalleCliente({ producto }: Props) {
  const agregar            = useCarrito((s) => s.agregar)
  const actualizarCantidad = useCarrito((s) => s.actualizarCantidad)
  const items              = useCarrito((s) => s.items)
  const agotado            = !producto.disponible

  const { esFavorito, toggle: toggleFav, isPending: favPending, autenticado } = useFavorito(producto.id)

  // Hydration safe — carrito viene de localStorage
  const [montado, setMontado] = useState(false)
  useEffect(() => setMontado(true), [])

  const itemEnCarrito     = montado ? items.find((i) => i.id === producto.id) : undefined
  const cantidadEnCarrito = itemEnCarrito?.cantidad ?? 0
  const enTope            = cantidadEnCarrito >= producto.stock

  // Galería
  const imagenes: ImagenProducto[] = producto.imagenes ?? []
  const [imgActiva, setImgActiva]   = useState<string | null>(
    producto.imagen_principal ?? (imagenes[0]?.url_medium ?? imagenes[0]?.url ?? null)
  )
  const [agregado, setAgregado] = useState(false)

  const handleAgregar = () => {
    if (agotado) return
    agregar(producto)
    setAgregado(true)
    setTimeout(() => setAgregado(false), 2000)
  }

  // Imágenes para miniaturas (sin duplicar la activa al inicio)
  const miniaturas = imagenes.length > 0
    ? imagenes
    : producto.imagen_principal
      ? [{ id: 0, url: producto.imagen_principal, url_thumb: producto.imagen_principal, url_medium: producto.imagen_principal, es_principal: true }]
      : []

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Breadcrumb */}
      <nav className="flex items-center flex-wrap gap-1.5 text-sm text-gray-400 mb-6">
        <Link href="/productos" className="hover:text-green-600 transition-colors">Productos</Link>
        {producto.categorias?.map((cat) => (
          <span key={cat.id} className="contents">
            <span>/</span>
            <Link
              href={`/productos?categoria=${toSlug(cat.nombre, cat.id)}`}
              className="hover:text-green-600 transition-colors"
            >
              {cat.nombre}
            </Link>
          </span>
        ))}
        <span>/</span>
        <span className="text-gray-700 line-clamp-1">{producto.nombre}</span>
      </nav>

      {/* Botón volver móvil */}
      <Link
        href="/productos"
        className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-green-600 mb-6 transition-colors md:hidden"
      >
        <ChevronLeft className="w-4 h-4" />
        Volver al catálogo
      </Link>

      {/* Layout principal */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-16">

        {/* ── Columna izquierda: galería ── */}
        <div className="flex flex-col gap-3">
          {/* Imagen principal */}
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-gray-100">
            {imgActiva ? (
              <Image
                src={imgActiva}
                alt={producto.nombre}
                fill
                className={`object-cover transition-all duration-300 ${agotado ? 'grayscale' : ''}`}
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">
                Sin imagen
              </div>
            )}

            {agotado && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                <span className="bg-gray-800/80 text-white text-sm font-semibold px-4 py-2 rounded-full">
                  Agotado
                </span>
              </div>
            )}

            {producto.en_oferta && !agotado && (
              <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                -{calcularDescuento(producto.precio_venta, producto.precio_oferta!)} DCTO
              </span>
            )}
          </div>

          {/* Miniaturas */}
          {miniaturas.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {miniaturas.map((img) => {
                const src = img.url_thumb ?? img.url_medium ?? img.url
                const isActiva = imgActiva === (img.url_medium ?? img.url)
                return (
                  <button
                    key={img.id}
                    onClick={() => setImgActiva(img.url_medium ?? img.url)}
                    className={`relative shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 transition-all ${
                      isActiva ? 'border-green-500 opacity-100' : 'border-transparent opacity-60 hover:opacity-90'
                    }`}
                  >
                    <Image src={src} alt="" fill className="object-cover" sizes="64px" />
                  </button>
                )
              })}
            </div>
          )}
        </div>

        {/* ── Columna derecha: info ── */}
        <div className="flex flex-col gap-5">

          {/* Nombre */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight">
              {nombreConColor(producto.nombre, producto.color)}
            </h1>
            {producto.marca && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Marca:</span>
                <span className="text-xs font-bold text-green-700 bg-green-50 px-2.5 py-1 rounded-full">
                  {producto.marca}
                </span>
              </div>
            )}
          </div>

          {/* Precio */}
          <div className="flex items-baseline gap-3">
            {producto.en_oferta && producto.precio_oferta ? (
              <>
                <span className="text-3xl font-bold text-green-600">
                  {formatPrecio(producto.precio_oferta)}
                </span>
                <span className="text-lg text-gray-400 line-through">
                  {formatPrecio(producto.precio_venta)}
                </span>
                <span className="text-sm font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                  Ahorras {formatPrecio(producto.precio_venta - producto.precio_oferta)}
                </span>
              </>
            ) : (
              <span className={`text-3xl font-bold ${agotado ? 'text-gray-400' : 'text-gray-900'}`}>
                {formatPrecio(producto.precio_venta)}
              </span>
            )}
          </div>

          {/* Disponibilidad */}
          <div className={`flex items-center gap-2 text-sm font-medium ${agotado ? 'text-red-500' : 'text-green-600'}`}>
            <div className={`w-2 h-2 rounded-full ${agotado ? 'bg-red-400' : 'bg-green-500'}`} />
            {agotado ? 'Sin stock disponible' : 'En stock'}
          </div>

          {/* Controles carrito + favorito */}
          <div className="flex flex-col gap-3">
            {!agotado && (
              <div className="flex items-center gap-3">
                {cantidadEnCarrito > 0 ? (
                  /* Ya está en carrito — controles +/− */
                  <>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center border-2 border-green-500 rounded-xl overflow-hidden">
                        <button
                          onClick={() => actualizarCantidad(producto.id, cantidadEnCarrito - 1)}
                          className="px-4 py-2.5 text-green-600 hover:bg-green-50 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-4 py-2.5 text-sm font-bold text-green-700 min-w-[3rem] text-center">
                          {cantidadEnCarrito}
                        </span>
                        <button
                          onClick={() => actualizarCantidad(producto.id, cantidadEnCarrito + 1)}
                          disabled={enTope}
                          className="px-4 py-2.5 text-green-600 hover:bg-green-50 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                        >
                          <Plus className="w-4 h-4" />
                        </button>
                      </div>
                      {enTope && (
                        <p className="text-xs text-amber-600 text-center">Máximo disponible en stock</p>
                      )}
                    </div>
                    <span className="text-sm text-green-600 font-medium flex items-center gap-1.5">
                      <Check className="w-4 h-4" />
                      En tu carrito
                    </span>
                  </>
                ) : (
                  /* Aún no está en carrito */
                  <button
                    onClick={handleAgregar}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-sm transition-all ${
                      agregado
                        ? 'bg-green-700 text-white'
                        : 'bg-green-600 hover:bg-green-700 active:scale-95 text-white'
                    }`}
                  >
                    {agregado ? (
                      <>
                        <Check className="w-4 h-4" />
                        Agregado al carrito
                      </>
                    ) : (
                      <>
                        <ShoppingCart className="w-4 h-4" />
                        Agregar al carrito
                      </>
                    )}
                  </button>
                )}

                {/* Botón favorito */}
                {autenticado && (
                  <button
                    type="button"
                    onClick={toggleFav}
                    disabled={favPending}
                    title={esFavorito ? 'Quitar de favoritos' : 'Agregar a favoritos'}
                    className={`w-12 h-12 rounded-xl border-2 flex items-center justify-center transition-all disabled:opacity-60 shrink-0 ${
                      esFavorito
                        ? 'border-yellow-300 bg-yellow-50 hover:bg-yellow-100'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <Star className={`w-5 h-5 transition-colors ${esFavorito ? 'fill-yellow-400 text-yellow-400' : 'text-gray-400'}`} />
                  </button>
                )}
              </div>
            )}

            {/* Favorito cuando está agotado */}
            {agotado && autenticado && (
              <button
                type="button"
                onClick={toggleFav}
                disabled={favPending}
                className={`flex items-center gap-2 py-2.5 px-4 rounded-xl border-2 text-sm font-medium transition-all self-start disabled:opacity-60 ${
                  esFavorito
                    ? 'border-yellow-300 bg-yellow-50 text-yellow-600 hover:bg-yellow-100'
                    : 'border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50'
                }`}
              >
                <Star className={`w-4 h-4 ${esFavorito ? 'fill-yellow-400 text-yellow-400' : ''}`} />
                {esFavorito ? 'En favoritos' : 'Guardar en favoritos'}
              </button>
            )}
          </div>

          {/* Garantía */}
          <div className="flex items-center gap-2.5 text-sm text-gray-600 bg-gray-50 rounded-xl px-4 py-3">
            <Shield className="w-4 h-4 text-green-600 shrink-0" />
            <span>Garantía: <strong>{producto.garantia ?? 'Sin garantía'}</strong></span>
          </div>

          {/* Variantes de color */}
          {(producto.variantes_color?.length ?? 0) > 0 && (
            <div className="flex flex-col gap-2">
              <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                Color: <span className="text-gray-800 normal-case font-bold">{producto.color}</span>
              </p>
              <div className="flex flex-wrap gap-2">
                {/* Color actual — seleccionado */}
                <div className="relative w-14 h-14 rounded-xl overflow-hidden border-2 border-green-500 ring-2 ring-green-200 shrink-0">
                  {producto.imagen_principal && (
                    <Image src={producto.imagen_principal} alt={producto.color ?? ''} fill className="object-cover" sizes="56px" />
                  )}
                </div>
                {/* Otras variantes */}
                {producto.variantes_color!.map((v) => (
                  <Link
                    key={v.id}
                    href={`/productos/${toSlug(producto.nombre, v.id)}`}
                    title={v.color ?? ''}
                    className="relative w-14 h-14 rounded-xl overflow-hidden border-2 border-transparent hover:border-gray-300 opacity-70 hover:opacity-100 transition-all shrink-0"
                  >
                    {v.imagen_principal && (
                      <Image src={v.imagen_principal} alt={v.color ?? ''} fill className="object-cover" sizes="56px" />
                    )}
                    {!v.imagen_principal && (
                      <div className="w-full h-full bg-gray-100 flex items-center justify-center text-[10px] text-gray-400 text-center px-1">
                        {v.color}
                      </div>
                    )}
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Color sin variantes */}
          {(producto.variantes_color?.length ?? 0) === 0 && producto.color && (
            <p className="text-sm text-gray-600">
              Color: <strong className="text-gray-800">{producto.color}</strong>
            </p>
          )}

          {/* Descripción */}
          {producto.descripcion && (
            <div className="border-t border-gray-100 pt-5">
              <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">Descripción</h2>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {producto.descripcion}
              </p>
            </div>
          )}

          {/* Especificaciones */}
          {producto.especificaciones && (
            <div className="border-t border-gray-100 pt-5">
              <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">Especificaciones</h2>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {producto.especificaciones}
              </p>
            </div>
          )}
        </div>
      </div>

      <ResenasPreguntasSection productoId={producto.id} />
    </div>
  )
}