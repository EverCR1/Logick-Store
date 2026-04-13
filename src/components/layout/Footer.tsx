import Link from 'next/link'

/* ── Iconos de redes sociales (SVG inline para no añadir dependencias) ── */
function FacebookIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
    </svg>
  )
}
function WhatsAppIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z" />
      <path d="M12 0C5.373 0 0 5.373 0 12c0 2.127.558 4.122 1.532 5.853L.057 23.077a.75.75 0 0 0 .921.912l5.355-1.453A11.94 11.94 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 22c-1.907 0-3.688-.536-5.2-1.464l-.373-.222-3.876 1.051 1.072-3.762-.243-.386A9.944 9.944 0 0 1 2 12C2 6.477 6.477 2 12 2s10 4.477 10 10-4.477 10-10 10z" />
    </svg>
  )
}
function InstagramIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
      <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
      <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
    </svg>
  )
}
function TikTokIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 0 0-.79-.05 6.34 6.34 0 0 0-6.34 6.34 6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.33-6.34V8.69a8.18 8.18 0 0 0 4.78 1.52V6.75a4.85 4.85 0 0 1-1.01-.06z" />
    </svg>
  )
}
function YouTubeIcon() {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5">
      <path d="M22.54 6.42a2.78 2.78 0 0 0-1.95-1.96C18.88 4 12 4 12 4s-6.88 0-8.59.46A2.78 2.78 0 0 0 1.46 6.42 29 29 0 0 0 1 12a29 29 0 0 0 .46 5.58 2.78 2.78 0 0 0 1.95 1.965C5.12 20 12 20 12 20s6.88 0 8.59-.455a2.78 2.78 0 0 0 1.95-1.965A29 29 0 0 0 23 12a29 29 0 0 0-.46-5.58z" />
      <polygon points="9.75 15.02 15.5 12 9.75 8.98 9.75 15.02" fill="white" />
    </svg>
  )
}

const redes = [
  { label: 'Facebook',  icon: <FacebookIcon />,  color: 'hover:text-blue-400' },
  { label: 'WhatsApp',  icon: <WhatsAppIcon />,  color: 'hover:text-green-400' },
  { label: 'Instagram', icon: <InstagramIcon />, color: 'hover:text-pink-400' },
  { label: 'TikTok',    icon: <TikTokIcon />,    color: 'hover:text-white' },
  { label: 'YouTube',   icon: <YouTubeIcon />,   color: 'hover:text-red-400' },
]

export default function Footer() {
  const storeName = process.env.NEXT_PUBLIC_STORE_NAME ?? 'Logickem'
  const year = new Date().getFullYear()

  return (
    <footer className="bg-gray-900 text-gray-400 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-10">

          {/* ── Columna 1: Sobre nosotros ── */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Sobre nosotros</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/privacidad" className="hover:text-white transition-colors">Política de privacidad</Link></li>
              <li><Link href="/terminos" className="hover:text-white transition-colors">Términos de servicio</Link></li>
            </ul>
          </div>

          {/* ── Columna 2: Ayuda y contacto ── */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Ayuda y contacto</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/faq" className="hover:text-white transition-colors">Preguntas frecuentes</Link></li>
              <li><Link href="/envios" className="hover:text-white transition-colors">Sobre los envíos</Link></li>
              <li>
                <a href="mailto:soporte@logickem.com" className="hover:text-white transition-colors">
                  soporte@logickem.com
                </a>
              </li>
              <li><Link href="/garantias" className="hover:text-white transition-colors">Garantías</Link></li>
            </ul>
          </div>

          {/* ── Columna 3: Tienda ── */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Tienda</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/productos" className="hover:text-white transition-colors">Productos</Link></li>
              <li><Link href="/carrito" className="hover:text-white transition-colors">Carrito</Link></li>
            </ul>
          </div>

          {/* ── Columna 4: Redes sociales ── */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Redes sociales</h4>
            <ul className="space-y-3">
              {redes.map((red) => (
                <li key={red.label}>
                  <span
                    className={`flex items-center gap-2.5 text-sm cursor-default transition-colors ${red.color}`}
                    aria-label={red.label}
                  >
                    {red.icon}
                    {red.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>

          {/* ── Columna 5: Mi cuenta ── */}
          <div>
            <h4 className="text-white font-semibold mb-4 text-sm uppercase tracking-wider">Mi cuenta</h4>
            <ul className="space-y-2.5 text-sm">
              <li><Link href="/auth/login" className="hover:text-white transition-colors">Iniciar sesión</Link></li>
              <li><Link href="/auth/registro" className="hover:text-white transition-colors">Registrarse</Link></li>
              <li><Link href="/cuenta/pedidos" className="hover:text-white transition-colors">Mis pedidos</Link></li>
            </ul>
          </div>

        </div>

        {/* ── Copyright ── */}
        <div className="border-t border-gray-800 mt-10 pt-6 text-center text-xs text-gray-500">
          © {year} {storeName}. Todos los derechos reservados.
        </div>
      </div>
    </footer>
  )
}