'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { ChevronLeft, ShoppingBag, CheckCircle, Upload, X, MapPin, Plus, Loader2, Tag, XCircle, Store, Truck, CreditCard, Phone } from 'lucide-react'
import { useCarrito } from '@/store/carrito'
import { useCuenta } from '@/store/cuenta'
import { tiendaApi } from '@/lib/api'
import { formatPrecio } from '@/lib/utils'
import { MUNICIPIOS_POR_DEPARTAMENTO } from '@/data/municipios'
import { useQuery } from '@tanstack/react-query'

const COSTO_ENVIO_BASE    = 35
const MINIMO_ENVIO_GRATIS = 500
const LIMITE_EFECTIVO     = 1000

const DEPARTAMENTOS = Object.keys(MUNICIPIOS_POR_DEPARTAMENTO).sort()

interface Sucursal {
  id:           number
  nombre:       string
  departamento: string | null
  municipio:    string | null
  direccion:    string | null
  referencia:   string | null
  horario:      string | null
  telefono:     string | null
}

const METODOS_PAGO = [
  { value: 'efectivo',               label: 'Efectivo contra entrega' },
  { value: 'deposito_transferencia', label: 'Depósito / Transferencia' },
  { value: 'tarjeta',                label: 'Tarjeta' },
]

interface FormData {
  nombre:       string
  telefono:     string
  email:        string
  departamento: string
  municipio:    string
  direccion:    string
  referencias:  string
  metodo_pago:  string
  notas:        string
}

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

const FORM_INICIAL: FormData = {
  nombre: '', telefono: '', email: '', departamento: '',
  municipio: '', direccion: '', referencias: '',
  metodo_pago: 'efectivo', notas: '',
}

