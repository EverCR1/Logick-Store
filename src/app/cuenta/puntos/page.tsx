'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { Loader2, Star, Gift, ArrowUpCircle, RotateCcw, X } from 'lucide-react'
import { tiendaApi } from '@/lib/api'
import { useCuenta } from '@/store/cuenta'

const TIPO_ICON: Record<string, React.ReactNode> = {
  compra:    <ArrowUpCircle className="w-4 h-4 text-green-500" />,
  resena:    <Star className="w-4 h-4 text-yellow-500" />,
  canje:     <Gift className="w-4 h-4 text-purple-500" />,
  reversion: <RotateCcw className="w-4 h-4 text-red-400" />,
  ajuste:    <ArrowUpCircle className="w-4 h-4 text-blue-400" />,
}

export default function PuntosPage() {
  const token          = useCuenta((s) => s.token)
  const cuenta         = useCuenta((s) => s.cuenta)
  const actualizarCuenta = useCuenta((s) => s.actualizarCuenta)
  const qc             = useQueryClient()

  const [canjeado,    setCanjeado]    = useState<{ codigo: string; valor: number; fecha_fin: string } | null>(null)
  const [errorCanje,  setErrorCanje]  = useState('')
  const [confirmando, setConfirmando] = useState<{ puntos: number; quetzales: number } | null>(null)

  const { data, isLoading } = useQuery({
    queryKey: ['cuenta-puntos'],
    queryFn:  () => tiendaApi.cuenta.puntos.listar(token!),
    enabled:  !!token,
  })

  const { mutate: canjear, isPending } = useMutation({
    mutationFn: (puntos: number) => tiendaApi.cuenta.puntos.canjear(token!, puntos),
    onSuccess: (res) => {
      setCanjeado(res.cupon)
      setErrorCanje('')
      setConfirmando(null)
      qc.invalidateQueries({ queryKey: ['cuenta-puntos'] })
      // Actualizar saldo en el store para que se vea en el perfil
      if (cuenta) actualizarCuenta({ ...cuenta, puntos_saldo: res.nuevo_saldo })
    },
    onError: async (err: any) => {
      setConfirmando(null)
      try {
        const body = await err?.response?.json()
        setErrorCanje(body?.message ?? 'Error al canjear.')
      } catch {
        setErrorCanje('Error al canjear.')
      }
    },
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
      </div>
    )
  }

  const saldo    = data?.saldo ?? 0
  const opciones = data?.opciones_canje
    ? Object.entries(data.opciones_canje).map(([pts, q]) => ({ puntos: Number(pts), quetzales: Number(q) }))
    : []
  const historial = data?.historial ?? []

  return (
    <div className="flex flex-col gap-6">

      {/* Modal de confirmación */}
      {confirmando && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 px-4">
          <div className="bg-white rounded-2xl shadow-xl p-6 w-full max-w-sm flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-gray-800">Confirmar canje</h3>
              <button onClick={() => setConfirmando(null)} className="text-gray-400 hover:text-gray-600">
                <X className="w-5 h-5" />
              </button>
            </div>
            <p className="text-sm text-gray-600">
              ¿Deseas canjear <strong>{confirmando.puntos} puntos</strong> por un cupón de{' '}
              <strong className="text-purple-700">Q{confirmando.quetzales}</strong>?
            </p>
            <p className="text-xs text-gray-400">El cupón tendrá 6 meses de vigencia y será de uso único.</p>
            <div className="flex gap-2 mt-1">
              <button
                onClick={() => setConfirmando(null)}
                className="flex-1 py-2 rounded-xl border border-gray-200 text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => canjear(confirmando.puntos)}
                disabled={isPending}
                className="flex-1 py-2 rounded-xl bg-purple-600 hover:bg-purple-700 text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2 disabled:opacity-60"
              >
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Saldo */}
      <div className="bg-gradient-to-br from-green-600 to-green-700 rounded-2xl p-6 text-white">
        <p className="text-sm font-medium text-green-100 mb-1">Tu saldo de puntos</p>
        <p className="text-5xl font-bold">{saldo.toLocaleString()}</p>
        <p className="text-sm text-green-200 mt-1">= Q{(saldo / 10).toFixed(2)} en cupones</p>
      </div>

      {/* Cupón canjeado */}
      {canjeado && (
        <div className="bg-green-50 border border-green-200 rounded-2xl p-5 flex flex-col gap-1">
          <p className="text-sm font-bold text-green-700">¡Cupón generado exitosamente!</p>
          <p className="text-2xl font-bold text-green-800 tracking-widest">{canjeado.codigo}</p>
          <p className="text-sm text-green-600">Valor: Q{canjeado.valor} · Vence: {canjeado.fecha_fin}</p>
          <p className="text-xs text-green-500 mt-1">Encuéntralo en "Mis cupones" para usarlo en tu próxima compra.</p>
        </div>
      )}

      {errorCanje && (
        <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
          {errorCanje}
        </div>
      )}

      {/* Opciones de canje */}
      <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-gray-100">
          <h2 className="text-sm font-semibold text-gray-800 flex items-center gap-2">
            <Gift className="w-4 h-4 text-purple-500" />
            Canjear puntos
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">10 puntos = Q1 · El cupón tiene 6 meses de vigencia</p>
        </div>
        <div className="p-4 grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-5 gap-2">
          {opciones.map(({ puntos, quetzales }) => {
            const disponible = saldo >= puntos
            return (
              <button
                key={puntos}
                onClick={() => { setCanjeado(null); setErrorCanje(''); setConfirmando({ puntos, quetzales }) }}
                disabled={!disponible || isPending}
                className={`flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all text-center ${
                  disponible
                    ? 'border-purple-200 hover:border-purple-400 hover:bg-purple-50 cursor-pointer'
                    : 'border-gray-100 opacity-40 cursor-not-allowed'
                }`}
              >
                <span className="text-base font-bold text-purple-700">Q{quetzales}</span>
                <span className="text-[11px] text-gray-500">{puntos} pts</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Cómo ganar puntos */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5">
        <h2 className="text-sm font-semibold text-gray-800 mb-3">¿Cómo ganar puntos?</h2>
        <div className="flex flex-col gap-2.5 text-sm text-gray-600">
          <div className="flex items-start gap-3">
            <ArrowUpCircle className="w-4 h-4 text-green-500 mt-0.5 shrink-0" />
            <span><strong>Compras:</strong> 1 punto por cada Q10 en pedidos entregados</span>
          </div>
          <div className="flex items-start gap-3">
            <Star className="w-4 h-4 text-yellow-500 mt-0.5 shrink-0" />
            <span><strong>Reseñas:</strong> entre 20 y 200 puntos por reseña aprobada (según el valor del producto)</span>
          </div>
        </div>
      </div>

      {/* Historial */}
      {historial.length > 0 && (
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
          <div className="px-5 py-4 border-b border-gray-100">
            <h2 className="text-sm font-semibold text-gray-800">Historial</h2>
          </div>
          <div className="divide-y divide-gray-50">
            {historial.map((m) => (
              <div key={m.id} className="flex items-center gap-3 px-5 py-3.5">
                <div className="shrink-0">{TIPO_ICON[m.tipo] ?? <ArrowUpCircle className="w-4 h-4 text-gray-400" />}</div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 truncate">{m.descripcion}</p>
                  <p className="text-xs text-gray-400">{m.fecha}</p>
                </div>
                <span className={`text-sm font-bold shrink-0 ${m.puntos > 0 ? 'text-green-600' : 'text-red-500'}`}>
                  {m.puntos > 0 ? `+${m.puntos}` : m.puntos}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {historial.length === 0 && (
        <div className="text-center py-10 text-gray-400 text-sm">
          Aún no tienes movimientos de puntos.
        </div>
      )}
    </div>
  )
}