'use client'

import Link from 'next/link'
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Eye, EyeOff, Loader2 } from 'lucide-react'
import { tiendaApi } from '@/lib/api'
import { useCuenta } from '@/store/cuenta'

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'https://api.logickem.com/api'

export default function RegistroPage() {
  const router        = useRouter()
  const iniciarSesion = useCuenta((s) => s.iniciarSesion)
  const autenticado   = useCuenta((s) => s.autenticado)

  const [form, setForm] = useState({
    nombre: '', apellido: '', email: '',
    password: '', password_confirmation: '', telefono: '',
  })
  const [verPass, setVerPass]         = useState(false)
  const [verPass2, setVerPass2]       = useState(false)
  const [cargando, setCargando]       = useState(false)
  const [errores, setErrores]         = useState<Record<string, string>>({})
  const [errorGen, setErrorGen]       = useState('')
  const [aceptaTerminos, setAceptaTerminos] = useState(false)

  useEffect(() => {
    if (autenticado) router.replace('/cuenta')
  }, [autenticado, router])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((prev) => ({ ...prev, [e.target.name]: e.target.value }))
    setErrores((prev) => ({ ...prev, [e.target.name]: '' }))
    setErrorGen('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setCargando(true)
    setErrores({})
    setErrorGen('')

    try {
      const payload = {
        nombre:                form.nombre,
        apellido:              form.apellido,
        email:                 form.email,
        password:              form.password,
        password_confirmation: form.password_confirmation,
        ...(form.telefono ? { telefono: form.telefono } : {}),
      }
      const res = await tiendaApi.auth.registro(payload)
      iniciarSesion(res.token, res.cuenta)
      router.push('/cuenta')
    } catch (err: any) {
      const body = await err?.response?.json?.() ?? null

      if (body?.errors) {
        const mapeados: Record<string, string> = {}
        Object.entries(body.errors).forEach(([key, msgs]: any) => {
          mapeados[key] = Array.isArray(msgs) ? msgs[0] : msgs
        })
        setErrores(mapeados)
      } else {
        setErrorGen(body?.message ?? 'Error al crear la cuenta. Intenta de nuevo.')
      }
    } finally {
      setCargando(false)
    }
  }

  const campo = (
    name: keyof typeof form,
    label: string,
    type = 'text',
    placeholder = '',
    autoComplete = '',
  ) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-gray-700">
        {label}
        {name === 'telefono' && <span className="text-gray-400 font-normal ml-1">(opcional)</span>}
      </label>
      <input
        type={type}
        name={name}
        value={form[name]}
        onChange={handleChange}
        placeholder={placeholder}
        autoComplete={autoComplete}
        className={`w-full px-4 py-2.5 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors ${
          errores[name] ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'
        }`}
      />
      {errores[name] && <p className="text-xs text-red-600">{errores[name]}</p>}
    </div>
  )

  const campoPassword = (
    name: 'password' | 'password_confirmation',
    label: string,
    ver: boolean,
    setVer: (v: boolean) => void,
    autoComplete: string,
  ) => (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-semibold text-gray-700">{label}</label>
      <div className="relative">
        <input
          type={ver ? 'text' : 'password'}
          name={name}
          value={form[name]}
          onChange={handleChange}
          placeholder="••••••••"
          autoComplete={autoComplete}
          className={`w-full px-4 py-2.5 pr-10 rounded-xl border text-sm focus:outline-none focus:ring-2 focus:ring-green-500 transition-colors ${
            errores[name] ? 'border-red-400 bg-red-50' : 'border-gray-200 bg-gray-50 focus:bg-white'
          }`}
        />
        <button
          type="button"
          onClick={() => setVer(!ver)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
        >
          {ver ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {errores[name] && <p className="text-xs text-red-600">{errores[name]}</p>}
    </div>
  )

  return (
    <div className="min-h-[calc(100vh-10rem)] flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">

        {/* Encabezado */}
        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Crear cuenta</h1>
          <p className="text-sm text-gray-500 mt-1">
            ¿Ya tienes cuenta?{' '}
            <Link href="/auth/login" className="text-green-600 font-semibold hover:underline">
              Inicia sesión
            </Link>
          </p>
        </div>

        {/* Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-white border border-gray-200 rounded-2xl shadow-sm px-8 py-8 flex flex-col gap-5"
        >
          {errorGen && (
            <div className="bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl px-4 py-3">
              {errorGen}
            </div>
          )}

          {/* Nombre y apellido en fila */}
          <div className="grid grid-cols-2 gap-3">
            {campo('nombre',   'Nombre',   'text', 'Juan',   'given-name')}
            {campo('apellido', 'Apellido', 'text', 'García', 'family-name')}
          </div>

          {campo('email',    'Correo electrónico', 'email', 'tu@correo.com', 'email')}
          {campo('telefono', 'Teléfono',           'tel',   '5555-0000',     'tel')}

          {campoPassword('password',              'Contraseña',          verPass,  setVerPass,  'new-password')}
          {campoPassword('password_confirmation', 'Confirmar contraseña', verPass2, setVerPass2, 'new-password')}

          {/* Aceptación de términos */}
          <label className="flex items-start gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={aceptaTerminos}
              onChange={(e) => setAceptaTerminos(e.target.checked)}
              className="mt-0.5 h-4 w-4 rounded border-gray-300 text-green-600 accent-green-600 cursor-pointer"
            />
            <span className="text-sm text-gray-600 leading-snug">
              He leído y acepto los{' '}
              <Link href="/terminos" target="_blank" className="text-green-600 font-semibold hover:underline">
                Términos de servicio
              </Link>{' '}
              y la{' '}
              <Link href="/privacidad" target="_blank" className="text-green-600 font-semibold hover:underline">
                Política de privacidad
              </Link>
            </span>
          </label>

          <button
            type="submit"
            disabled={cargando || !aceptaTerminos}
            className="w-full py-2.5 rounded-xl bg-green-600 hover:bg-green-700 disabled:opacity-60 disabled:cursor-not-allowed text-white text-sm font-semibold transition-colors flex items-center justify-center gap-2 mt-1"
          >
            {cargando && <Loader2 className="w-4 h-4 animate-spin" />}
            {cargando ? 'Creando cuenta...' : 'Crear cuenta'}
          </button>

          {/* Separador */}
          <div className="flex items-center gap-3 my-1">
            <div className="flex-1 border-t border-gray-200" />
            <span className="text-xs text-gray-400">o regístrate con</span>
            <div className="flex-1 border-t border-gray-200" />
          </div>

          {/* Google */}
          <a
            href={`${API_URL}/tienda/auth/google`}
            className="w-full flex items-center justify-center gap-3 py-2.5 rounded-xl border border-gray-200 bg-white hover:bg-gray-50 text-sm font-medium text-gray-700 transition-colors"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
            </svg>
            Continuar con Google
          </a>
        </form>
      </div>
    </div>
  )
}