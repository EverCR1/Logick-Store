import type { Metadata } from 'next'
import Link from 'next/link'

function ShieldCheckIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={className}>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
      <polyline points="9 12 11 14 15 10" />
    </svg>
  )
}
function ArrowPathIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={className}>
      <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
      <path d="M21 3v5h-5" />
      <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
      <path d="M8 16H3v5" />
    </svg>
  )
}
function ExclamationTriangleIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={className}>
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <line x1="12" x2="12" y1="9" y2="13" />
      <line x1="12" x2="12.01" y1="17" y2="17" />
    </svg>
  )
}
function EnvelopeIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={className}>
      <rect width="20" height="16" x="2" y="4" rx="2" />
      <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
    </svg>
  )
}

export const metadata: Metadata = {
  title: 'Garantías',
  description: 'Conoce nuestra política de garantías en Logickem.',
}

function Section({ icon, title, children }: { icon: React.ReactNode; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-5 mb-8">
      <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
        {icon}
      </div>
      <div>
        <h2 className="text-base font-semibold text-gray-800 mb-2">{title}</h2>
        <div className="text-sm text-gray-500 leading-relaxed space-y-2">{children}</div>
      </div>
    </div>
  )
}

export default function GarantiasPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Garantías</h1>
        <p className="text-sm text-gray-400">Última actualización: abril 2026</p>
      </div>

      <div className="bg-blue-50 border border-blue-100 rounded-2xl px-6 py-5 mb-10 text-sm text-blue-700 leading-relaxed">
        En <strong>Logickem</strong> nos comprometemos con la calidad de cada producto y servicio que ofrecemos.
        Si tienes algún inconveniente con tu compra, estamos aquí para resolverlo.
      </div>

      <Section
        icon={<ShieldCheckIcon className="w-5 h-5" />}
        title="Cobertura de garantía"
      >
        <p>
          Todos los productos vendidos en Logickem cuentan con garantía contra defectos de fabricación.
          El período de cobertura varía según el producto y está indicado en la descripción de cada uno.
          Te recomendamos revisarlo antes de realizar tu compra.
        </p>
        <p>
          La garantía cubre únicamente defectos de fabricación o fallas que no sean atribuibles al uso
          inadecuado del producto.
        </p>
      </Section>

      <Section
        icon={<ArrowPathIcon className="w-5 h-5" />}
        title="Proceso para hacer válida la garantía"
      >
        <p>Para solicitar una garantía sigue estos pasos:</p>
        <ol className="list-decimal list-inside space-y-1 mt-1">
          <li>
            Repórtalo directamente desde la tienda usando el botón{' '}
            <strong>"Reportar un problema"</strong> que aparece en la barra de navegación —
            es la forma más rápida y queda registrado automáticamente.
          </li>
          <li>O bien escríbenos a <strong>soporte@logickem.com</strong> dentro del período de garantía.</li>
          <li>Indica tu número de pedido y describe el problema con el mayor detalle posible.</li>
          <li>Adjunta fotografías o video del defecto del producto.</li>
          <li>Nuestro equipo evaluará tu caso y te responderá en un plazo máximo de <strong>3 días hábiles</strong>.</li>
          <li>Si procede, coordinamos la devolución y el cambio o reembolso correspondiente.</li>
        </ol>
      </Section>

      <Section
        icon={<ExclamationTriangleIcon className="w-5 h-5" />}
        title="Casos no cubiertos por la garantía"
      >
        <p>La garantía no aplica en los siguientes casos:</p>
        <ul className="list-disc list-inside space-y-1 mt-1">
          <li>Daños causados por mal uso, golpes, humedad o negligencia del comprador.</li>
          <li>Productos con señales de haber sido alterados o reparados por terceros.</li>
          <li>Desgaste normal por el uso del producto.</li>
          <li>Productos de consumo (tintas, papelería, accesorios desechables) una vez abiertos.</li>
          <li>Solicitudes realizadas después del período de garantía indicado.</li>
        </ul>
      </Section>

      <Section
        icon={<ShieldCheckIcon className="w-5 h-5" />}
        title="Devoluciones y cambios"
      >
        <p>
          Si recibes un producto que no corresponde a tu pedido o llega en mal estado, tienes
          <strong> 48 horas</strong> desde la recepción para reportarlo. Coordinaremos el cambio sin costo adicional.
        </p>
        <p>
          Si deseas devolver un producto por arrepentimiento u otra razón personal (cambio de opinión,
          ya no lo necesitas, etc.), podemos aceptar la devolución dentro de los primeros{' '}
          <strong>5 días naturales</strong> desde que recibiste tu pedido, siempre que el producto esté
          sin uso, en su empaque original y con el comprobante de compra. En este caso,{' '}
          <strong>el costo del envío de devolución corre por cuenta del comprador</strong> y no será reembolsado.
        </p>
      </Section>

      {/* Bloque: Reportar desde la tienda */}
      <div className="mt-10 rounded-2xl bg-green-50 border border-green-200 px-6 py-6">
        <div className="flex items-start gap-4">
          <div className="flex-shrink-0 w-10 h-10 rounded-xl bg-green-100 flex items-center justify-center">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
              stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              className="w-5 h-5 text-green-600">
              <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1z" />
              <line x1="4" x2="4" y1="22" y2="15" />
            </svg>
          </div>
          <div>
            <p className="font-semibold text-green-800 mb-1">Repórtalo directamente desde la tienda</p>
            <p className="text-sm text-green-700 leading-relaxed mb-3">
              ¿Recibiste un producto con defecto o algo salió mal con tu pedido? Usa el botón{' '}
              <strong>"Reportar un problema"</strong> en la barra de navegación. Tu reporte queda
              registrado y nuestro equipo lo revisa con prioridad.
            </p>
            <p className="text-sm text-green-700 leading-relaxed font-medium">
              🎁 Los reportes válidos sobre defectos de productos o errores de la tienda son
              recompensados con <strong>puntos o un cupón de descuento</strong> como agradecimiento
              por ayudarnos a mejorar.
            </p>
          </div>
        </div>
      </div>

      {/* Bloque: Contacto */}
      <div className="mt-4 bg-gray-50 border border-gray-100 rounded-2xl px-6 py-5 flex gap-4 items-start">
        <EnvelopeIcon className="w-6 h-6 text-gray-400 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-gray-500">
          <p className="font-medium text-gray-700 mb-1">¿Tienes alguna duda sobre tu garantía?</p>
          <p>
            Escríbenos a{' '}
            <a href="mailto:soporte@logickem.com" className="text-blue-600 hover:underline font-medium">
              soporte@logickem.com
            </a>
            {' '}o por{' '}
            <a
              href={`https://wa.me/50247104888?text=${encodeURIComponent('Hola, quisiera consultar sobre una garantía...')}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-600 hover:underline font-medium"
            >
              WhatsApp
            </a>
            {' '}y con gusto te ayudamos. También puedes consultar nuestras{' '}
            <Link href="/faq" className="text-blue-600 hover:underline">
              preguntas frecuentes
            </Link>
            .
          </p>
        </div>
      </div>
    </div>
  )
}
