'use client'

import Link from 'next/link'
import { useCarrito } from '@/store/carrito'
import { ShoppingCart, Menu, X } from 'lucide-react'
import { useState } from 'react'

const navegacion = [
  { label: 'Inicio',    href: '/' },
  { label: 'Productos', href: '/productos' },
  { label: 'Servicios', href: '/servicios' },
]

export default function Header() {
  const totalItems = useCarrito((s) => s.totalItems)
  const [menuAbierto, setMenuAbierto] = useState(false)

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="text-xl font-bold text-green-600 tracking-tight">
            {process.env.NEXT_PUBLIC_STORE_NAME ?? 'Logickem'}
          </Link>

          {/* Nav escritorio */}
          <nav className="hidden md:flex items-center gap-6">
            {navegacion.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-gray-600 hover:text-green-600 transition-colors"
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Carrito + menú móvil */}
          <div className="flex items-center gap-3">
            <Link href="/carrito" className="relative p-2 text-gray-600 hover:text-green-600 transition-colors">
              <ShoppingCart className="w-5 h-5" />
              {totalItems() > 0 && (
                <span className="absolute -top-1 -right-1 bg-green-600 text-white text-xs rounded-full w-4 h-4 flex items-center justify-center font-bold">
                  {totalItems()}
                </span>
              )}
            </Link>

            <button
              className="md:hidden p-2 text-gray-600 hover:text-green-600"
              onClick={() => setMenuAbierto(!menuAbierto)}
            >
              {menuAbierto ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Nav móvil */}
      {menuAbierto && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 py-3 flex flex-col gap-3">
          {navegacion.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setMenuAbierto(false)}
              className="text-sm font-medium text-gray-700 hover:text-green-600"
            >
              {item.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  )
}