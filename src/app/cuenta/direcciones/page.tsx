'use client'

import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useCuenta } from '@/store/cuenta'
import { tiendaApi } from '@/lib/api'
import { MapPin, Plus, Pencil, Trash2, Loader2, Star, X } from 'lucide-react'

interface Direccion {
  id: number
  alias: string | null
  nombre_receptor: string
  telefono: string
  departamento: string
  municipio: string
  direccion: string
  referencias: string | null
  es_principal: boolean
}

interface FormState {
  alias: string
  nombre_receptor: string
  telefono: string
  departamento: string
  municipio: string
  direccion: string
  referencias: string
}

const FORM_VACIO: FormState = {
  alias: '', nombre_receptor: '', telefono: '',
  departamento: '', municipio: '', direccion: '', referencias: '',
}

export default function DireccionesPage() {
  const token        = useCuenta((s) => s.token)
  const queryClient  = useQueryClient()

  const [modal, setModal]       = useState<'nuevo' | 'editar' | null>(null)
  const [editando, setEditando] = useState<Direccion | null>(null)
  const [form, setForm]         = useState<FormState>(FORM_VACIO)
  const [errores, setErrores]   = useState<Record<string, string>>({})
  const [errGen, setErrGen]     = useState('')

  const { data, isLoading } = useQuery({
    queryKey: ['cuenta-direcciones'],
    queryFn:  () => tiendaApi.cuenta.direcciones.listar(token!),
    enabled:  !!token,
  })

  const guardar = useMutation({
    mutationFn: () =>
      editando
        ? tiendaApi.cuenta.direcciones.actualizar(token!, editando.id, form)
        : tiendaApi.cuenta.direcciones.crear(token!, form),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cuenta-direcciones'] })
      cerrarModal()
    },
    onError: async (err: any) => {
      const body = await err?.response?.json?.() ?? null
      if (body?.errors) {
        const m: Record<string, string> = {}
        Object.entries(body.errors).forEach(([k, v]: any) => { m[k] = Array.isArray(v) ? v[0] : v })
        setErrores(m)
      } else {
        setErrGen(body?.message ?? 'Error al guardar.')
      }
    },
  })

  const eliminar = useMutation({
    mutationFn: (id: number) => tiendaApi.cuenta.direcciones.eliminar(token!, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cuenta-direcciones'] }),
  })

  const marcarPrincipal = useMutation({
    mutationFn: (id: number) => tiendaApi.cuenta.direcciones.marcarPrincipal(token!, id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['cuenta-direcciones'] }),
  })

  const abrirNuevo = () => {
    setEditando(null)
    setForm(FORM_VACIO)
    setErrores({})
    setErrGen('')
    setModal('nuevo')
  }

  const abrirEditar = (d: Direccion) => {
    setEditando(d)
    setForm({
      alias:           d.alias ?? '',
      nombre_receptor: d.nombre_receptor,
      telefono:        d.telefono,
      departamento:    d.departamento,
      municipio:       d.municipio,
      direccion:       d.direccion,
      referencias:     d.referencias ?? '',
    })
    setErrores({})
    setErrGen('')
    setModal('editar')
  }

  const cerrarModal = () => {
    setModal(null)
    setEditando(null)
    setForm(FORM_VACIO)
    setErrores({})
    setErrGen('')
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((p) => ({ ...p, [e.target.name]: e.target.value }))
    setErrores((p) => ({ ...p, [e.target.name]: '' }))
    setErrGen('')
  }

  const campo = (name: keyof FormState, label: string, required = true, type = 'text') => (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-gray-700">
        {label}
        {!required && <span className="text-gray-400 font-normal ml-1">(opcional)</span>}
      </label>
      <input
        type={type}
        name={name}
        value={form[name]}
        onChange={handleChange}
        className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors ${
          errores[name] ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'
        }`}
      />
      {errores[name] && <p className="text-xs text-red-600">{errores[name]}</p>}
    </div>
  )

  const direcciones: Direccion[] = data?.direcciones ?? []

  return (
    <div className="flex flex-col gap-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Direcciones</h1>
          <p className="text-sm text-gray-500 mt-0.5">Tus direcciones de entrega guardadas</p>
        </div>
        <button
          onClick={abrirNuevo}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white text-sm font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" />
          Nueva
        </button>
      </div>

      {isLoading && (
        <div className="flex items-center justify-center py-16 text-gray-400">
          <Loader2 className="w-6 h-6 animate-spin" />
        </div>
      )}

      {!isLoading && direcciones.length === 0 && (
        <div className="flex flex-col items-center justify-center py-16 gap-4 text-center">
          <div className="w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center">
            <MapPin className="w-8 h-8 text-gray-300" />
          </div>
          <div>
            <p className="text-gray-700 font-medium">Sin direcciones guardadas</p>
            <p className="text-sm text-gray-400 mt-1">Agrega una para agilizar el proceso de compra</p>
          </div>
          <button onClick={abrirNuevo} className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-green-600 text-white text-sm font-semibold hover:bg-green-700 transition-colors">
            <Plus className="w-4 h-4" />
            Agregar dirección
          </button>
        </div>
      )}

      {direcciones.length > 0 && (
        <div className="flex flex-col gap-3">
          {direcciones.map((d) => (
            <div key={d.id} className={`bg-white border rounded-2xl px-5 py-4 flex items-start gap-4 ${d.es_principal ? 'border-green-300' : 'border-gray-200'}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${d.es_principal ? 'bg-green-100' : 'bg-gray-100'}`}>
                <MapPin className={`w-5 h-5 ${d.es_principal ? 'text-green-600' : 'text-gray-400'}`} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-0.5">
                  <p className="text-sm font-semibold text-gray-800">{d.alias ?? 'Sin etiqueta'}</p>
                  {d.es_principal && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Principal</span>
                  )}
                </div>
                <p className="text-sm text-gray-600">{d.nombre_receptor} · {d.telefono}</p>
                <p className="text-sm text-gray-500">{d.direccion}</p>
                <p className="text-sm text-gray-500">{d.municipio}, {d.departamento}</p>
                {d.referencias && <p className="text-xs text-gray-400 mt-0.5">{d.referencias}</p>}
              </div>
              <div className="flex flex-col gap-1 shrink-0">
                {!d.es_principal && (
                  <button
                    onClick={() => marcarPrincipal.mutate(d.id)}
                    className="p-2 rounded-lg text-gray-400 hover:text-yellow-500 hover:bg-yellow-50 transition-colors"
                    title="Marcar como principal"
                  >
                    <Star className="w-4 h-4" />
                  </button>
                )}
                <button
                  onClick={() => abrirEditar(d)}
                  className="p-2 rounded-lg text-gray-400 hover:text-blue-500 hover:bg-blue-50 transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                </button>
                <button
                  onClick={() => eliminar.mutate(d.id)}
                  className="p-2 rounded-lg text-gray-400 hover:text-red-500 hover:bg-red-50 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal */}
      {modal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
              <h2 className="text-base font-bold text-gray-800">
                {modal === 'editar' ? 'Editar dirección' : 'Nueva dirección'}
              </h2>
              <button onClick={cerrarModal} className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <form
              onSubmit={(e) => { e.preventDefault(); guardar.mutate() }}
              className="px-6 py-5 flex flex-col gap-4"
            >
              {errGen && (
                <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">{errGen}</div>
              )}
              {campo('alias',           'Etiqueta (ej: Casa, Trabajo)', false)}
              {campo('nombre_receptor', 'Nombre del receptor')}
              {campo('telefono',        'Teléfono', true, 'tel')}
              <div className="grid grid-cols-2 gap-3">
                {campo('departamento', 'Departamento')}
                {campo('municipio',    'Municipio')}
              </div>
              {campo('direccion',   'Dirección')}
              {campo('referencias', 'Referencia', false)}

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={cerrarModal} className="px-5 py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={guardar.isPending}
                  className="px-5 py-2 rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-sm font-semibold transition-colors flex items-center gap-2"
                >
                  {guardar.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                  {guardar.isPending ? 'Guardando...' : 'Guardar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}