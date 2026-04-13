'use client'

import { useCuenta } from '@/store/cuenta'
import { tiendaApi } from '@/lib/api'
import { useQuery } from '@tanstack/react-query'
import { Tag, Copy, CheckCircle, Clock, AlertCircle } from 'lucide-react'
import { useState } from 'react'
import { formatPrecio } from '@/lib/utils'

interface MiCupon {
  codigo: string
  descripcion: string | null
  tipo: 'porcentaje' | 'monto_fijo'
  valor: number
  minimo_compra: number | null
  maximo_descuento: number | null
  solo_primera_compra: boolean
  fecha_vencimiento: string | null
  usos_usados: number
  usos_restantes: number
  vigente: boolean
}

export default function CuponesPage() {
  const token = useCuenta((s) => s.token)

  const { data, isLoading } = useQuery({
    queryKey: ['cuenta-cupones'],
    queryFn:  () => tiendaApi.cuenta.cupones.listar(token!),
    enabled:  !!token,
  })

  const cupones: MiCupon[] = data?.cupones ?? []

  if (isLoading) {
    return (
      <div className="flex flex-col gap-4">
        <h1 className="text-xl font-bold text-gray-900">Mis cupones</h1>
        {[1, 2].map((i) => (
          <div key={i} className="bg-white rounded-2xl border border-gray-200 p-5 animate-pulse h-28" />
        ))}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h1 className="text-xl font-bold text-gray-900">Mis cupones</h1>
        <p className="text-sm text-gray-500 mt-0.5">Cupones exclusivos asignados a tu cuenta</p>
      </div>

      {cupones.length === 0 ? (
        <div className="bg-white rounded-2xl border border-gray-200 p-10 flex flex-col items-center gap-3 text-center">
          <Tag className="w-10 h-10 text-gray-300" />
          <p className="text-gray-500 text-sm">No tienes cupones exclusivos asignados aún.</p>
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {cupones.map((c) => (
            <TarjetaCupon key={c.codigo} cupon={c} />
          ))}
        </div>
      )}
    </div>
  )
}

function TarjetaCupon({ cupon }: { cupon: MiCupon }) {
  const [copiado, setCopiado] = useState(false)

  const copiar = async () => {
    await navigator.clipboard.writeText(cupon.codigo)
    setCopiado(true)
    setTimeout(() => setCopiado(false), 2000)
  }

  const etiquetaValor = cupon.tipo === 'porcentaje'
    ? `${cupon.valor}% de descuento`
    : `${formatPrecio(cupon.valor)} de descuento`

  return (
    <div className={`bg-white rounded-2xl border-2 p-5 flex flex-col gap-3 transition-colors ${
      cupon.vigente ? 'border-green-200' : 'border-gray-200 opacity-60'
    }`}>
      <div className="flex items-start justify-between gap-3">
        {/* Info principal */}
        <div className="flex items-start gap-3 min-w-0">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center shrink-0 ${
            cupon.vigente ? 'bg-green-100' : 'bg-gray-100'
          }`}>
            <Tag className={`w-4 h-4 ${cupon.vigente ? 'text-green-600' : 'text-gray-400'}`} />
          </div>
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`text-base font-bold tracking-wider ${cupon.vigente ? 'text-gray-900' : 'text-gray-400'}`}>
                {cupon.codigo}
              </span>
              {!cupon.vigente && (
                <span className="text-xs bg-gray-100 text-gray-500 px-2 py-0.5 rounded-full font-medium">
                  Agotado
                </span>
              )}
            </div>
            {cupon.descripcion && (
              <p className="text-sm text-gray-600 mt-0.5 leading-snug">{cupon.descripcion}</p>
            )}
          </div>
        </div>

        {/* Botón copiar */}
        {cupon.vigente && (
          <button
            onClick={copiar}
            title="Copiar código"
            className="flex items-center gap-1.5 shrink-0 text-xs font-medium px-3 py-1.5 rounded-lg border border-green-200 text-green-700 hover:bg-green-50 transition-colors"
          >
            {copiado
              ? <><CheckCircle className="w-3.5 h-3.5" /> Copiado</>
              : <><Copy className="w-3.5 h-3.5" /> Copiar</>
            }
          </button>
        )}
      </div>

      {/* Detalles */}
      <div className="flex flex-wrap gap-2 text-xs">
        <Chip color="green">{etiquetaValor}</Chip>

        {cupon.minimo_compra && (
          <Chip color="gray">Mínimo {formatPrecio(cupon.minimo_compra)}</Chip>
        )}
        {cupon.maximo_descuento && (
          <Chip color="gray">Máximo {formatPrecio(cupon.maximo_descuento)}</Chip>
        )}
        {cupon.solo_primera_compra && (
          <Chip color="amber">Solo primera compra</Chip>
        )}
      </div>

      {/* Pie: vencimiento + usos */}
      <div className="flex items-center justify-between text-xs text-gray-400 pt-1 border-t border-gray-100">
        <span className="flex items-center gap-1">
          {cupon.fecha_vencimiento
            ? <><Clock className="w-3 h-3" /> Vence el {cupon.fecha_vencimiento}</>
            : <><Clock className="w-3 h-3" /> Sin fecha de vencimiento</>
          }
        </span>
        <span className="flex items-center gap-1">
          {cupon.usos_restantes > 0
            ? <><CheckCircle className="w-3 h-3 text-green-400" /> {cupon.usos_restantes} uso{cupon.usos_restantes !== 1 ? 's' : ''} disponible{cupon.usos_restantes !== 1 ? 's' : ''}</>
            : <><AlertCircle className="w-3 h-3 text-gray-400" /> Sin usos restantes</>
          }
        </span>
      </div>
    </div>
  )
}

function Chip({ children, color }: { children: React.ReactNode; color: 'green' | 'gray' | 'amber' }) {
  const styles = {
    green: 'bg-green-50 text-green-700',
    gray:  'bg-gray-100 text-gray-600',
    amber: 'bg-amber-50 text-amber-700',
  }
  return (
    <span className={`px-2 py-0.5 rounded-full font-medium ${styles[color]}`}>
      {children}
    </span>
  )
}