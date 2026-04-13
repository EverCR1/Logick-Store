'use client'

import { useQuery } from '@tanstack/react-query'
import { useCuenta } from '@/store/cuenta'
import { tiendaApi } from '@/lib/api'
import Link from 'next/link'
import { Package, ChevronRight, Loader2 } from 'lucide-react'

const ESTADO_COLOR: Record<string, string> = {
  pendiente:       'bg-yellow-100 text-yellow-700',
  confirmado:      'bg-blue-100 text-blue-700',
  en_preparacion:  'bg-purple-100 text-purple-700',
  enviado:         'bg-sky-100 text-sky-700',
  entregado:       'bg-green-100 text-green-700',
  cancelado:       'bg-red-100 text-red-700',
}

const ESTADO_LABEL: Record<string, string> = {
  pendiente:       'Pendiente',
  confirmado:      'Confirmado',
  en_preparacion:  'En preparación',
  enviado:         'Enviado',
  entregado:       'Entregado',
  cancelado:       'Cancelado',
}

export default function PedidosPage() {
  const token = useCuenta((s) => s.token)

  const { data, isLoading, isError } = useQuery({
    queryKey: ['cuenta-pedidos'],
    queryFn:  () => tiendaApi.cuenta.pedidos(token!),
    enabled:  !!token,
    staleTime: 1000 * 60 * 2,
  })

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Mis pedidos</h1>
        <p className="text-sm text-gray-500 mt-0.5">Historial de todas tus compras</p>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-16 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      )}

      {isError && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-2xl px-6 py-4">
          No se pudieron cargar los pedidos. Intenta de nuevo.
        </div>
      )}

      {data && data.pedidos.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
            <Package className="w-8 h-8 text-gray-300" />
          </div>
          <div>
            <p className="text-gray-700 font-medium">Aún no tienes pedidos</p>
            <p className="text-sm text-gray-400 mt-1">Cuando realices una compra aparecerá aquí</p>
          </div>
          <Link href="/productos" className="px-5 py-2 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors">
            Ver productos
          </Link>
        </div>
      )}

      {data && data.pedidos.length > 0 && (
        <div className="flex flex-col gap-3">
          {data.pedidos.map((pedido: any) => (
            <Link
              key={pedido.id}
              href={`/cuenta/pedidos/${pedido.numero_pedido}`}
              className="bg-white border border-gray-200 rounded-2xl px-5 py-4 flex items-center gap-4 hover:border-green-300 transition-colors group"
            >
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                <Package className="w-5 h-5 text-gray-400" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-sm font-semibold text-gray-800">Pedido #{pedido.numero_pedido}</p>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${ESTADO_COLOR[pedido.estado] ?? 'bg-gray-100 text-gray-600'}`}>
                    {ESTADO_LABEL[pedido.estado] ?? pedido.estado}
                  </span>
                </div>
                <p className="text-xs text-gray-400 mt-0.5">{new Date(pedido.created_at).toLocaleDateString('es-GT', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
              </div>
              <div className="text-right shrink-0">
                <p className="text-sm font-bold text-gray-800">Q{Number(pedido.total).toFixed(2)}</p>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-green-500 transition-colors" />
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}