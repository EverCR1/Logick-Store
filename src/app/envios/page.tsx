import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Sobre los envíos',
  description: 'Información sobre tiempos de entrega, empresas de mensajería y costos de envío en Logickem.',
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <h2 className="text-base font-semibold text-gray-800 mb-3 pb-2 border-b border-gray-100">{title}</h2>
      <div className="text-sm text-gray-500 leading-relaxed space-y-2">{children}</div>
    </div>
  )
}

function InfoCard({ emoji, title, children }: { emoji: string; title: string; children: React.ReactNode }) {
  return (
    <div className="flex gap-4 bg-gray-50 border border-gray-100 rounded-xl px-5 py-4">
      <span className="text-2xl flex-shrink-0 mt-0.5">{emoji}</span>
      <div>
        <p className="text-sm font-semibold text-gray-700 mb-1">{title}</p>
        <div className="text-sm text-gray-500 leading-relaxed">{children}</div>
      </div>
    </div>
  )
}

export default function EnviosPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Sobre los envíos</h1>
        <p className="text-sm text-gray-400">Última actualización: abril 2026</p>
      </div>

      {/* Tiempos de entrega */}
      <Section title="Tiempos de entrega estimados">
        <p>
          Los tiempos indicados son estimados y pueden verse afectados por factores externos como
          condiciones climáticas, días festivos o alta demanda en temporadas especiales.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mt-4">
          <InfoCard emoji="🏠" title="Mismo departamento">
            La entrega se realiza generalmente <strong>al día siguiente hábil</strong> de confirmado y
            procesado tu pedido.
          </InfoCard>
          <InfoCard emoji="🗺️" title="Resto del país">
            Para otros departamentos el tiempo estimado es de{' '}
            <strong>2 a 5 días hábiles</strong>, dependiendo de la ubicación.
          </InfoCard>
        </div>
        <p className="mt-3 text-gray-400 text-xs">
          * Algunos productos con características especiales (indicados en su descripción) pueden requerir
          un tiempo de preparación o entrega adicional. Consulta los detalles de cada producto antes de realizar tu compra.
        </p>
      </Section>

      {/* Empresa de mensajería */}
      <Section title="Empresa de mensajería">
        <p>
          Trabajamos con <strong>Forza</strong> como nuestra empresa de mensajería principal, elegida por
          su cobertura nacional y confiabilidad en los tiempos de entrega.
        </p>
        <p>
          Si prefieres utilizar otra empresa de transporte o mensajería, con gusto lo coordinamos.
          Ten en cuenta que en ese caso <strong>los costos de envío y los tiempos de entrega pueden
          variar</strong> respecto a los indicados aquí, dependiendo del servicio que elijas.
          Contáctanos antes de realizar tu pedido para coordinar los detalles.
        </p>
      </Section>

      {/* Costos */}
      <Section title="Costos de envío">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
          <InfoCard emoji="📦" title="Envío estándar">
            El costo de envío es de <strong>Q35.00 fijos</strong> sin importar la cantidad de
            productos o el destino dentro del país.
          </InfoCard>
          <InfoCard emoji="🎉" title="Envío gratis">
            En pedidos con un total de <strong>Q500.00 o más</strong>, el envío es completamente
            <strong> gratis</strong>. El descuento se aplica automáticamente al confirmar tu compra.
          </InfoCard>
        </div>
        <p>
          En caso de devolución por arrepentimiento u otra razón personal, el costo del envío de
          regreso corre por cuenta del comprador. Consulta nuestra{' '}
          <Link href="/garantias" className="text-blue-600 hover:underline">
            política de garantías y devoluciones
          </Link>{' '}
          para más detalles.
        </p>
      </Section>

      {/* Seguimiento */}
      <Section title="Seguimiento de tu pedido">
        <p>
          Una vez que tu pedido sea enviado, podrás consultar su estado en todo momento desde la sección{' '}
          <Link href="/cuenta/pedidos" className="text-blue-600 hover:underline">Mis pedidos</Link>{' '}
          en tu cuenta, o usando el número de pedido que te enviamos por correo electrónico al confirmar
          tu compra.
        </p>
      </Section>

      {/* Contacto */}
      <div className="mt-4 bg-blue-50 border border-blue-100 rounded-2xl px-6 py-5 text-sm text-blue-700">
        <p className="font-medium mb-1">¿Tienes dudas sobre el envío de tu pedido?</p>
        <p>
          Escríbenos a{' '}
          <a href="mailto:soporte@logickem.com" className="font-medium underline hover:opacity-80">
            soporte@logickem.com
          </a>{' '}
          y te ayudamos a encontrar la mejor opción para ti. También puedes revisar nuestras{' '}
          <Link href="/faq" className="font-medium underline hover:opacity-80">
            preguntas frecuentes
          </Link>
          .
        </p>
      </div>
    </div>
  )
}
