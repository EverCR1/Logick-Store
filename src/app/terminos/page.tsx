import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Términos de Servicio',
  description: 'Lee los términos y condiciones de uso de Logickem.',
}

export default function TerminosPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Términos de Servicio</h1>
      <p className="text-sm text-gray-400 mb-10">Última actualización: abril 2026</p>

      <Section title="1. Aceptación">
        <p>
          Al usar logickem.com aceptas estos términos. Si no estás de acuerdo, no uses el sitio.
        </p>
      </Section>

      <Section title="2. Descripción del servicio">
        <p>
          Logickem es una tienda en línea que ofrece productos y licencias de software.
          Operamos principalmente en Guatemala.
        </p>
      </Section>

      <Section title="3. Cuentas de usuario">
        <ul>
          <li>Debes proporcionar información veraz al registrarte</li>
          <li>Eres responsable de mantener la confidencialidad de tu contraseña</li>
          <li>Nos reservamos el derecho de suspender cuentas que violen estos términos</li>
        </ul>
      </Section>

      <Section title="4. Pedidos y pagos">
        <ul>
          <li>Los precios están expresados en Quetzales (GTQ)</li>
          <li>Un pedido se confirma una vez verificado el pago</li>
          <li>Nos reservamos el derecho de cancelar pedidos en caso de error de precio o falta de stock</li>
        </ul>
      </Section>

      <Section title="5. Envíos y entregas">
        <ul>
          <li>Los envíos se realizan a nivel nacional en Guatemala</li>
          <li>Los tiempos de entrega son estimados y pueden variar</li>
          <li>Las licencias de software se entregan de forma digital</li>
        </ul>
      </Section>

      <Section title="6. Devoluciones">
        <ul>
          <li>
            Los productos físicos pueden devolverse dentro de los 7 días siguientes a la entrega
            si presentan defectos de fábrica. No aplica en casos de mal uso, daños físicos
            causados por el cliente (golpes, rayaduras, líquidos u otros) o desgaste por uso inadecuado
          </li>
          <li>Las licencias de software no son reembolsables una vez entregadas</li>
          <li>
            Para iniciar una devolución contacta a{' '}
            <a href="mailto:soporte@logickem.com">soporte@logickem.com</a>
          </li>
        </ul>
      </Section>

      <Section title="7. Sistema de puntos y cupones">
        <ul>
          <li>
            Los puntos acumulados no tienen valor monetario directo y solo pueden canjearse
            por cupones de descuento dentro de logickem.com
          </li>
          <li>Los cupones tienen fecha de vencimiento y no son transferibles</li>
          <li>
            Nos reservamos el derecho de modificar o cancelar el programa de puntos con previo aviso
          </li>
        </ul>
      </Section>

      <Section title="8. Propiedad intelectual">
        <p>
          El nombre comercial y logotipo de Logickem son propiedad de la empresa y no pueden
          ser reproducidos ni utilizados sin autorización. Las imágenes de productos pueden
          ser propiedad de sus respectivos fabricantes o proveedores.
        </p>
      </Section>

      <Section title="9. Limitación de responsabilidad">
        <p>
          Logickem no se hace responsable por daños indirectos derivados del uso del sitio
          o retrasos por causas ajenas a nuestro control (desastres naturales, problemas de
          transporte, etc.).
        </p>
      </Section>

      <Section title="10. Ley aplicable">
        <p>
          Estos términos se rigen por las leyes de la República de Guatemala.
        </p>
      </Section>

      <Section title="11. Contacto">
        <p>
          <strong>Logickem</strong><br />
          Correo: <a href="mailto:soporte@logickem.com">soporte@logickem.com</a><br />
          Guatemala
        </p>
      </Section>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mb-8">
      <h2 className="text-lg font-semibold text-gray-800 mb-3">{title}</h2>
      <div className="text-gray-600 leading-relaxed space-y-2 [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:space-y-1 [&_a]:text-green-600 [&_a]:underline [&_a]:hover:text-green-700">
        {children}
      </div>
    </section>
  )
}