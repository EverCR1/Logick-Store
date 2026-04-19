'use client'

import { useQuery } from '@tanstack/react-query'
import { useCuenta } from '@/store/cuenta'
import { tiendaApi } from '@/lib/api'
import { Flag, Loader2, Gift, CheckCircle, Clock, AlertCircle, XCircle } from 'lucide-react'
import Link from 'next/link'

const ESTADO_CONFIG: Record<string, { label: string; icon: React.ReactNode; cls: string }> = {
  pendiente:   { label: 'Pendiente',    icon: <Clock    className="w-3.5 h-3.5" />, cls: 'bg-yellow-50 text-yellow-700 border-yellow-200' },
  en_revision: { label: 'En revisión',  icon: <AlertCircle className="w-3.5 h-3.5" />, cls: 'bg-blue-50 text-blue-700 border-blue-200' },
  resuelto:    { label: 'Resuelto',     icon: <CheckCircle className="w-3.5 h-3.5" />, cls: 'bg-green-50 text-green-700 border-green-200' },
  invalido:    { label: 'Inválido',     icon: <XCircle  className="w-3.5 h-3.5" />, cls: 'bg-red-50 text-red-700 border-red-200' },
}

export default function MisReportesPage() {
  const token = useCuenta((s) => s.token)

  const { data, isLoading } = useQuery({
    queryKey: ['mis-reportes'],
    queryFn:  () => tiendaApi.reportes.miReportes(token!),
    enabled:  !!token,
    staleTime: 0,
  })

  const reportes = data?.reportes ?? []

  return (
    <div className="max-w-2xl mx-auto px-4 py-10">

      <div className="flex items-center gap-3 mb-6">
        <Flag className="w-6 h-6 text-green-600" />
        <h1 className="text-2xl font-bold text-gray-900">Mis reportes</h1>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-16">
          <Loader2 className="w-8 h-8 text-green-500 animate-spin" />
        </div>
      ) : reportes.length === 0 ? (
        <div className="text-center py-16 text-gray-400">
          <Flag className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p className="font-semibold text-gray-600">No has enviado reportes.</p>
          <p className="text-sm mt-1">¿Algo salió mal? Repórtalo y podrías ganar puntos.</p>
          <Link href="/" className="mt-4 inline-flex items-center gap-1.5 text-sm text-green-600 hover:underline font-medium">
            Ir al inicio y reportar
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {reportes.map((r) => {
            const cfg = ESTADO_CONFIG[r.estado] ?? ESTADO_CONFIG['pendiente']
            return (
              <div key={r.id} className="rounded-2xl border border-gray-200 bg-white p-5">
                <div className="flex items-start justify-between gap-3 mb-2">
                  <span className="font-semibold text-gray-800 text-sm">{r.categoria}</span>
                  <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full border ${cfg.cls}`}>
                    {cfg.icon} {cfg.label}
                  </span>
                </div>
                <p className="text-sm text-gray-600 leading-relaxed">{r.descripcion}</p>
                {r.nota_admin && (
                  <div className="mt-3 rounded-xl bg-gray-50 border border-gray-100 px-3 py-2">
                    <p className="text-xs text-gray-500 font-semibold mb-0.5">Respuesta del equipo:</p>
                    <p className="text-sm text-gray-700">{r.nota_admin}</p>
                  </div>
                )}
                <div className="flex items-center gap-3 mt-3 pt-3 border-t border-gray-100">
                  <span className="text-xs text-gray-400">{r.created_at}</span>
                  {r.puntos_otorgados ? (
                    <span className="ml-auto inline-flex items-center gap-1 text-xs font-semibold text-green-600">
                      <Gift className="w-3.5 h-3.5" /> +{r.puntos_otorgados} puntos acreditados
                    </span>
                  ) : null}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
