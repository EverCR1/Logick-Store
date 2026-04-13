'use client'

import { useState, useCallback } from 'react'
import { useParams } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { useCuenta } from '@/store/cuenta'
import { tiendaApi } from '@/lib/api'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, Loader2, Package, MapPin, CreditCard, FileText, CheckCircle, Star, Download } from 'lucide-react'
import { formatPrecio, toSlug } from '@/lib/utils'

const ESTADO_COLOR: Record<string, string> = {
  pendiente:      'bg-yellow-100 text-yellow-700',
  confirmado:     'bg-blue-100 text-blue-700',
  en_preparacion: 'bg-purple-100 text-purple-700',
  enviado:        'bg-sky-100 text-sky-700',
  entregado:      'bg-green-100 text-green-700',
  cancelado:      'bg-red-100 text-red-700',
}

const ESTADO_LABEL: Record<string, string> = {
  pendiente:      'Pendiente',
  confirmado:     'Confirmado',
  en_preparacion: 'En preparación',
  enviado:        'Enviado',
  entregado:      'Entregado',
  cancelado:      'Cancelado',
}

const METODO_LABEL: Record<string, string> = {
  efectivo:               'Efectivo contra entrega',
  deposito_transferencia: 'Depósito / Transferencia',
  tarjeta:                'Tarjeta',
  mixto:                  'Mixto',
}

