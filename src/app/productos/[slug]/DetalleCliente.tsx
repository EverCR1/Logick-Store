'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useState, useEffect, useCallback, useRef } from 'react'
import { ShoppingCart, ChevronLeft, Check, Shield, Plus, Minus, Star, ZoomIn, X, ChevronRight } from 'lucide-react'
import { Producto, ImagenProducto, Atributo } from '@/types/producto'
import { useCarrito } from '@/store/carrito'
import { useFavorito } from '@/hooks/useFavorito'
import { formatPrecio, calcularDescuento, toSlug, nombreConColor } from '@/lib/utils'
import ResenasPreguntasSection from './ResenasPreguntasSection'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'https://api.logickem.com/api'

interface Props {
  producto: Producto
}

export default function DetalleCliente({ producto: productoInicial }: Props) {
  // ── Estado activo — se actualiza al cambiar variante ────────────────────────
  const [pa, setPa] = useState<Producto>(productoInicial)
  const paRef = useRef(pa)
  useEffect(() => { paRef.current = pa }, [pa])

  const agregar            = useCarrito((s) => s.agregar)
  const actualizarCantidad = useCarrito((s) => s.actualizarCantidad)
  const items              = useCarrito((s) => s.items)
  const agotado            = !pa.disponible

  const { esFavorito, toggle: toggleFav, isPending: favPending, autenticado } = useFavorito(pa.id)

  // Hydration safe
  const [montado, setMontado] = useState(false)
  useEffect(() => setMontado(true), [])

  const itemEnCarrito     = montado ? items.find((i) => i.id === pa.id) : undefined
  const cantidadEnCarrito = itemEnCarrito?.cantidad ?? 0
  const enTope            = cantidadEnCarrito >= pa.stock

  // ── Galería ─────────────────────────────────────────────────────────────────
  const imagenes: ImagenProducto[] = pa.imagenes ?? []

  const [imgActiva, setImgActiva]   = useState<string | null>(
    pa.imagen_principal ?? (imagenes[0]?.url_medium ?? imagenes[0]?.url ?? null)
  )
  // Crossfade: montamos/desmontamos la imagen con una key que cambia al variar la URL
  const [imgKey, setImgKey] = useState(0)

  const [agregado, setAgregado] = useState(false)

  // ── Lightbox ─────────────────────────────────────────────────────────────────
  const [lightbox, setLightbox] = useState(false)
  const [lbIdx, setLbIdx]       = useState(0)

  // Fuentes de alta calidad para el lightbox (url original, sin resize de thumbnail)
  const lbImagenes = imagenes.length > 0
    ? imagenes
    : pa.imagen_principal
      ? [{ id: 0, url: pa.imagen_principal, url_thumb: pa.imagen_principal, url_medium: pa.imagen_principal, es_principal: true }]
      : []
  const lbTotal    = lbImagenes.length

  const abrirLightbox = (idx = 0) => { setLbIdx(idx); setLightbox(true) }
  const cerrarLightbox = () => setLightbox(false)
  const lbAnterior = () => setLbIdx(i => (i - 1 + lbTotal) % lbTotal)
  const lbSiguiente = () => setLbIdx(i => (i + 1) % lbTotal)

  useEffect(() => {
    if (!lightbox) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape')      cerrarLightbox()
      if (e.key === 'ArrowLeft')   lbAnterior()
      if (e.key === 'ArrowRight')  lbSiguiente()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [lightbox, lbTotal])

  const handleAgregar = () => {
    if (agotado) return
    agregar(pa)
    setAgregado(true)
    setTimeout(() => setAgregado(false), 2000)
  }

  const miniaturas = imagenes.length > 0
    ? imagenes
    : pa.imagen_principal
      ? [{ id: 0, url: pa.imagen_principal, url_thumb: pa.imagen_principal, url_medium: pa.imagen_principal, es_principal: true }]
      : []

  // ── Cambio de variante — sin navegación ─────────────────────────────────────
  // Creado una sola vez — lee pa siempre a través del ref, sin stale closures
  const switchVariante = useCallback(async (
    varianteId: number,
    parcial: {
      color: string | null
      atributos: Atributo[]
      precio_venta: number
      precio_oferta: number | null
      en_oferta: boolean
      imagen_principal: string | null
    }
  ) => {
    const current = paRef.current
    if (varianteId === current.id) return

    // Lista completa del grupo leída del ref — siempre fresca
    const todosActuales = [
      {
        id:               current.id,
        color:            current.color,
        atributos:        current.atributos ?? [],
        imagen_principal: current.imagen_principal,
        precio_venta:     current.precio_venta,
        precio_oferta:    current.precio_oferta,
        en_oferta:        current.en_oferta,
      },
      ...(current.variantes ?? []),
    ]
    const nuevasVariantes = todosActuales.filter(v => v.id !== varianteId)

    // 1. Swap visual instantáneo
    const nuevaImg = parcial.imagen_principal ?? null
    setPa(prev => ({
      ...prev,
      id:               varianteId,
      color:            parcial.color,
      atributos:        parcial.atributos,
      precio_venta:     parcial.precio_venta,
      precio_oferta:    parcial.precio_oferta,
      en_oferta:        parcial.en_oferta,
      imagen_principal: nuevaImg,
      imagenes:         nuevaImg
        ? [{ id: 0, url: nuevaImg, url_thumb: nuevaImg, url_medium: nuevaImg, es_principal: true }]
        : prev.imagenes,
      disponible:       true,
      variantes:        nuevasVariantes,
    }))
    setImgActiva(nuevaImg)
    setImgKey(k => k + 1)

    // 2. Solo actualiza la URL bar — sin disparar ningún re-render de Next.js
    window.history.replaceState(null, '', `/productos/${toSlug(productoInicial.nombre, varianteId)}`)

    // 3. Fetch en background — solo campos no disponibles en el swap inicial
    try {
      const res = await fetch(`${API_URL}/tienda/productos/${varianteId}`, {
        headers: { Accept: 'application/json' },
      })
      if (res.ok) {
        const data = await res.json()
        if (data.success && data.producto) {
          const full = data.producto as Producto
          setPa(prev => ({
            ...prev,
            stock:            full.stock,
            disponible:       full.disponible,
            garantia:         full.garantia,
            descripcion:      full.descripcion,
            especificaciones: full.especificaciones,
            marca:            full.marca,
            categorias:       full.categorias,
            imagenes:         (full.imagenes?.length ?? 0) > 1 ? full.imagenes : prev.imagenes,
            imagen_principal: full.imagen_principal ?? prev.imagen_principal,
          }))
        }
      }
    } catch {
      // datos parciales ya visibles; fallo silencioso
    }
  }, [productoInicial.nombre])

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Breadcrumb */}
      <nav className="flex items-center flex-wrap gap-1.5 text-sm text-gray-400 mb-6">
        <Link href="/productos" className="hover:text-green-600 transition-colors">Productos</Link>
        {pa.categorias?.map((cat) => (
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
        <span className="text-gray-700 line-clamp-1">{pa.nombre}</span>
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
          <div
            className={`relative aspect-square w-full rounded-2xl overflow-hidden bg-gray-100 group ${imgActiva ? 'cursor-zoom-in' : ''}`}
            onClick={() => {
              if (!imgActiva) return
              const idx = lbImagenes.findIndex(img => img.url === imgActiva || (img.url_medium ?? img.url) === imgActiva)
              abrirLightbox(idx >= 0 ? idx : 0)
            }}
          >
            {imgActiva ? (
              <Image
                key={imgKey}
                src={imgActiva}
                alt={pa.nombre}
                fill
                className={`object-cover animate-fade-in ${agotado ? 'grayscale' : ''}`}
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-gray-300 text-sm">
                Sin imagen
              </div>
            )}

            {/* Hint de zoom */}
            {imgActiva && (
              <div className="absolute bottom-3 right-3 bg-black/40 text-white rounded-full p-1.5 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                <ZoomIn className="w-4 h-4" />
              </div>
            )}

            {agotado && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/10">
                <span className="bg-gray-800/80 text-white text-sm font-semibold px-4 py-2 rounded-full">
                  Agotado
                </span>
              </div>
            )}

            {pa.en_oferta && !agotado && (
              <span className="absolute top-3 left-3 bg-red-500 text-white text-xs font-bold px-2.5 py-1 rounded-full">
                -{calcularDescuento(pa.precio_venta, pa.precio_oferta!)} DCTO
              </span>
            )}
          </div>

          {/* Miniaturas */}
          {miniaturas.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {miniaturas.map((img) => {
                const src     = img.url_thumb ?? img.url_medium ?? img.url
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
              {nombreConColor(pa.nombre, pa.color)}
            </h1>
            {pa.marca && (
              <div className="flex items-center gap-2 mt-2">
                <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Marca:</span>
                <Link
                  href={`/productos?marca=${encodeURIComponent(pa.marca)}`}
                  className="text-xs font-bold text-green-700 bg-green-50 hover:bg-green-100 px-2.5 py-1 rounded-full transition-colors"
                >
                  {pa.marca}
                </Link>
              </div>
            )}
          </div>

          {/* Precio */}
          <div className="flex items-baseline gap-3">
            {pa.en_oferta && pa.precio_oferta ? (
              <>
                <span className="text-3xl font-bold text-green-600">
                  {formatPrecio(pa.precio_oferta)}
                </span>
                <span className="text-lg text-gray-400 line-through">
                  {formatPrecio(pa.precio_venta)}
                </span>
                <span className="text-sm font-semibold text-red-500 bg-red-50 px-2 py-0.5 rounded-full">
                  Ahorras {formatPrecio(pa.precio_venta - pa.precio_oferta)}
                </span>
              </>
            ) : (
              <span className={`text-3xl font-bold ${agotado ? 'text-gray-400' : 'text-gray-900'}`}>
                {formatPrecio(pa.precio_venta)}
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
                  <>
                    <div className="flex flex-col gap-1">
                      <div className="flex items-center border-2 border-green-500 rounded-xl overflow-hidden">
                        <button
                          onClick={() => actualizarCantidad(pa.id, cantidadEnCarrito - 1)}
                          className="px-4 py-2.5 text-green-600 hover:bg-green-50 transition-colors"
                        >
                          <Minus className="w-4 h-4" />
                        </button>
                        <span className="px-4 py-2.5 text-sm font-bold text-green-700 min-w-[3rem] text-center">
                          {cantidadEnCarrito}
                        </span>
                        <button
                          onClick={() => actualizarCantidad(pa.id, cantidadEnCarrito + 1)}
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
                  <button
                    onClick={handleAgregar}
                    className={`flex-1 flex items-center justify-center gap-2 py-3 px-6 rounded-xl font-semibold text-sm transition-all ${
                      agregado
                        ? 'bg-green-700 text-white'
                        : 'bg-green-600 hover:bg-green-700 active:scale-95 text-white'
                    }`}
                  >
                    {agregado ? (
                      <><Check className="w-4 h-4" />Agregado al carrito</>
                    ) : (
                      <><ShoppingCart className="w-4 h-4" />Agregar al carrito</>
                    )}
                  </button>
                )}

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
          <Link
            href="/garantias"
            className="flex items-center gap-2.5 text-sm text-gray-600 bg-gray-50 hover:bg-green-50 hover:text-green-700 rounded-xl px-4 py-3 transition-colors group"
          >
            <Shield className="w-4 h-4 text-green-600 shrink-0" />
            <span>Garantía: <strong>{pa.garantia ?? 'Sin garantía'}</strong></span>
            <span className="ml-auto text-xs text-gray-400 group-hover:text-green-600 transition-colors">Ver política →</span>
          </Link>

          {/* Variantes del grupo — selectores agrupados por atributo */}
          {(pa.variantes?.length ?? 0) > 0 && (() => {
            const todos = [
              {
                id:              pa.id,
                color:           pa.color,
                atributos:       pa.atributos ?? [],
                imagen_principal: pa.imagen_principal,
                precio_venta:    pa.precio_venta,
                precio_oferta:   pa.precio_oferta,
                en_oferta:       pa.en_oferta,
              },
              ...pa.variantes!,
            ]

            const TALLA_ORDER = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '2XL', '3XL', 'XXXL', '4XL']

            const extractNum = (s: string): number | null => {
              const m = s.match(/^(\d+(?:[.,]\d+)?)/)
              return m ? parseFloat(m[1].replace(',', '.')) : null
            }

            const sortValores = (vals: string[]): string[] => {
              const upper = vals.map(v => v.trim().toUpperCase())
              if (upper.every(v => TALLA_ORDER.includes(v)))
                return [...vals].sort((a, b) =>
                  TALLA_ORDER.indexOf(a.trim().toUpperCase()) - TALLA_ORDER.indexOf(b.trim().toUpperCase())
                )
              const nums = vals.map(extractNum)
              if (nums.every(n => n !== null))
                return [...vals].sort((a, b) => extractNum(a)! - extractNum(b)!)
              return [...vals].sort((a, b) => a.localeCompare(b, 'es'))
            }

            const tieneColor  = todos.some(v => v.color)
            const nombresAttr: string[] = []
            todos.forEach(v => v.atributos?.forEach(a => {
              if (!nombresAttr.includes(a.nombre)) nombresAttr.push(a.nombre)
            }))

            const variantConAttr  = (nombre: string, valor: string) =>
              todos.find(v => v.atributos?.some(a => a.nombre === nombre && a.valor === valor))
            const variantConColor = (color: string) =>
              todos.find(v => v.color === color)

            // Badge — botón (no Link) para evitar navegación
            const Badge = ({
              valor, isActual, onClick,
            }: { valor: string; isActual: boolean; onClick: () => void }) => (
              <button
                type="button"
                onClick={onClick}
                disabled={isActual}
                className={`px-3 py-1.5 rounded-lg text-sm font-medium border-2 transition-all ${
                  isActual
                    ? 'border-green-500 bg-green-50 text-green-700 cursor-default'
                    : 'border-gray-200 text-gray-600 hover:border-green-400 hover:text-green-700 cursor-pointer'
                }`}
              >
                {valor}
              </button>
            )

            return (
              <div className="flex flex-col gap-3">
                {tieneColor && (() => {
                  const colores = sortValores(
                    [...new Set(todos.map(v => v.color).filter(Boolean) as string[])]
                  )
                  return (
                    <div className="flex flex-col gap-1.5">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Color</p>
                      <div className="flex flex-wrap gap-2">
                        {colores.map(color => {
                          const target = variantConColor(color)!
                          return (
                            <Badge
                              key={color}
                              valor={color}
                              isActual={target.id === pa.id}
                              onClick={() => switchVariante(target.id, target)}
                            />
                          )
                        })}
                      </div>
                    </div>
                  )
                })()}

                {nombresAttr.map(nombre => {
                  const valores = sortValores([
                    ...new Set(
                      todos.flatMap(v => v.atributos?.filter(a => a.nombre === nombre).map(a => a.valor) ?? [])
                    ),
                  ])
                  return (
                    <div key={nombre} className="flex flex-col gap-1.5">
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">{nombre}</p>
                      <div className="flex flex-wrap gap-2">
                        {valores.map(valor => {
                          const target = variantConAttr(nombre, valor)!
                          return (
                            <Badge
                              key={valor}
                              valor={valor}
                              isActual={target.id === pa.id}
                              onClick={() => switchVariante(target.id, target)}
                            />
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            )
          })()}

          {/* Descripción */}
          {pa.descripcion && (
            <div className="border-t border-gray-100 pt-5">
              <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">Descripción</h2>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {pa.descripcion}
              </p>
            </div>
          )}

          {/* Especificaciones */}
          {pa.especificaciones && (
            <div className="border-t border-gray-100 pt-5">
              <h2 className="text-sm font-bold text-gray-700 uppercase tracking-wide mb-2">Especificaciones</h2>
              <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-line">
                {pa.especificaciones}
              </p>
            </div>
          )}
        </div>
      </div>

      <ResenasPreguntasSection productoId={pa.id} />

      {/* ── Lightbox ───────────────────────────────────────────────────────── */}
      {lightbox && lbTotal > 0 && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 animate-fade-in cursor-zoom-out"
          onClick={cerrarLightbox}
        >
          {/*
            img nativo (no next/image fill) para que el wrapper se ajuste exactamente
            al tamaño renderizado. Clicks fuera de la imagen pero dentro del viewport
            llegan al backdrop y cierran el lightbox.
          */}
          {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
          <div
            className="cursor-default animate-fade-in"
            onClick={e => e.stopPropagation()}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              key={lbIdx}
              src={lbImagenes[lbIdx]?.url ?? ''}
              alt={pa.nombre}
              className="block rounded-lg animate-fade-in"
              style={{ maxWidth: '90vw', maxHeight: '85vh', objectFit: 'contain' }}
            />
          </div>

          {/* Cerrar */}
          <button
            onClick={cerrarLightbox}
            className="absolute top-4 right-4 bg-white/10 hover:bg-white/20 text-white rounded-full p-2 transition-colors cursor-pointer"
            aria-label="Cerrar"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Flecha izquierda */}
          {lbTotal > 1 && (
            <button
              onClick={e => { e.stopPropagation(); lbAnterior() }}
              className="absolute left-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/25 text-white rounded-full p-3 transition-colors cursor-pointer"
              aria-label="Anterior"
            >
              <ChevronLeft className="w-6 h-6" />
            </button>
          )}

          {/* Flecha derecha */}
          {lbTotal > 1 && (
            <button
              onClick={e => { e.stopPropagation(); lbSiguiente() }}
              className="absolute right-4 top-1/2 -translate-y-1/2 bg-white/10 hover:bg-white/25 text-white rounded-full p-3 transition-colors cursor-pointer"
              aria-label="Siguiente"
            >
              <ChevronRight className="w-6 h-6" />
            </button>
          )}

          {/* Miniaturas y contador */}
          {lbTotal > 1 && (
            <div
              className="absolute bottom-4 left-0 right-0 flex flex-col items-center gap-3"
              onClick={e => e.stopPropagation()}
            >
              <div className="flex gap-2">
                {lbImagenes.map((img, i) => (
                  <button
                    key={img.id}
                    onClick={() => setLbIdx(i)}
                    className={`relative w-12 h-12 rounded-lg overflow-hidden border-2 transition-all cursor-pointer ${
                      i === lbIdx ? 'border-white opacity-100' : 'border-white/30 opacity-50 hover:opacity-80'
                    }`}
                  >
                    <Image src={img.url_thumb ?? img.url} alt="" fill className="object-cover" sizes="48px" />
                  </button>
                ))}
              </div>
              <span className="text-white/60 text-xs">{lbIdx + 1} / {lbTotal}</span>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
