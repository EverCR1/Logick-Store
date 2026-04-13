'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCuenta } from '@/store/cuenta'
import { tiendaApi } from '@/lib/api'
import { Star, MessageCircle, Send, Loader2, CheckCircle } from 'lucide-react'

interface Props {
  productoId: number
}

export default function ResenasPreguntasSection({ productoId }: Props) {
  return (
    <div className="flex flex-col gap-10 mt-10 border-t border-gray-100 pt-10">
      <SeccionResenas productoId={productoId} />
      <SeccionPreguntas productoId={productoId} />
    </div>
  )
}

// ── Reseñas ───────────────────────────────────────────────────────────────────

function SeccionResenas({ productoId }: { productoId: number }) {
  const token       = useCuenta((s) => s.token)
  const autenticado = useCuenta((s) => s.autenticado)
  const queryClient = useQueryClient()

  const { data: dataResenas } = useQuery({
    queryKey: ['resenas', productoId],
    queryFn:  () => tiendaApi.resenas.listar(productoId),
  })

  const { data: dataMia } = useQuery({
    queryKey: ['resena-mia', productoId],
    queryFn:  () => tiendaApi.resenas.mia(productoId, token!),
    enabled:  autenticado && !!token,
  })

  const resenas      = dataResenas?.resenas ?? []
  const promedio     = dataResenas?.promedio ?? null
  const total        = dataResenas?.total ?? 0
  const miResena     = dataMia?.resena ?? null
  const puedeResenar = dataMia?.puede_resenar ?? false

  const [rating,     setRating]     = useState(0)
  const [hover,      setHover]      = useState(0)
  const [comentario, setComentario] = useState('')
  const [enviado,    setEnviado]    = useState(false)
  const [error,      setError]      = useState('')

  const { mutate, isPending } = useMutation({
    mutationFn: () => tiendaApi.resenas.crear(productoId, token!, { rating, comentario: comentario.trim() || undefined }),
    onSuccess: () => {
      setEnviado(true)
      queryClient.invalidateQueries({ queryKey: ['resenas', productoId] })
      queryClient.invalidateQueries({ queryKey: ['resena-mia', productoId] })
    },
    onError: async (err: any) => {
      let body: any = null
      try { body = await err?.response?.json() } catch {}
      setError(body?.message ?? 'No se pudo enviar la reseña.')
    },
  })

  const handleEnviar = () => {
    if (rating === 0) { setError('Selecciona una calificación.'); return }
    setError('')
    mutate()
  }

  return (
    <section>
      <div className="flex items-center gap-3 mb-5">
        <h2 className="text-lg font-bold text-gray-900">Reseñas</h2>
        {promedio !== null && (
          <div className="flex items-center gap-1.5">
            <Estrellas valor={promedio} readonly />
            <span className="text-sm font-semibold text-gray-700">{promedio}</span>
            <span className="text-sm text-gray-400">({total})</span>
          </div>
        )}
      </div>

      {/* Lista de reseñas */}
      {resenas.length === 0 ? (
        <p className="text-sm text-gray-400">Aún no hay reseñas para este producto.</p>
      ) : (
        <div className="flex flex-col gap-4 mb-6">
          {resenas.map((r: any) => (
            <div key={r.id} className="bg-gray-50 rounded-xl p-4 flex flex-col gap-1.5">
              <div className="flex items-center justify-between gap-2 flex-wrap">
                <div className="flex items-center gap-2">
                  <Estrellas valor={r.rating} readonly size="sm" />
                  <span className="text-sm font-semibold text-gray-700">{r.autor}</span>
                </div>
                <span className="text-xs text-gray-400">{r.created_at}</span>
              </div>
              {r.comentario && (
                <p className="text-sm text-gray-600 leading-relaxed">{r.comentario}</p>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Formulario */}
      {autenticado && (
        <div className="border border-gray-200 rounded-2xl p-5 flex flex-col gap-4">
          <h3 className="text-sm font-bold text-gray-800">Tu reseña</h3>

          {miResena ? (
            <div className={`flex items-start gap-2 text-sm rounded-xl p-3 ${
              miResena.estado === 'publicado' ? 'bg-green-50 text-green-700' :
              miResena.estado === 'rechazado' ? 'bg-red-50 text-red-600' :
              'bg-amber-50 text-amber-700'
            }`}>
              <CheckCircle className="w-4 h-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-medium">
                  {miResena.estado === 'publicado'  && 'Tu reseña está publicada'}
                  {miResena.estado === 'pendiente'  && 'Tu reseña está pendiente de revisión'}
                  {miResena.estado === 'rechazado'  && 'Tu reseña no pudo ser publicada'}
                </p>
                {miResena.comentario && <p className="mt-0.5 opacity-80">{miResena.comentario}</p>}
              </div>
            </div>
          ) : enviado ? (
            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 rounded-xl p-3">
              <CheckCircle className="w-4 h-4 shrink-0" />
              Tu reseña fue enviada y será publicada tras una breve revisión.
            </div>
          ) : !puedeResenar ? (
            <p className="text-sm text-gray-400">Solo puedes reseñar productos que hayas recibido.</p>
          ) : (
            <>
              <div className="flex flex-col gap-1.5">
                <p className="text-xs text-gray-500 font-medium">Calificación *</p>
                <Estrellas valor={hover || rating} onHover={setHover} onClick={setRating} />
              </div>

              <div className="flex flex-col gap-1.5">
                <p className="text-xs text-gray-500 font-medium">Comentario (opcional)</p>
                <textarea
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  maxLength={1000}
                  rows={3}
                  placeholder="Comparte tu experiencia con este producto..."
                  className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
                />
                <p className="text-xs text-gray-400 text-right">{comentario.length}/1000</p>
              </div>

              {error && <p className="text-xs text-red-500">{error}</p>}

              <button
                onClick={handleEnviar}
                disabled={isPending}
                className="self-start flex items-center gap-2 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-colors"
              >
                {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                Enviar reseña
              </button>
            </>
          )}
        </div>
      )}
    </section>
  )
}

// ── Preguntas ─────────────────────────────────────────────────────────────────

function SeccionPreguntas({ productoId }: { productoId: number }) {
  const token       = useCuenta((s) => s.token)
  const autenticado = useCuenta((s) => s.autenticado)
  const queryClient = useQueryClient()

  const { data } = useQuery({
    queryKey: ['preguntas', productoId],
    queryFn:  () => tiendaApi.preguntas.listar(productoId),
  })

  const preguntas = data?.preguntas ?? []

  const [pregunta, setPregunta] = useState('')
  const [enviado,  setEnviado]  = useState(false)
  const [error,    setError]    = useState('')

  const { mutate, isPending } = useMutation({
    mutationFn: () => tiendaApi.preguntas.crear(productoId, token!, { pregunta: pregunta.trim() }),
    onSuccess: () => {
      setEnviado(true)
      setPregunta('')
      queryClient.invalidateQueries({ queryKey: ['preguntas', productoId] })
    },
    onError: async (err: any) => {
      let body: any = null
      try { body = await err?.response?.json() } catch {}
      setError(body?.message ?? 'No se pudo enviar la pregunta.')
    },
  })

  const handleEnviar = () => {
    if (!pregunta.trim()) { setError('Escribe tu pregunta.'); return }
    setError('')
    mutate()
  }

  return (
    <section>
      <div className="flex items-center gap-2 mb-5">
        <MessageCircle className="w-5 h-5 text-gray-500" />
        <h2 className="text-lg font-bold text-gray-900">Preguntas y respuestas</h2>
      </div>

      {/* Lista de preguntas respondidas */}
      {preguntas.length === 0 ? (
        <p className="text-sm text-gray-400 mb-5">Aún no hay preguntas respondidas para este producto.</p>
      ) : (
        <div className="flex flex-col gap-4 mb-6">
          {preguntas.map((p: any) => (
            <div key={p.id} className="flex flex-col rounded-2xl overflow-hidden border border-gray-200">
              {/* Pregunta */}
              <div className="flex items-start gap-3 px-4 py-3 bg-gray-50">
                <span className="shrink-0 mt-0.5 text-[11px] font-bold uppercase tracking-wide bg-gray-200 text-gray-600 px-1.5 py-0.5 rounded">
                  Pregunta
                </span>
                <p className="text-sm text-gray-800 font-medium leading-snug">{p.pregunta}</p>
              </div>
              {/* Respuesta */}
              <div className="flex items-start gap-3 px-4 py-3 bg-white border-t border-gray-100">
                <span className="shrink-0 mt-0.5 text-[11px] font-bold uppercase tracking-wide bg-green-100 text-green-700 px-1.5 py-0.5 rounded">
                  Respuesta
                </span>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-gray-700 leading-snug">{p.respuesta}</p>
                  <p className="text-xs text-gray-400 mt-1">{p.created_at}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Formulario */}
      {autenticado && (
        <div className="border border-gray-200 rounded-2xl p-5 flex flex-col gap-3">
          <h3 className="text-sm font-bold text-gray-800">Hacer una pregunta</h3>

          {enviado ? (
            <div className="flex items-center gap-2 text-sm text-green-700 bg-green-50 rounded-xl p-3">
              <CheckCircle className="w-4 h-4 shrink-0" />
              Tu pregunta fue enviada. Te notificaremos cuando sea respondida.
            </div>
          ) : (
            <>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={pregunta}
                  onChange={(e) => { setPregunta(e.target.value); setError('') }}
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleEnviar())}
                  maxLength={500}
                  placeholder="¿Tienes alguna duda sobre este producto?"
                  className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-green-500"
                />
                <button
                  onClick={handleEnviar}
                  disabled={isPending}
                  className="flex items-center gap-1.5 bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-sm font-semibold px-4 py-2.5 rounded-xl transition-colors shrink-0"
                >
                  {isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                  Enviar
                </button>
              </div>
              {error && <p className="text-xs text-red-500">{error}</p>}
            </>
          )}
        </div>
      )}

      {!autenticado && preguntas.length === 0 && (
        <p className="text-sm text-gray-400">Inicia sesión para hacer una pregunta.</p>
      )}
      {!autenticado && preguntas.length > 0 && (
        <p className="text-sm text-gray-400 border border-gray-100 rounded-xl px-4 py-3">
          <a href="/auth/login" className="text-green-600 hover:underline font-medium">Inicia sesión</a> para hacer una pregunta.
        </p>
      )}
    </section>
  )
}

// ── Componente de estrellas ───────────────────────────────────────────────────

function Estrellas({
  valor, readonly = false, size = 'md', onHover, onClick,
}: {
  valor: number
  readonly?: boolean
  size?: 'sm' | 'md'
  onHover?: (v: number) => void
  onClick?: (v: number) => void
}) {
  const sz = size === 'sm' ? 'w-3.5 h-3.5' : 'w-6 h-6'

  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((i) => (
        <Star
          key={i}
          className={`${sz} transition-colors ${
            i <= valor
              ? 'fill-yellow-400 text-yellow-400'
              : 'fill-gray-200 text-gray-200'
          } ${!readonly ? 'cursor-pointer hover:fill-yellow-300 hover:text-yellow-300' : ''}`}
          onMouseEnter={() => !readonly && onHover?.(i)}
          onMouseLeave={() => !readonly && onHover?.(0)}
          onClick={() => !readonly && onClick?.(i)}
        />
      ))}
    </div>
  )
}
