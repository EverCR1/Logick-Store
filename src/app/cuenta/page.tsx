'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { useCuenta } from '@/store/cuenta'
import { tiendaApi } from '@/lib/api'
import { Loader2, CheckCircle, AlertCircle, Eye, EyeOff } from 'lucide-react'

export default function CuentaPage() {
  const cuenta          = useCuenta((s) => s.cuenta)
  const token           = useCuenta((s) => s.token)
  const actualizarCuenta = useCuenta((s) => s.actualizarCuenta)

  const { data: puntosData } = useQuery({
    queryKey: ['cuenta-puntos'],
    queryFn:  () => tiendaApi.cuenta.puntos.listar(token!),
    enabled:  !!token,
    staleTime: 0,
  })

  // ── Perfil ────────────────────────────────────────────────────────────────
  const [perfil, setPerfil] = useState({
    nombre:   cuenta?.nombre   ?? '',
    apellido: cuenta?.apellido ?? '',
    email:    cuenta?.email    ?? '',
    telefono: cuenta?.telefono ?? '',
  })
  const [guardandoPerfil, setGuardandoPerfil] = useState(false)
  const [okPerfil,        setOkPerfil]        = useState(false)
  const [errPerfil,       setErrPerfil]       = useState('')
  const [erroresPerfil,   setErroresPerfil]   = useState<Record<string, string>>({})

  const handlePerfilChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPerfil((p) => ({ ...p, [e.target.name]: e.target.value }))
    setErroresPerfil((p) => ({ ...p, [e.target.name]: '' }))
    setErrPerfil('')
    setOkPerfil(false)
  }

  const handlePerfilSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return
    setGuardandoPerfil(true)
    setErrPerfil('')
    setOkPerfil(false)
    setErroresPerfil({})
    try {
      const res = await tiendaApi.auth.actualizarPerfil(token, {
        nombre:   perfil.nombre,
        apellido: perfil.apellido,
        email:    perfil.email,
        ...(perfil.telefono ? { telefono: perfil.telefono } : {}),
      })
      actualizarCuenta(res.cuenta)
      setOkPerfil(true)
    } catch (err: any) {
      const body = await err?.response?.json?.() ?? null
      if (body?.errors) {
        const mapeados: Record<string, string> = {}
        Object.entries(body.errors).forEach(([k, v]: any) => {
          mapeados[k] = Array.isArray(v) ? v[0] : v
        })
        setErroresPerfil(mapeados)
      } else {
        setErrPerfil(body?.message ?? 'Error al guardar los cambios.')
      }
    } finally {
      setGuardandoPerfil(false)
    }
  }

  // ── Contraseña ────────────────────────────────────────────────────────────
  const [pass, setPass] = useState({
    password_actual: '', password: '', password_confirmation: '',
  })
  const [verPass, setVerPass]   = useState<Record<string, boolean>>({})
  const [guardandoPass, setGuardandoPass] = useState(false)
  const [okPass,        setOkPass]        = useState(false)
  const [errPass,       setErrPass]       = useState('')
  const [erroresPass,   setErroresPass]   = useState<Record<string, string>>({})

  const handlePassChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPass((p) => ({ ...p, [e.target.name]: e.target.value }))
    setErroresPass((p) => ({ ...p, [e.target.name]: '' }))
    setErrPass('')
    setOkPass(false)
  }

  const handlePassSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!token) return
    setGuardandoPass(true)
    setErrPass('')
    setOkPass(false)
    setErroresPass({})
    try {
      await tiendaApi.auth.cambiarPassword(token, {
        password_actual:       pass.password_actual,
        password:              pass.password,
        password_confirmation: pass.password_confirmation,
      })
      setOkPass(true)
      setPass({ password_actual: '', password: '', password_confirmation: '' })
    } catch (err: any) {
      const body = await err?.response?.json?.() ?? null
      if (body?.errors) {
        const mapeados: Record<string, string> = {}
        Object.entries(body.errors).forEach(([k, v]: any) => {
          mapeados[k] = Array.isArray(v) ? v[0] : v
        })
        setErroresPass(mapeados)
      } else {
        setErrPass(body?.message ?? 'Error al cambiar la contraseña.')
      }
    } finally {
      setGuardandoPass(false)
    }
  }

  if (!cuenta) return null

  return (
    <div className="flex flex-col gap-6">

      {/* Cabecera */}
      <div>
        <h1 className="text-xl font-bold text-gray-900">Mi perfil</h1>
        <p className="text-sm text-gray-500 mt-0.5">Administra tu información personal</p>
      </div>

      {/* Puntos */}
      <div className="bg-green-50 border border-green-200 rounded-2xl px-6 py-4 flex items-center justify-between">
        <div>
          <p className="text-sm text-green-700 font-medium">Puntos acumulados</p>
          <p className="text-2xl font-bold text-green-800">
            {(puntosData?.saldo ?? cuenta.puntos_saldo ?? 0).toLocaleString()}
          </p>
        </div>
        <div className="w-12 h-12 rounded-full bg-green-200 flex items-center justify-center">
          <span className="text-2xl">🎯</span>
        </div>
      </div>

      {/* Editar perfil */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-5">Datos personales</h2>
        <form onSubmit={handlePerfilSubmit} className="flex flex-col gap-4">

          {errPerfil && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {errPerfil}
            </div>
          )}
          {okPerfil && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3">
              <CheckCircle className="w-4 h-4 shrink-0" />
              Cambios guardados correctamente.
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {([
              ['nombre',   'Nombre',   'given-name'],
              ['apellido', 'Apellido', 'family-name'],
            ] as const).map(([name, label, auto]) => (
              <div key={name} className="flex flex-col gap-1.5">
                <label className="text-sm font-semibold text-gray-700">{label}</label>
                <input
                  type="text"
                  name={name}
                  value={perfil[name]}
                  onChange={handlePerfilChange}
                  autoComplete={auto}
                  className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors ${
                    erroresPerfil[name] ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'
                  }`}
                />
                {erroresPerfil[name] && <p className="text-xs text-red-600">{erroresPerfil[name]}</p>}
              </div>
            ))}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">Correo electrónico</label>
            <input
              type="email"
              name="email"
              value={perfil.email}
              onChange={handlePerfilChange}
              autoComplete="email"
              className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors ${
                erroresPerfil.email ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'
              }`}
            />
            {erroresPerfil.email && <p className="text-xs text-red-600">{erroresPerfil.email}</p>}
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="text-sm font-semibold text-gray-700">
              Teléfono <span className="text-gray-400 font-normal">(opcional)</span>
            </label>
            <input
              type="tel"
              name="telefono"
              value={perfil.telefono}
              onChange={handlePerfilChange}
              autoComplete="tel"
              className="w-full px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors"
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={guardandoPerfil}
              className="px-6 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-sm font-semibold transition-colors flex items-center gap-2"
            >
              {guardandoPerfil && <Loader2 className="w-4 h-4 animate-spin" />}
              {guardandoPerfil ? 'Guardando...' : 'Guardar cambios'}
            </button>
          </div>
        </form>
      </div>

      {/* Cambiar contraseña */}
      <div className="bg-white border border-gray-200 rounded-2xl p-6">
        <h2 className="text-base font-semibold text-gray-800 mb-1">Contraseña</h2>
        <p className="text-sm text-gray-400 mb-5">Mínimo 8 caracteres</p>
        <form onSubmit={handlePassSubmit} className="flex flex-col gap-4">

          {errPass && (
            <div className="flex items-center gap-2 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
              <AlertCircle className="w-4 h-4 shrink-0" />
              {errPass}
            </div>
          )}
          {okPass && (
            <div className="flex items-center gap-2 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl px-4 py-3">
              <CheckCircle className="w-4 h-4 shrink-0" />
              Contraseña actualizada correctamente.
            </div>
          )}

          {([
            ['password_actual',       'Contraseña actual',          'current-password'],
            ['password',              'Nueva contraseña',            'new-password'],
            ['password_confirmation', 'Confirmar nueva contraseña',  'new-password'],
          ] as const).map(([name, label, auto]) => (
            <div key={name} className="flex flex-col gap-1.5">
              <label className="text-sm font-semibold text-gray-700">{label}</label>
              <div className="relative">
                <input
                  type={verPass[name] ? 'text' : 'password'}
                  name={name}
                  value={pass[name]}
                  onChange={handlePassChange}
                  placeholder="••••••••"
                  autoComplete={auto}
                  className={`w-full px-4 py-2.5 pr-10 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors ${
                    erroresPass[name] ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'
                  }`}
                />
                <button
                  type="button"
                  onClick={() => setVerPass((p) => ({ ...p, [name]: !p[name] }))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  {verPass[name] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {erroresPass[name] && <p className="text-xs text-red-600">{erroresPass[name]}</p>}
            </div>
          ))}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={guardandoPass}
              className="px-6 py-2.5 rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white text-sm font-semibold transition-colors flex items-center gap-2"
            >
              {guardandoPass && <Loader2 className="w-4 h-4 animate-spin" />}
              {guardandoPass ? 'Actualizando...' : 'Cambiar contraseña'}
            </button>
          </div>
        </form>
      </div>

      {/* Info cuenta */}
      <div className="bg-gray-50 border border-gray-200 rounded-2xl px-6 py-4 flex flex-col gap-1 text-sm text-gray-500">
        <p>Miembro desde: <span className="font-medium text-gray-700">{new Date(cuenta.creado_en).toLocaleDateString('es-GT', { year: 'numeric', month: 'long', day: 'numeric' })}</span></p>
        <p>Estado de cuenta: <span className={`font-medium ${cuenta.estado === 'activo' ? 'text-green-600' : 'text-red-500'}`}>{cuenta.estado}</span></p>
      </div>
    </div>
  )
}