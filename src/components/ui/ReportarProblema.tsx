'use client'

import { useState, useEffect, useRef } from 'react'
import { AlertTriangle, CheckCircle, ChevronDown, Gift, X, Flag, Star } from 'lucide-react'
import { tiendaApi } from '@/lib/api'
import { useCuenta } from '@/store/cuenta'

const CATEGORIAS: Record<string, string> = {
  pedido:   'Problema con mi pedido',
  pago:     'Problema con el pago',
  producto: 'Producto incorrecto o dañado',
  cuenta:   'Problema con mi cuenta',
  envio:    'Problema con el envío',
  tienda:   'Error en la tienda en línea',
  otro:     'Otro',
}

const TIENDA_BONUS_MSG = '⭐ Los errores en la tienda en línea son los más valiosos para nosotros — si tu reporte es válido, recibes un cupón de mayor valor o más puntos de lo normal.'

interface Props {
  open: boolean
  onClose: () => void
}

export default function ReportarProblema({ open, onClose }: Props) {
  const cuenta = useCuenta((s) => s.cuenta)
  const token  = useCuenta((s) => s.token)

  const [categoria,   setCategoria]   = useState('')
  const [descripcion, setDescripcion] = useState('')
  const [nombre,      setNombre]      = useState('')
  const [email,       setEmail]       = useState('')
  const [telefono,    setTelefono]    = useState('')
  const [enviando,    setEnviando]    = useState(false)
  const [enviado,     setEnviado]     = useState(false)
  const [error,       setError]       = useState<string | null>(null)

  const backdropRef = useRef<HTMLDivElement>(null)

  // Cerrar con Escape
  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') handleClose() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [open])

  // Bloquear scroll del body
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [open])

  const handleClose = () => {
    if (enviando) return
    onClose()
  }

  const reset = () => {
    setEnviado(false); setCategoria(''); setDescripcion('')
    setNombre(''); setEmail(''); setTelefono(''); setError(null)
  }

  const handleSubmit = async (e: React.SyntheticEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    if (!categoria)                    { setError('Selecciona una categoría.'); return }
    if (descripcion.trim().length < 20) { setError('La descripción debe tener al menos 20 caracteres.'); return }

    setEnviando(true)
    try {
      await tiendaApi.reportes.enviar(
        {
          categoria,
          descripcion:        descripcion.trim(),
          nombre_contacto:    nombre.trim()    || undefined,
          email_contacto:     email.trim()     || undefined,
          telefono_contacto:  telefono.trim()  || undefined,
        },
        token ?? null,
      )
      setEnviado(true)
    } catch (err: any) {
      let msg = 'No se pudo enviar el reporte. Intenta de nuevo.'
      if (err?.response) {
        try {
          const body = await err.response.json()
          if (body?.message) msg = body.message
          else if (body?.errors) msg = Object.values(body.errors).flat().join(' ')
        } catch { /* respuesta no es JSON */ }
      }
      setError(msg)
    } finally {
      setEnviando(false)
    }
  }

  if (!open) return null

  return (
    <div
      ref={backdropRef}
      className="fixed inset-0 z-[200] flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm"
      onMouseDown={(e) => { if (e.target === backdropRef.current) handleClose() }}
    >
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto">

        {/* Header del modal */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between rounded-t-2xl z-10">
          <div className="flex items-center gap-2">
            <Flag className="w-5 h-5 text-green-600" />
            <span className="font-bold text-gray-900">Reportar un problema</span>
          </div>
          <button
            onClick={handleClose}
            className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5">
          {enviado ? (
            <div className="flex flex-col items-center gap-3 py-6 text-center">
              <CheckCircle className="w-14 h-14 text-green-500" />
              <p className="text-lg font-bold text-gray-800">¡Reporte enviado!</p>
              <p className="text-sm text-gray-500 leading-relaxed">
                Lo revisaremos pronto. Si es válido, recibirás puntos o un cupón como agradecimiento.
              </p>
              <div className="flex gap-3 mt-2">
                <button
                  onClick={() => { reset() }}
                  className="text-sm text-green-600 hover:underline font-medium"
                >
                  Enviar otro reporte
                </button>
                <button
                  onClick={() => { reset(); handleClose() }}
                  className="text-sm text-gray-400 hover:underline"
                >
                  Cerrar
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="flex flex-col gap-4">

              {/* Incentivo */}
              <div className="rounded-xl bg-green-50 border border-green-100 px-4 py-3 flex items-start gap-2.5">
                <Gift className="w-4 h-4 text-green-600 mt-0.5 shrink-0" />
                <p className="text-xs text-green-800 leading-relaxed">
                  Los reportes válidos son recompensados con <strong>puntos o cupones de descuento</strong>.
                </p>
              </div>

              {/* Categoría */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">¿Cuál es el problema?</label>
                <div className="relative">
                  <select
                    value={categoria}
                    onChange={e => { setCategoria(e.target.value); setError(null) }}
                    className="w-full appearance-none rounded-xl border border-gray-200 bg-white px-4 py-2.5 pr-10 text-sm text-gray-700 focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-100"
                  >
                    <option value="">Selecciona una categoría...</option>
                    {Object.entries(CATEGORIAS).map(([val, label]) => (
                      <option key={val} value={val}>{label}</option>
                    ))}
                  </select>
                  <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                </div>

                {/* Mensaje especial si es error de tienda */}
                {categoria === 'tienda' && (
                  <div className="mt-2 rounded-xl bg-amber-50 border border-amber-200 px-3 py-2.5 flex items-start gap-2">
                    <Star className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
                    <p className="text-xs text-amber-800 leading-relaxed">{TIENDA_BONUS_MSG}</p>
                  </div>
                )}
              </div>

              {/* Descripción */}
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">
                  Descripción
                  <span className="text-gray-400 font-normal ml-1">(mín. 20 caracteres)</span>
                </label>
                <textarea
                  value={descripcion}
                  onChange={e => { setDescripcion(e.target.value); setError(null) }}
                  rows={4}
                  placeholder="Describe con detalle qué pasó, cuándo y qué esperabas que ocurriera..."
                  className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-700 resize-none focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-100"
                />
                <p className="text-right text-xs text-gray-400 mt-0.5">{descripcion.length} / 1000</p>
              </div>

              {/* Contacto — solo para invitados */}
              {!cuenta && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">
                    Datos de contacto
                    <span className="text-gray-400 font-normal ml-1 text-xs">— para darte seguimiento</span>
                  </label>
                  <div className="flex flex-col gap-2">
                    <input
                      type="text"
                      value={nombre}
                      onChange={e => setNombre(e.target.value)}
                      placeholder="Tu nombre (opcional)"
                      className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-700 focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-100"
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={e => setEmail(e.target.value)}
                      placeholder="Correo electrónico (opcional)"
                      className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-700 focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-100"
                    />
                    <input
                      type="tel"
                      value={telefono}
                      onChange={e => setTelefono(e.target.value)}
                      placeholder="Teléfono o WhatsApp (opcional)"
                      className="w-full rounded-xl border border-gray-200 px-3 py-2.5 text-sm text-gray-700 focus:border-green-400 focus:outline-none focus:ring-2 focus:ring-green-100"
                    />
                  </div>
                  <p className="text-xs text-gray-400 mt-1">Al menos un dato de contacto ayuda a darte seguimiento por correo o WhatsApp.</p>
                </div>
              )}

              {error && (
                <p className="flex items-center gap-1.5 text-sm text-red-600 -mt-1">
                  <AlertTriangle className="w-4 h-4 shrink-0" /> {error}
                </p>
              )}

              <button
                type="submit"
                disabled={enviando}
                className="w-full rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white font-semibold py-3 text-sm transition-colors"
              >
                {enviando ? 'Enviando...' : 'Enviar reporte'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  )
}