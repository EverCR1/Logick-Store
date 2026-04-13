'use client'

import { useEffect } from 'react'
import { useRouter, usePathname } from 'next/navigation'
import Link from 'next/link'
import { useCuenta } from '@/store/cuenta'
import { User, Package, MapPin, Heart, Tag, Star, LogOut, ChevronRight } from 'lucide-react'

const NAV = [
  { href: '/cuenta',             label: 'Mi perfil',    icon: User },
  { href: '/cuenta/pedidos',     label: 'Mis pedidos',  icon: Package },
  { href: '/cuenta/direcciones', label: 'Direcciones',  icon: MapPin },
  { href: '/cuenta/favoritos',   label: 'Favoritos',    icon: Heart },
  { href: '/cuenta/cupones',     label: 'Mis cupones',  icon: Tag },
  { href: '/cuenta/puntos',      label: 'Mis puntos',   icon: Star },
]

export default function CuentaLayout({ children }: { children: React.ReactNode }) {
  const router        = useRouter()
  const pathname      = usePathname()
  const autenticado   = useCuenta((s) => s.autenticado)
  const cuenta        = useCuenta((s) => s.cuenta)
  const cerrarSesion  = useCuenta((s) => s.cerrarSesion)

  useEffect(() => {
    if (!autenticado) router.replace('/auth/login')
  }, [autenticado, router])

  if (!autenticado || !cuenta) return null

  const handleLogout = () => {
    cerrarSesion()
    router.push('/')
  }

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col md:flex-row gap-6">

        {/* Sidebar */}
        <aside className="w-full md:w-60 shrink-0">
          {/* Avatar + nombre */}
          <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-3 flex items-center gap-3">
            <div className="w-11 h-11 rounded-full bg-green-100 flex items-center justify-center shrink-0">
              <span className="text-base font-bold text-green-700">
                {cuenta.nombre[0]}{cuenta.apellido[0]}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-sm font-semibold text-gray-800 truncate">{cuenta.nombre_completo}</p>
              <p className="text-xs text-gray-400 truncate">{cuenta.email}</p>
            </div>
          </div>

          {/* Nav */}
          <nav className="bg-white border border-gray-200 rounded-2xl overflow-hidden">
            {NAV.map(({ href, label, icon: Icon }, i) => {
              const activo = pathname === href
              return (
                <Link
                  key={href}
                  href={href}
                  className={`flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                    i > 0 ? 'border-t border-gray-100' : ''
                  } ${activo
                    ? 'bg-green-50 text-green-700 font-semibold'
                    : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span className="flex-1">{label}</span>
                  {activo && <ChevronRight className="w-3.5 h-3.5 text-green-400" />}
                </Link>
              )
            })}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-3 text-sm text-red-600 hover:bg-red-50 transition-colors border-t border-gray-100"
            >
              <LogOut className="w-4 h-4 shrink-0" />
              Cerrar sesión
            </button>
          </nav>
        </aside>

        {/* Contenido */}
        <div className="flex-1 min-w-0">
          {children}
        </div>
      </div>
    </div>
  )
}