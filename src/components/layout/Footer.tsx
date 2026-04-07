import Link from 'next/link'

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">

          {/* Marca */}
          <div>
            <h3 className="text-white font-bold text-lg mb-2">
              {process.env.NEXT_PUBLIC_STORE_NAME ?? 'Logickem'}
            </h3>
            <p className="text-sm leading-relaxed">
              Productos y servicios de calidad para tu negocio y hogar.
            </p>
          </div>

          {/* Links */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Tienda</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/productos" className="hover:text-white transition-colors">Productos</Link></li>
              <li><Link href="/servicios" className="hover:text-white transition-colors">Servicios</Link></li>
              <li><Link href="/productos?solo_ofertas=true" className="hover:text-white transition-colors">Ofertas</Link></li>
            </ul>
          </div>

          {/* Cuenta */}
          <div>
            <h4 className="text-white font-semibold mb-3 text-sm">Mi cuenta</h4>
            <ul className="space-y-2 text-sm">
              <li><Link href="/auth/login" className="hover:text-white transition-colors">Iniciar sesión</Link></li>
              <li><Link href="/auth/registro" className="hover:text-white transition-colors">Registrarse</Link></li>
              <li><Link href="/cuenta/pedidos" className="hover:text-white transition-colors">Mis pedidos</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-6 text-center text-xs">
          © {new Date().getFullYear()} {process.env.NEXT_PUBLIC_STORE_NAME ?? 'Logickem'}. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  )
}