export default function CheckoutForm() {
  const { items, total, vaciar } = useCarrito()
  const cuenta      = useCuenta((s) => s.cuenta)
  const token       = useCuenta((s) => s.token)
  const autenticado = useCuenta((s) => s.autenticado)

  const formInicial: FormData = autenticado && cuenta ? {
    ...FORM_INICIAL,
    nombre:   cuenta.nombre_completo,
    email:    cuenta.email,
    telefono: cuenta.telefono ?? '',
  } : FORM_INICIAL

  const [form, setForm]         = useState<FormData>(formInicial)
  const [errores, setErrores]   = useState<Partial<FormData>>({})
  const [enviando, setEnviando] = useState(false)

  // Tipo de entrega
  const [tipoEntrega,    setTipoEntrega]    = useState<'domicilio' | 'tienda'>('domicilio')
  const [sucursalId,     setSucursalId]     = useState<number | null>(null)

  // Dirección seleccionada: id de dirección guardada o 'nueva'
  const [direccionSeleccionada, setDireccionSeleccionada] = useState<number | 'nueva' | null>(null)

  // Cupón
  const [codigoCupon,    setCodigoCupon]    = useState('')
  const [cuponAplicado,  setCuponAplicado]  = useState<{
    cupon_id: number; codigo: string; descripcion: string | null
    tipo: 'porcentaje' | 'monto_fijo'; valor: number; descuento: number
  } | null>(null)
  const [validandoCupon, setValidandoCupon] = useState(false)
  const [errorCupon,     setErrorCupon]     = useState('')

  // Aceptación de términos (solo invitados)
  const [aceptaTerminos, setAceptaTerminos] = useState(false)

  // Estado post-pedido
  const [numeroPedido,       setNumeroPedido]       = useState<string | null>(null)
  const [requiereComprobante, setRequiereComprobante] = useState(false)
  const [requiereTarjeta,    setRequiereTarjeta]    = useState(false)

  // Subida de comprobante (paso 2)
  const [comprobante,        setComprobante]        = useState<File | null>(null)
  const [comprobantePreview, setComprobantePreview] = useState<string | null>(null)
  const [errorComprobante,   setErrorComprobante]   = useState('')
  const [subiendo,           setSubiendo]           = useState(false)
  const [comprobanteEnviado, setComprobanteEnviado] = useState(false)
  const fileRef = useRef<HTMLInputElement>(null)

  // Sucursales activas desde la API
  const { data: dataSucursales } = useQuery({
    queryKey: ['tienda-sucursales'],
    queryFn:  () => tiendaApi.sucursales.listar(),
    staleTime: 1000 * 60 * 10,
  })
  const sucursales: Sucursal[] = dataSucursales?.sucursales ?? []

  const aplicarSucursal = (suc: Sucursal) => {
    const partes = [suc.direccion, suc.municipio, suc.departamento].filter(Boolean)
    setForm((f) => ({
      ...f,
      departamento: suc.departamento ?? '',
      municipio:    suc.municipio    ?? '',
      direccion:    partes.join(', '),
      referencias:  '',
    }))
  }

  // Seleccionar la primera sucursal automáticamente cuando carguen
  useEffect(() => {
    if (sucursalId !== null || sucursales.length === 0) return
    const primera = sucursales[0]
    setSucursalId(primera.id)
    if (tipoEntrega === 'tienda') aplicarSucursal(primera)
  }, [sucursales]) // eslint-disable-line react-hooks/exhaustive-deps

  // Direcciones guardadas (solo si autenticado)
  const {
    data: dataDirecciones,
    isLoading: cargandoDirecciones,
    isSuccess: direccionesListas,
  } = useQuery({
    queryKey: ['cuenta-direcciones-checkout'],
    queryFn:  () => tiendaApi.cuenta.direcciones.listar(token!),
    enabled:  autenticado && !!token,
    staleTime: 1000 * 60 * 5,
  })

  const direccionesGuardadas: Direccion[] = dataDirecciones?.direcciones ?? []

  // Auto-seleccionar la dirección principal cuando la query termine (no antes)
  useEffect(() => {
    if (!autenticado || !direccionesListas || direccionSeleccionada !== null || tipoEntrega === 'tienda') return
    if (direccionesGuardadas.length === 0) {
      setDireccionSeleccionada('nueva')
      return
    }
    const principal = direccionesGuardadas.find((d) => d.es_principal) ?? direccionesGuardadas[0]
    aplicarDireccion(principal)
  }, [direccionesListas, autenticado]) // eslint-disable-line react-hooks/exhaustive-deps

  const aplicarDireccion = (d: Direccion) => {
    setDireccionSeleccionada(d.id)
    setForm((f) => ({
      ...f,
      nombre:       d.nombre_receptor,
      telefono:     d.telefono,
      departamento: d.departamento,
      municipio:    d.municipio,
      direccion:    d.direccion,
      referencias:  d.referencias ?? '',
    }))
    setErrores({})
  }

  const seleccionarNueva = () => {
    setDireccionSeleccionada('nueva')
    setForm((f) => ({
      ...f,
      nombre:       cuenta?.nombre_completo ?? f.nombre,
      telefono:     cuenta?.telefono        ?? '',
      departamento: '',
      municipio:    '',
      direccion:    '',
      referencias:  '',
    }))
    setErrores({})
  }

  const seleccionarTipoEntrega = (tipo: 'domicilio' | 'tienda') => {
    setTipoEntrega(tipo)
    if (tipo === 'tienda') {
      const suc = sucursales.find((s) => s.id === sucursalId) ?? sucursales[0]
      if (suc) aplicarSucursal(suc)
    } else {
      setForm((f) => ({ ...f, departamento: '', municipio: '', direccion: '', referencias: '' }))
      if (autenticado && direccionesGuardadas.length > 0) {
        const principal = direccionesGuardadas.find((d) => d.es_principal) ?? direccionesGuardadas[0]
        aplicarDireccion(principal)
      } else {
        setDireccionSeleccionada('nueva')
      }
    }
    setErrores({})
  }

  const seleccionarSucursal = (id: number) => {
    setSucursalId(id)
    const suc = sucursales.find((s) => s.id === id)
    if (suc) aplicarSucursal(suc)
  }

  const handleComprobante = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setComprobante(file)
    setComprobantePreview(URL.createObjectURL(file))
    setErrorComprobante('')
  }

  const quitarComprobante = () => {
    setComprobante(null)
    setComprobantePreview(null)
    if (fileRef.current) fileRef.current.value = ''
  }

  const handleSubirComprobante = async () => {
    if (!comprobante || !numeroPedido) return
    setSubiendo(true)
    try {
      const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'https://api.logickem.com/api'
      const fd = new FormData()
      fd.append('comprobante', comprobante)
      const res = await fetch(`${BASE_URL}/tienda/pedidos/${numeroPedido}/comprobante`, {
        method:  'POST',
        headers: { 'Accept': 'application/json' },
        body:    fd,
      })
      if (!res.ok) throw new Error()
      setComprobanteEnviado(true)
    } catch {
      setErrorComprobante('No se pudo subir el comprobante. Intenta de nuevo.')
    } finally {
      setSubiendo(false)
    }
  }

  // Carrito vacío
  if (items.length === 0 && !numeroPedido) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-24 text-center gap-5">
        <ShoppingBag className="w-12 h-12 text-gray-300" />
        <div>
          <h2 className="text-xl font-bold text-gray-800">Tu carrito está vacío</h2>
          <p className="text-sm text-gray-500 mt-1">Agrega productos antes de continuar</p>
        </div>
        <Link href="/productos" className="bg-green-600 hover:bg-green-700 text-white font-semibold px-5 py-2.5 rounded-xl text-sm transition-colors">
          Ver productos
        </Link>
      </div>
    )
  }

  // Pedido creado — pantalla de éxito
  if (numeroPedido) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center px-4 py-24 text-center gap-6 max-w-lg mx-auto">
        <div className="w-20 h-20 rounded-full bg-green-50 flex items-center justify-center">
          <CheckCircle className="w-10 h-10 text-green-600" />
        </div>

        <div>
          <h2 className="text-2xl font-bold text-gray-900">¡Pedido recibido!</h2>
          <p className="text-gray-500 mt-1">
            Número de pedido:{' '}
            <span className="font-bold text-gray-800 tracking-wide">{numeroPedido}</span>
          </p>
          <p className="text-gray-500 mt-1 text-sm">
            Te enviaremos un correo de confirmación con los detalles de tu pedido.
          </p>
        </div>

        {/* Sección tarjeta */}
        {requiereTarjeta && (
          <div className="w-full bg-blue-50 border border-blue-200 rounded-2xl p-5 flex flex-col gap-3 text-left">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-blue-600 shrink-0" />
              <p className="text-sm font-semibold text-blue-800">Pago con tarjeta</p>
            </div>
            <p className="text-sm text-blue-700">
              Tu pedido está registrado con el número{' '}
              <strong className="font-bold">{numeroPedido}</strong>.
              Puedes comunicarte a nuestro WhatsApp{' '}
              <strong className="font-bold">4710 4888</strong>{' '}
              o nos comunicaremos contigo al correo para enviarte un link de pago.
            </p>
            <div className="flex items-center gap-1.5 text-xs text-blue-600">
              <Phone className="w-3.5 h-3.5 shrink-0" />
              <span>WhatsApp: 4710 4888</span>
            </div>
          </div>
        )}

        {/* Sección comprobante */}
        {requiereComprobante && (
          <div className="w-full bg-amber-50 border border-amber-200 rounded-2xl p-5 flex flex-col gap-4 text-left">
            {comprobanteEnviado ? (
              <div className="flex items-center gap-2 text-green-700">
                <CheckCircle className="w-5 h-5 shrink-0" />
                <span className="text-sm font-medium">Comprobante recibido. Tu pedido está confirmado.</span>
              </div>
            ) : (
              <>
                <div>
                  <p className="text-sm font-semibold text-amber-800">Sube tu comprobante de pago</p>
                  <p className="text-xs text-amber-700 mt-1">
                    Al realizar la transferencia, incluye el número{' '}
                    <strong className="font-bold">{numeroPedido}</strong>{' '}
                    en la descripción para identificar tu pedido.
                  </p>
                </div>

                {comprobantePreview ? (
                  <div className="relative w-full max-w-xs">
                    <img src={comprobantePreview} alt="Comprobante" className="w-full rounded-xl border border-amber-200 object-contain max-h-48" />
                    <button type="button" onClick={quitarComprobante} className="absolute top-2 right-2 bg-white rounded-full p-1 shadow hover:bg-red-50 text-gray-500 hover:text-red-500 transition-colors">
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    className={`flex items-center gap-2 border-2 border-dashed rounded-xl px-4 py-4 text-sm transition-colors w-full ${
                      errorComprobante ? 'border-red-300 text-red-400' : 'border-amber-300 text-amber-600 hover:border-amber-500'
                    }`}
                  >
                    <Upload className="w-5 h-5 shrink-0" />
                    <span>Subir comprobante (JPG, PNG, WEBP · máx 5 MB)</span>
                  </button>
                )}

                <input ref={fileRef} type="file" accept="image/jpeg,image/png,image/jpg,image/webp" onChange={handleComprobante} className="hidden" />
                {errorComprobante && <p className="text-xs text-red-500">{errorComprobante}</p>}

                {comprobante && (
                  <button
                    type="button"
                    onClick={handleSubirComprobante}
                    disabled={subiendo}
                    className="bg-amber-500 hover:bg-amber-600 disabled:bg-amber-300 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
                  >
                    {subiendo && <Loader2 className="w-4 h-4 animate-spin" />}
                    {subiendo ? 'Enviando...' : 'Enviar comprobante'}
                  </button>
                )}
                <p className="text-xs text-amber-600">También puedes enviarlo más tarde a nuestro WhatsApp 4710 4888</p>
              </>
            )}
          </div>
        )}

        {autenticado && (
          <Link href="/cuenta/pedidos" className="text-sm text-green-600 hover:underline font-medium">
            Ver mis pedidos
          </Link>
        )}

        <Link href="/productos" className="bg-green-600 hover:bg-green-700 text-white font-semibold px-6 py-3 rounded-xl text-sm transition-colors">
          Seguir comprando
        </Link>
      </div>
    )
  }

  // ── Cálculos de totales ────────────────────────────────────────────────────
  const subtotal   = total()
  const costoEnvio = tipoEntrega === 'tienda' ? 0 : (subtotal >= MINIMO_ENVIO_GRATIS ? 0 : COSTO_ENVIO_BASE)
  const descuento  = cuponAplicado?.descuento ?? 0
  const totalFinal = subtotal + costoEnvio - descuento

  // ── Acciones de cupón ─────────────────────────────────────────────────────
  const handleAplicarCupon = async () => {
    if (!codigoCupon.trim()) return
    setValidandoCupon(true)
    setErrorCupon('')
    try {
      const res = await tiendaApi.cupones.validar(codigoCupon.trim(), total(), token)
      setCuponAplicado({
        cupon_id:    res.cupon_id,
        codigo:      res.codigo,
        descripcion: res.descripcion,
        tipo:        res.tipo,
        valor:       res.valor,
        descuento:   res.descuento,
      })
      setCodigoCupon('')
    } catch (err: any) {
      let body: any = null
      try { body = await err?.response?.json() } catch { /* sin cuerpo JSON */ }
      setErrorCupon(body?.message ?? 'Cupón no válido.')
    } finally {
      setValidandoCupon(false)
    }
  }

  const quitarCupon = () => {
    setCuponAplicado(null)
    setErrorCupon('')
  }

  const set = (field: keyof FormData, value: string) => {
    setForm((f) => ({
      ...f,
      [field]: value,
      ...(field === 'departamento' ? { municipio: '' } : {}),
    }))
    setErrores((e) => ({ ...e, [field]: '', ...(field === 'departamento' ? { municipio: '' } : {}) }))
  }

  const municipiosDisponibles = form.departamento
    ? MUNICIPIOS_POR_DEPARTAMENTO[form.departamento] ?? []
    : []

  // Nombre y teléfono bloqueados solo cuando hay dirección guardada seleccionada en modo domicilio
  const contactoBloqueado = autenticado && tipoEntrega === 'domicilio' && typeof direccionSeleccionada === 'number'

  const validar = (): boolean => {
    const e: Partial<FormData> = {}
    if (!form.nombre.trim())   e.nombre   = 'Ingresa tu nombre'
    if (!form.telefono.trim()) e.telefono = 'Ingresa tu teléfono'

    // Email solo obligatorio para invitados
    if (!autenticado && !form.email.trim()) e.email = 'Ingresa tu correo electrónico'

    // Dirección obligatoria solo si es envío a domicilio
    if (tipoEntrega === 'domicilio') {
      if (!form.departamento)      e.departamento = 'Selecciona un departamento'
      if (!form.municipio)         e.municipio    = 'Selecciona un municipio'
      if (!form.direccion.trim())  e.direccion    = 'Ingresa la dirección'
    }

    if (!form.metodo_pago) e.metodo_pago = 'Selecciona un método de pago'

    // Efectivo: límite de Q1,000
    if (form.metodo_pago === 'efectivo' && totalFinal > LIMITE_EFECTIVO) {
      e.metodo_pago = `Efectivo solo disponible para pedidos hasta ${formatPrecio(LIMITE_EFECTIVO)}. Selecciona depósito/transferencia o tarjeta.`
    }

    setErrores(e)
    return Object.keys(e).length === 0
  }

  const handleSubmit = async (e: { preventDefault: () => void }) => {
    e.preventDefault()
    if (!validar()) return

    setEnviando(true)
    const metodoPago = form.metodo_pago

    try {
      const BASE_URL = process.env.NEXT_PUBLIC_API_URL ?? 'https://api.logickem.com/api'

      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        'Accept':       'application/json',
      }
      if (autenticado && token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const res = await fetch(`${BASE_URL}/tienda/pedidos`, {
        method:  'POST',
        headers,
        body: JSON.stringify({
          ...form,
          email:        autenticado ? (cuenta?.email ?? form.email) : form.email,
          tipo_entrega: tipoEntrega,
          items:        items.map((i) => ({ id: i.id, cantidad: i.cantidad })),
          cupon_codigo: cuponAplicado?.codigo ?? undefined,
        }),
      })

      if (!res.ok) throw new Error('Error al enviar el pedido')

      const data = await res.json()
      vaciar()
      setNumeroPedido(data.numero_pedido)
      setRequiereComprobante(data.requiere_comprobante ?? false)
      setRequiereTarjeta(metodoPago === 'tarjeta')
    } catch {
      alert('Ocurrió un error al enviar tu pedido. Por favor intenta de nuevo.')
    } finally {
      setEnviando(false)
    }
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

      {/* Encabezado */}
      <div className="mb-8">
        <Link href="/carrito" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-green-600 mb-4 transition-colors">
          <ChevronLeft className="w-4 h-4" />
          Volver al carrito
        </Link>
        <h1 className="text-2xl font-bold text-gray-900">Finalizar pedido</h1>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

          {/* ── Columna izquierda: formulario ── */}
          <div className="lg:col-span-2 flex flex-col gap-6">

            {/* Información de contacto */}
            <section className="bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-4">
              <div className="flex items-center justify-between">
                <h2 className="font-bold text-gray-900">Información de contacto</h2>
                {autenticado && cuenta && (
                  <span className="text-xs text-green-600 font-medium bg-green-50 px-2 py-1 rounded-full">
                    Cuenta verificada
                  </span>
                )}
              </div>

              {/* Nombre y teléfono — bloqueados si hay dirección guardada seleccionada */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Campo label="Nombre del receptor *" error={!contactoBloqueado ? errores.nombre : undefined}>
                  {contactoBloqueado ? (
                    <div className={`${input()} bg-gray-50 text-gray-700 cursor-default select-none`}>
                      {form.nombre}
                    </div>
                  ) : (
                    <input
                      type="text"
                      value={form.nombre}
                      onChange={(e) => set('nombre', e.target.value)}
                      placeholder="Juan García"
                      className={input(errores.nombre)}
                    />
                  )}
                </Campo>

                <Campo label="Teléfono *" error={!contactoBloqueado ? errores.telefono : undefined}>
                  {contactoBloqueado ? (
                    <div className={`${input()} bg-gray-50 text-gray-700 cursor-default select-none`}>
                      {form.telefono}
                    </div>
                  ) : (
                    <input
                      type="tel"
                      value={form.telefono}
                      onChange={(e) => set('telefono', e.target.value)}
                      placeholder="5555-1234"
                      className={input(errores.telefono)}
                    />
                  )}
                </Campo>
              </div>

              {contactoBloqueado && (
                <p className="text-xs text-gray-400 -mt-2">
                  Nombre y teléfono corresponden a la dirección seleccionada. Elige «Usar otra dirección» para cambiarlos.
                </p>
              )}

              {/* Correo: solo invitados lo llenan; autenticados lo envían automáticamente */}
              {!autenticado && (
                <Campo label="Correo electrónico *" error={errores.email}>
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => set('email', e.target.value)}
                    placeholder="correo@ejemplo.com"
                    className={input(errores.email)}
                  />
                </Campo>
              )}
            </section>

            {/* Tipo de entrega */}
            <section className="bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-4">
              <h2 className="font-bold text-gray-900">Tipo de entrega</h2>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => seleccionarTipoEntrega('domicilio')}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                    tipoEntrega === 'domicilio'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Truck className={`w-5 h-5 shrink-0 ${tipoEntrega === 'domicilio' ? 'text-green-600' : 'text-gray-400'}`} />
                  <div>
                    <p className={`text-sm font-semibold ${tipoEntrega === 'domicilio' ? 'text-green-700' : 'text-gray-700'}`}>
                      Envío a domicilio
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">
                      {subtotal >= MINIMO_ENVIO_GRATIS ? 'Envío gratis' : `Q${COSTO_ENVIO_BASE} de costo`}
                    </p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => seleccionarTipoEntrega('tienda')}
                  className={`flex items-center gap-3 p-4 rounded-xl border-2 text-left transition-all ${
                    tipoEntrega === 'tienda'
                      ? 'border-green-500 bg-green-50'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Store className={`w-5 h-5 shrink-0 ${tipoEntrega === 'tienda' ? 'text-green-600' : 'text-gray-400'}`} />
                  <div>
                    <p className={`text-sm font-semibold ${tipoEntrega === 'tienda' ? 'text-green-700' : 'text-gray-700'}`}>
                      Recoger en tienda
                    </p>
                    <p className="text-xs text-gray-400 mt-0.5">Sin costo de envío</p>
                  </div>
                </button>
              </div>

              {/* Selector de sucursal (recoger en tienda) */}
              {tipoEntrega === 'tienda' && (
                <div className="flex flex-col gap-2 mt-1">
                  <p className="text-sm font-medium text-gray-700">Selecciona la sucursal</p>
                  {sucursales.length === 0 && (
                    <p className="text-sm text-gray-400 py-2">Cargando sucursales...</p>
                  )}
                  {sucursales.map((suc) => (
                    <button
                      key={suc.id}
                      type="button"
                      onClick={() => seleccionarSucursal(suc.id)}
                      className={`flex items-start gap-3 w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${
                        sucursalId === suc.id
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <MapPin className={`w-4 h-4 mt-0.5 shrink-0 ${sucursalId === suc.id ? 'text-green-600' : 'text-gray-400'}`} />
                      <div>
                        <p className={`text-sm font-semibold ${sucursalId === suc.id ? 'text-green-700' : 'text-gray-700'}`}>
                          {suc.nombre}
                        </p>
                        <p className="text-xs text-gray-500 mt-0.5">
                          {[suc.direccion, suc.municipio, suc.departamento].filter(Boolean).join(' — ')}
                        </p>
                        {suc.horario && (
                          <p className="text-xs text-gray-400 mt-0.5">{suc.horario}</p>
                        )}
                        {suc.referencia && (
                          <p className="text-xs text-gray-400 mt-0.5">{suc.referencia}</p>
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </section>

            {/* Dirección de entrega (solo domicilio) */}
            {tipoEntrega === 'domicilio' && (
              <section className="bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-4">
                <h2 className="font-bold text-gray-900">Dirección de entrega</h2>

                {/* Esqueleto de carga (usuario autenticado esperando sus direcciones) */}
                {autenticado && cargandoDirecciones && (
                  <div className="flex flex-col gap-2 animate-pulse">
                    {[1, 2].map((i) => (
                      <div key={i} className="h-14 rounded-xl bg-gray-100" />
                    ))}
                  </div>
                )}

                {/* Direcciones guardadas */}
                {autenticado && !cargandoDirecciones && direccionesGuardadas.length > 0 && (
                  <div className="flex flex-col gap-2">
                    {direccionesGuardadas.map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => aplicarDireccion(d)}
                        className={`flex items-start gap-3 w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${
                          direccionSeleccionada === d.id
                            ? 'border-green-500 bg-green-50'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                      >
                        <MapPin className={`w-4 h-4 mt-0.5 shrink-0 ${direccionSeleccionada === d.id ? 'text-green-600' : 'text-gray-400'}`} />
                        <div className="flex-1 min-w-0">
                          <p className={`text-sm font-semibold ${direccionSeleccionada === d.id ? 'text-green-700' : 'text-gray-700'}`}>
                            {d.alias ?? d.nombre_receptor}
                            {d.es_principal && (
                              <span className="ml-2 text-xs font-normal text-green-600 bg-green-100 px-1.5 py-0.5 rounded-full">Principal</span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5 truncate">
                            {d.direccion} — {d.municipio}, {d.departamento}
                          </p>
                        </div>
                      </button>
                    ))}

                    {/* Opción: ingresar otra dirección */}
                    <button
                      type="button"
                      onClick={seleccionarNueva}
                      className={`flex items-center gap-3 w-full text-left px-4 py-3 rounded-xl border-2 transition-all ${
                        direccionSeleccionada === 'nueva'
                          ? 'border-green-500 bg-green-50'
                          : 'border-dashed border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <Plus className={`w-4 h-4 shrink-0 ${direccionSeleccionada === 'nueva' ? 'text-green-600' : 'text-gray-400'}`} />
                      <span className={`text-sm font-medium ${direccionSeleccionada === 'nueva' ? 'text-green-700' : 'text-gray-500'}`}>
                        Usar otra dirección
                      </span>
                    </button>
                  </div>
                )}

                {/* Sin direcciones guardadas (usuario autenticado) */}
                {autenticado && !cargandoDirecciones && direccionesGuardadas.length === 0 && (
                  <p className="text-xs text-gray-500 bg-gray-50 rounded-xl px-4 py-3">
                    No tienes direcciones guardadas. Completa el formulario a continuación y puedes guardarlas desde tu perfil para futuros pedidos.
                  </p>
                )}

                {/* Formulario manual: invitados siempre · autenticado sin dirs · o eligió "nueva" */}
                {(!autenticado || direccionSeleccionada === 'nueva' || (!cargandoDirecciones && direccionesGuardadas.length === 0)) && (
                  <div className="flex flex-col gap-4">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Campo label="Departamento *" error={errores.departamento}>
                        <select
                          value={form.departamento}
                          onChange={(e) => set('departamento', e.target.value)}
                          className={input(errores.departamento)}
                        >
                          <option value="">Seleccionar...</option>
                          {DEPARTAMENTOS.map((d) => (
                            <option key={d} value={d}>{d}</option>
                          ))}
                        </select>
                      </Campo>

                      <Campo label="Municipio *" error={errores.municipio}>
                        <select
                          value={form.municipio}
                          onChange={(e) => set('municipio', e.target.value)}
                          disabled={!form.departamento}
                          className={`${input(errores.municipio)} disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed`}
                        >
                          <option value="">
                            {form.departamento ? 'Seleccionar municipio...' : 'Primero selecciona un departamento'}
                          </option>
                          {municipiosDisponibles.map((m) => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      </Campo>
                    </div>

                    <Campo label="Dirección exacta *" error={errores.direccion}>
                      <input
                        type="text"
                        value={form.direccion}
                        onChange={(e) => set('direccion', e.target.value)}
                        placeholder="5a Calle 3-20, Zona 1"
                        className={input(errores.direccion)}
                      />
                    </Campo>

                    <Campo label="Referencias (opcional)">
                      <input
                        type="text"
                        value={form.referencias}
                        onChange={(e) => set('referencias', e.target.value)}
                        placeholder="Frente al parque, casa color verde..."
                        className={input()}
                      />
                    </Campo>
                  </div>
                )}
              </section>
            )}

            {/* Método de pago */}
            <section className="bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-4">
              <h2 className="font-bold text-gray-900">Método de pago</h2>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                {METODOS_PAGO.map((m) => {
                  const esEfectivo       = m.value === 'efectivo'
                  const efectivoLimitado = esEfectivo && totalFinal > LIMITE_EFECTIVO
                  return (
                    <button
                      key={m.value}
                      type="button"
                      onClick={() => !efectivoLimitado && set('metodo_pago', m.value)}
                      disabled={efectivoLimitado}
                      className={`flex flex-col items-start p-4 rounded-xl border-2 text-left transition-all ${
                        efectivoLimitado
                          ? 'border-gray-100 bg-gray-50 opacity-50 cursor-not-allowed'
                          : form.metodo_pago === m.value
                          ? 'border-green-500 bg-green-50'
                          : 'border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <span className={`text-sm font-semibold ${
                        efectivoLimitado
                          ? 'text-gray-400'
                          : form.metodo_pago === m.value
                          ? 'text-green-700'
                          : 'text-gray-700'
                      }`}>
                        {m.label}
                      </span>
                      {efectivoLimitado && (
                        <span className="text-xs text-gray-400 mt-0.5">Solo hasta {formatPrecio(LIMITE_EFECTIVO)}</span>
                      )}
                    </button>
                  )
                })}
              </div>

              {errores.metodo_pago && <p className="text-xs text-red-500">{errores.metodo_pago}</p>}

              {form.metodo_pago === 'deposito_transferencia' && (
                <p className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-lg px-3 py-2">
                  Al realizar tu transferencia, incluye tu nombre o número de teléfono en la descripción.
                  Después de crear el pedido podrás subir el comprobante.
                </p>
              )}

              {form.metodo_pago === 'tarjeta' && (
                <p className="text-xs text-blue-700 bg-blue-50 border border-blue-200 rounded-lg px-3 py-2">
                  Al confirmar el pedido te contactaremos vía WhatsApp o correo para enviarte un link de pago seguro.
                </p>
              )}

              {totalFinal > LIMITE_EFECTIVO && (
                <p className="text-xs text-orange-700 bg-orange-50 border border-orange-200 rounded-lg px-3 py-2">
                  Para pedidos mayores a {formatPrecio(LIMITE_EFECTIVO)} solo se acepta depósito/transferencia o tarjeta.
                </p>
              )}
            </section>

            {/* Notas adicionales */}
            <section className="bg-white rounded-2xl shadow-sm p-6 flex flex-col gap-4">
              <h2 className="font-bold text-gray-900">
                Notas adicionales <span className="font-normal text-gray-400">(opcional)</span>
              </h2>
              <textarea
                value={form.notas}
                onChange={(e) => set('notas', e.target.value)}
                placeholder="Instrucciones especiales para la entrega..."
                rows={3}
                className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm focus:outline-none focus:ring-2 focus:ring-green-500 resize-none"
              />
            </section>
          </div>

          {/* ── Columna derecha: resumen ── */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl shadow-sm p-6 sticky top-24 flex flex-col gap-4">
              <h2 className="font-bold text-gray-900">Tu pedido</h2>

              {/* Items */}
              <div className="flex flex-col gap-3 max-h-64 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.id} className="flex gap-3 items-center">
                    {item.imagen && (
                      <div className="relative w-12 h-12 shrink-0 rounded-lg overflow-hidden bg-gray-100">
                        <Image src={item.imagen} alt={item.nombre} fill className="object-cover" sizes="48px" />
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-gray-700 font-medium line-clamp-2 leading-snug">{item.nombre}</p>
                      <p className="text-xs text-gray-400 mt-0.5">×{item.cantidad}</p>
                    </div>
                    <span className="text-xs font-bold text-gray-800 shrink-0">
                      {formatPrecio(item.precio * item.cantidad)}
                    </span>
                  </div>
                ))}
              </div>

              {/* Cupón de descuento */}
              <div className="border-t border-gray-100 pt-4 flex flex-col gap-2">
                {cuponAplicado ? (
                  <div className="flex items-center justify-between bg-green-50 border border-green-200 rounded-xl px-3 py-2.5">
                    <div className="flex items-center gap-2 min-w-0">
                      <Tag className="w-3.5 h-3.5 text-green-600 shrink-0" />
                      <div className="min-w-0">
                        <p className="text-xs font-semibold text-green-700">{cuponAplicado.codigo}</p>
                        {cuponAplicado.descripcion && (
                          <p className="text-xs text-green-600 leading-snug">{cuponAplicado.descripcion}</p>
                        )}
                      </div>
                    </div>
                    <button type="button" onClick={quitarCupon} className="text-green-400 hover:text-red-500 transition-colors shrink-0 ml-2">
                      <XCircle className="w-4 h-4" />
                    </button>
                  </div>
                ) : (
                  <div className="flex flex-col gap-1.5">
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={codigoCupon}
                        onChange={(e) => { setCodigoCupon(e.target.value.toUpperCase()); setErrorCupon('') }}
                        onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), handleAplicarCupon())}
                        placeholder="CUPÓN DE DESCUENTO"
                        className="flex-1 border border-gray-200 rounded-xl px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-green-500 uppercase tracking-wider min-w-0"
                      />
                      <button
                        type="button"
                        onClick={handleAplicarCupon}
                        disabled={validandoCupon || !codigoCupon.trim()}
                        className="px-3 py-2 rounded-xl bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-white text-xs font-semibold transition-colors flex items-center gap-1 shrink-0"
                      >
                        {validandoCupon ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Tag className="w-3.5 h-3.5" />}
                        Aplicar
                      </button>
                    </div>
                    {errorCupon && <p className="text-xs text-red-500">{errorCupon}</p>}
                  </div>
                )}
              </div>

              {/* Totales */}
              <div className="border-t border-gray-100 pt-4 flex flex-col gap-2 text-sm">
                <div className="flex justify-between text-gray-600">
                  <span>Subtotal</span>
                  <span>{formatPrecio(subtotal)}</span>
                </div>
                <div className="flex justify-between text-gray-600">
                  <span>Envío</span>
                  <span className="text-green-600 font-medium">
                    {costoEnvio === 0 ? 'Gratis' : formatPrecio(costoEnvio)}
                  </span>
                </div>
                {descuento > 0 && (
                  <div className="flex justify-between text-green-600 font-medium">
                    <span className="flex items-center gap-1">
                      <Tag className="w-3 h-3" />
                      {cuponAplicado?.codigo}
                    </span>
                    <span>-{formatPrecio(descuento)}</span>
                  </div>
                )}
                <div className="flex justify-between font-bold text-gray-900 text-base border-t border-gray-100 pt-2 mt-1">
                  <span>Total</span>
                  <span className="text-green-600">{formatPrecio(totalFinal)}</span>
                </div>
              </div>

              {/* Aceptación de términos (solo invitados) */}
              {!autenticado && (
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={aceptaTerminos}
                    onChange={(e) => setAceptaTerminos(e.target.checked)}
                    className="mt-0.5 h-4 w-4 rounded border-gray-300 accent-green-600 cursor-pointer shrink-0"
                  />
                  <span className="text-xs text-gray-500 leading-snug">
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
              )}

              {/* Botón enviar */}
              <button
                type="submit"
                disabled={enviando || (!autenticado && !aceptaTerminos)}
                className="w-full bg-green-600 hover:bg-green-700 disabled:bg-green-400 text-white font-bold py-3 rounded-xl transition-colors text-sm flex items-center justify-center gap-2"
              >
                {enviando && <Loader2 className="w-4 h-4 animate-spin" />}
                {enviando ? 'Enviando pedido...' : 'Confirmar pedido'}
              </button>

              <p className="text-xs text-gray-400 text-center">
                Al confirmar aceptas que nos contactemos contigo para coordinar la entrega
              </p>
            </div>
          </div>
        </div>
      </form>
    </div>
  )
}

// ── Helpers de UI ─────────────────────────────────────────────────────────────

function Campo({ label, error, children }: { label: string; error?: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <label className="text-sm font-medium text-gray-700">{label}</label>
      {children}
      {error && <p className="text-xs text-red-500">{error}</p>}
    </div>
  )
}

function input(error?: string) {
  return `w-full border rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 transition-colors ${
    error
      ? 'border-red-300 focus:ring-red-400'
      : 'border-gray-200 focus:ring-green-500'
  }`
}
