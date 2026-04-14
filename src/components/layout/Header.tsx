'use client'

import Link from 'next/link'
import Image from 'next/image'
import { useCarrito } from '@/store/carrito'
import { useCuenta } from '@/store/cuenta'
import { ShoppingCart, Menu, X, User, LogOut, Package, ChevronDown } from 'lucide-react'
import { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { tiendaApi } from '@/lib/api'
import CategoriasDropdown from './CategoriasDropdown'
import BuscadorAutocomplete from './BuscadorAutocomplete'

const navegacion = [
  { label: 'Inicio',       href: '/' },
  { label: 'Productos',    href: '/productos' },
  { label: 'Solo ofertas', href: '/productos?solo_ofertas=true' },
]

export default function Header() {
  const router       = useRouter()
  const totalItems   = useCarrito((s) => s.items.reduce((sum, i) => sum + i.cantidad, 0))
  const cuenta       = useCuenta((s) => s.cuenta)
  const token        = useCuenta((s) => s.token)
  const autenticado  = useCuenta((s) => s.autenticado)
  const cerrarSesion = useCuenta((s) => s.cerrarSesion)

  const [menuAbierto,    setMenuAbierto]    = useState(false)
  const [cuentaAbierto,  setCuentaAbierto]  = useState(false)
  const [montado,        setMontado]        = useState(false)
  const cuentaRef = useRef<HTMLDivElement>(null)

  useEffect(() => { setMontado(true) }, [])

  // Cerrar dropdown de cuenta al hacer click fuera
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (cuentaRef.current && !cuentaRef.current.contains(e.target as Node)) {
        setCuentaAbierto(false)
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  const handleLogout = async () => {
    setCuentaAbierto(false)
    try {
      if (token) await tiendaApi.auth.logout(token)
    } catch {
      // Si la API falla, igual cerramos sesión localmente
    } finally {
      cerrarSesion()
      router.push('/')
    }
  }

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">

      {/* ── Fila 1: Logo · Categorías · Buscador · Cuenta · Carrito ── */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center gap-3 h-16">

          {/* Logo */}
          <Link href="/" className="text-xl font-bold text-green-600 tracking-tight shrink-0">
            {process.env.NEXT_PUBLIC_STORE_NAME ?? 'Logickem'}
          </Link>

          {/* Categorías — solo desktop */}
          <div className="hidden md:block shrink-0">
            <CategoriasDropdown />
          </div>

          {/* Buscador con autocomplete — solo desktop */}
          <div className="hidden md:flex flex-1">
            <BuscadorAutocomplete />
          </div>

          {/* Cuenta + Carrito */}
          <div className="flex items-center gap-1 ml-auto">

            {/* Menú de cuenta — solo desktop */}
            {montado && (
              <div className="hidden md:block relative" ref={cuentaRef}>
                {autenticado && cuenta ? (
                  <>
                    <button
                      onClick={() => setCuentaAbierto(!cuentaAbierto)}
                      className="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-gray-50 transition-colors text-sm text-gray-700"
                    >
                      {cuenta.avatar ? (
                        <Image
                          src={cuenta.avatar}
                          alt={cuenta.nombre}
                          width={28}
                          height={28}
                          className="rounded-full object-cover"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                          <span className="text-xs font-bold text-green-700">
                            {cuenta.nombre[0]}{cuenta.apellido[0]}
                          </span>
                        </div>
                      )}
                      <span className="font-medium max-w-[100px] truncate">{cuenta.nombre}</span>
                      <ChevronDown className="w-3.5 h-3.5 text-gray-400" />
                    </button>

                    {cuentaAbierto && (
                      <div className="absolute right-0 top-full mt-1.5 w-48 bg-white rounded-xl border border-gray-200 shadow-lg overflow-hidden z-50">
                        <div className="px-4 py-3 border-b border-gray-100">
                          <p className="text-sm font-semibold text-gray-800 truncate">{cuenta.nombre_completo}</p>
                          <p className="text-xs text-gray-400 truncate">{cuenta.email}</p>
                        </div>
                        <Link
                          href="/cuenta"
                          onClick={() => setCuentaAbierto(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <User className="w-4 h-4 text-gray-400" />
                          Mi cuenta
                        </Link>
                        <Link
                          href="/cuenta/pedidos"
                          onClick={() => setCuentaAbierto(false)}
                          className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-gray-50 transition-colors"
                        >
                          <Package className="w-4 h-4 text-gray-400" />
                          Mis pedidos
                        </Link>
                        <button
                          onClick={handleLogout}
                          className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100"
                        >
                          <LogOut className="w-4 h-4" />
                          Cerrar sesión
                        </button>
                      </div>
                    )}
                  </>
                ) : (
                  <Link
                    href="/auth/login"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-medium text-gray-600 hover:text-green-600 hover:bg-gray-50 transition-colors"
                  >
                    <User className="w-4 h-4" />
                    Iniciar sesión
                  </Link>
                )}
              </div>
            )}

            {/* Carrito */}
            <Link
              href="/carrito"
              className="relative p-2 text-gray-600 hover:text-green-600 transition-colors"
            >
              <ShoppingCart className="w-5 h-5" />
              {montado && totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-green-600 text-white text-[10px] rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </Link>

            {/* Hamburger móvil */}
            <button
              className="md:hidden p-2 text-gray-600 hover:text-green-600"
              onClick={() => setMenuAbierto(!menuAbierto)}
            >
              {menuAbierto ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* ── Fila 2: Buscador — solo móvil, siempre visible ── */}
      <div className="md:hidden border-t border-gray-100 px-4 py-2">
        <BuscadorAutocomplete />
      </div>

      {/* ── Fila 3: Nav links — solo desktop ── */}
      <div className="hidden md:block border-t border-gray-100 bg-gray-50/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <nav className="flex items-center gap-6 h-9">
            {navegacion.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-gray-500 hover:text-green-600 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* ── Menú móvil ── */}
      {menuAbierto && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-4 flex flex-col gap-4">

          {/* Nav links móvil */}
          <div className="flex flex-col gap-1">
            {navegacion.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuAbierto(false)}
                className="text-sm font-medium text-gray-700 hover:text-green-600 py-1"
              >
                {item.label}
              </Link>
            ))}
          </div>

          {/* Cuenta móvil */}
          {montado && (
            <div className="border-t border-gray-100 pt-3 flex flex-col gap-1">
              {autenticado && cuenta ? (
                <>
                  <div className="flex items-center gap-2 px-1 py-1 mb-1">
                    <div className="w-7 h-7 rounded-full bg-green-100 flex items-center justify-center shrink-0">
                      <span className="text-xs font-bold text-green-700">
                        {cuenta.nombre[0]}{cuenta.apellido[0]}
                      </span>
                    </div>
                    <span className="text-sm font-semibold text-gray-800">{cuenta.nombre_completo}</span>
                  </div>
                  <Link href="/cuenta"         onClick={() => setMenuAbierto(false)} className="text-sm text-gray-700 hover:text-green-600 py-1">Mi cuenta</Link>
                  <Link href="/cuenta/pedidos" onClick={() => setMenuAbierto(false)} className="text-sm text-gray-700 hover:text-green-600 py-1">Mis pedidos</Link>
                  <button onClick={() => { setMenuAbierto(false); handleLogout() }} className="text-sm text-red-600 text-left py-1">
                    Cerrar sesión
                  </button>
                </>
              ) : (
                <div className="flex gap-3">
                  <Link href="/auth/login"    onClick={() => setMenuAbierto(false)} className="flex-1 text-center py-2 rounded-xl border border-gray-200 text-sm font-medium text-gray-700 hover:border-green-400">Iniciar sesión</Link>
                  <Link href="/auth/registro" onClick={() => setMenuAbierto(false)} className="flex-1 text-center py-2 rounded-xl bg-green-600 text-sm font-medium text-white hover:bg-green-700">Registrarse</Link>
                </div>
              )}
            </div>
          )}

          {/* Categorías móvil */}
          <div className="border-t border-gray-100 pt-3">
            <CategoriasDropdown />
          </div>
        </div>
      )}
    </header>
  )
}