export default function PedidoDetallePage() {
  const { numero }           = useParams<{ numero: string }>()
  const token                = useCuenta((s) => s.token)
  const [generando, setGenerando] = useState(false)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['cuenta-pedido', numero],
    queryFn:  () => tiendaApi.cuenta.pedido(token!, numero),
    enabled:  !!token,
  })

  const handleVerComprobante = useCallback(async () => {
    if (!data?.pedido) return
    setGenerando(true)
    try {
      const { pdf }              = await import('@react-pdf/renderer')
      const { default: CompDoc } = await import('@/components/pdf/ComprobantePedido')
      const { createElement }    = await import('react')
      const blob = await pdf(createElement(CompDoc, { pedido: data.pedido })).toBlob()
      const url  = URL.createObjectURL(blob)
      window.open(url, '_blank')
    } catch (e) {
      console.error('Error generando PDF:', e)
    } finally {
      setGenerando(false)
    }
  }, [data])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-24 text-gray-400">
        <Loader2 className="w-6 h-6 animate-spin" />
      </div>
    )
  }

  if (isError || !data?.pedido) {
    return (
      <div className="flex flex-col items-center gap-4 py-16 text-center">
        <Package className="w-10 h-10 text-gray-300" />
        <p className="text-gray-600 font-medium">No se pudo cargar el pedido.</p>
        <Link href="/cuenta/pedidos" className="text-sm text-green-600 hover:underline">
          Volver a mis pedidos
        </Link>
      </div>
    )
  }

  const pedido = data.pedido

  // Ver comprobante: disponible si es pago previo (deposito/tarjeta) o efectivo ya entregado
  const puedeVerComprobante =
    pedido.metodo_pago === 'deposito_transferencia' ||
    pedido.metodo_pago === 'tarjeta' ||
    (pedido.metodo_pago === 'efectivo' && pedido.estado === 'entregado')

  return (
    <div className="flex flex-col gap-6">

      {/* Cabecera */}
      <div>
        <Link href="/cuenta/pedidos" className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-green-600 transition-colors mb-3">
          <ChevronLeft className="w-4 h-4" />
          Mis pedidos
        </Link>
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-xl font-bold text-gray-900">Pedido #{pedido.numero_pedido}</h1>
          <span className={`text-xs px-2.5 py-1 rounded-full font-semibold ${ESTADO_COLOR[pedido.estado] ?? 'bg-gray-100 text-gray-600'}`}>
            {ESTADO_LABEL[pedido.estado] ?? pedido.estado}
          </span>
          {puedeVerComprobante && (
            <button
              onClick={handleVerComprobante}
              disabled={generando}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-green-700 bg-green-50 hover:bg-green-100 border border-green-200 px-3 py-1.5 rounded-full transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
            >
              {generando ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Download className="w-3.5 h-3.5" />
              )}
              {generando ? 'Generando…' : 'Ver comprobante'}
            </button>
          )}
        </div>
        <p className="text-sm text-gray-400 mt-1">
          {new Date(pedido.created_at).toLocaleDateString('es-GT', { year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>

      {/* Productos */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100 flex items-center gap-2">
          <Package className="w-4 h-4 text-gray-400" />
          <h2 className="text-sm font-semibold text-gray-800">Productos</h2>
        </div>
        <div className="divide-y divide-gray-100">
          {pedido.detalles.map((d) => {
            const href = d.producto_id
              ? `/productos/${toSlug(d.nombre_producto, d.producto_id)}`
              : null

            return (
              <div key={d.id} className="flex items-center gap-4 px-5 py-4">
                <div className="w-14 h-14 rounded-xl bg-gray-50 border border-gray-100 overflow-hidden shrink-0 relative">
                  {d.imagen ? (
                    <Image src={d.imagen} alt={d.nombre_producto} fill className="object-contain p-1" sizes="56px" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-gray-200 text-xl">📦</div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  {href ? (
                    <Link href={href} className="text-sm font-medium line-clamp-2 text-green-700 hover:underline">
                      {d.nombre_producto}
                    </Link>
                  ) : (
                    <p className="text-sm font-medium line-clamp-2 text-gray-800">{d.nombre_producto}</p>
                  )}
                  <p className="text-xs text-gray-400 mt-0.5">
                    {formatPrecio(d.precio_unitario)} × {d.cantidad}
                  </p>
                </div>
                <div className="flex flex-col items-end gap-2 shrink-0">
                  <p className="text-sm font-bold text-gray-800">{formatPrecio(d.subtotal)}</p>
                  {pedido.estado === 'entregado' && href && (
                    <Link
                      href={`${href}#resenas`}
                      className="flex items-center gap-1 text-xs font-medium text-yellow-600 hover:text-yellow-700 bg-yellow-50 hover:bg-yellow-100 border border-yellow-200 px-2.5 py-1 rounded-full transition-colors"
                    >
                      <Star className="w-3 h-3" />
                      Dejar reseña
                    </Link>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Resumen de costos + info en grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

        {/* Resumen de pago */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2 mb-1">
            <CreditCard className="w-4 h-4 text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-800">Resumen de pago</h2>
          </div>
          <div className="flex flex-col gap-2 text-sm">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span>{formatPrecio(pedido.subtotal)}</span>
            </div>
            <div className="flex justify-between text-gray-600">
              <span>Envío</span>
              <span className={pedido.costo_envio === 0 ? 'text-green-600 font-medium' : ''}>
                {pedido.costo_envio === 0 ? 'Gratis' : formatPrecio(pedido.costo_envio)}
              </span>
            </div>
            {pedido.descuento_cupon > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Descuento cupón</span>
                <span>-{formatPrecio(pedido.descuento_cupon)}</span>
              </div>
            )}
            <div className="flex justify-between font-bold text-gray-900 border-t border-gray-100 pt-2 mt-1">
              <span>Total</span>
              <span className="text-green-600">{formatPrecio(pedido.total)}</span>
            </div>
          </div>
          <div className="pt-1 border-t border-gray-100 text-xs text-gray-500 flex items-center gap-1.5">
            <span className="font-medium">Método:</span>
            {METODO_LABEL[pedido.metodo_pago] ?? pedido.metodo_pago}
          </div>
          {pedido.puntos_ganados > 0 && (
            <div className="text-xs text-green-700 bg-green-50 rounded-lg px-3 py-2 flex items-center gap-1.5">
              <CheckCircle className="w-3.5 h-3.5 shrink-0" />
              +{pedido.puntos_ganados} puntos ganados con este pedido
            </div>
          )}
        </div>

        {/* Dirección de entrega */}
        <div className="bg-white border border-gray-200 rounded-2xl p-5 flex flex-col gap-3">
          <div className="flex items-center gap-2 mb-1">
            <MapPin className="w-4 h-4 text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-800">Entrega</h2>
          </div>
          <div className="text-sm text-gray-600 flex flex-col gap-1">
            <p className="font-medium text-gray-800">{pedido.nombre}</p>
            <p>{pedido.telefono}</p>
            <p>{pedido.direccion}</p>
            <p>{pedido.municipio}, {pedido.departamento}</p>
            {pedido.referencias && <p className="text-gray-400 text-xs">{pedido.referencias}</p>}
          </div>
          {pedido.notas && (
            <div className="pt-2 border-t border-gray-100 text-xs text-gray-500">
              <span className="font-medium">Notas: </span>{pedido.notas}
            </div>
          )}
        </div>
      </div>

      {/* Comprobante (si aplica) */}
      {pedido.comprobante_url && (
        <div className="bg-white border border-gray-200 rounded-2xl p-5">
          <div className="flex items-center gap-2 mb-3">
            <FileText className="w-4 h-4 text-gray-400" />
            <h2 className="text-sm font-semibold text-gray-800">Comprobante de pago</h2>
          </div>
          <a href={pedido.comprobante_url} target="_blank" rel="noopener noreferrer">
            <Image
              src={pedido.comprobante_url}
              alt="Comprobante"
              width={300}
              height={200}
              className="rounded-xl border border-gray-100 object-contain max-h-48 w-auto hover:opacity-90 transition-opacity"
            />
          </a>
        </div>
      )}
    </div>
  )
}