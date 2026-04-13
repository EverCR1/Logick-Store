import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Política de Privacidad',
  description: 'Conoce cómo Logickem recopila, usa y protege tu información personal.',
}

export default function PrivacidadPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold text-gray-900 mb-2">Política de Privacidad</h1>
      <p className="text-sm text-gray-400 mb-10">Última actualización: abril 2026</p>

      <Section title="1. Información general">
        <p>
          Logickem (&quot;nosotros&quot;, &quot;nuestro&quot;) opera el sitio web logickem.com. Esta política explica
          cómo recopilamos, usamos y protegemos tu información personal cuando usas nuestros servicios.
        </p>
      </Section>

      <Section title="2. Datos que recopilamos">
        <p>Cuando creas una cuenta o realizas una compra, podemos recopilar:</p>
        <ul>
          <li><strong>Datos de identidad:</strong> nombre y apellido</li>
          <li><strong>Datos de contacto:</strong> correo electrónico y teléfono</li>
          <li><strong>Datos de entrega:</strong> dirección, municipio y departamento</li>
          <li><strong>Datos de cuenta Google:</strong> nombre, correo y foto de perfil (solo si usas &quot;Iniciar sesión con Google&quot;)</li>
          <li><strong>Datos de actividad:</strong> historial de pedidos, reseñas, preguntas y puntos acumulados</li>
        </ul>
      </Section>

      <Section title="3. Cómo usamos tus datos">
        <p>Usamos tu información para:</p>
        <ul>
          <li>Procesar y entregar tus pedidos</li>
          <li>Gestionar tu cuenta y puntos de fidelidad</li>
          <li>Enviarte confirmaciones y actualizaciones de pedidos</li>
          <li>Responder tus consultas de soporte</li>
          <li>Mejorar nuestros productos y servicios</li>
        </ul>
      </Section>

      <Section title="4. Compartición de datos">
        <p>No vendemos ni compartimos tu información personal con terceros, excepto:</p>
        <ul>
          <li>
            <strong>Google:</strong> si usas inicio de sesión con Google, aplica la{' '}
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer">
              Política de privacidad de Google
            </a>
          </li>
          <li><strong>Obligación legal:</strong> cuando sea requerido por ley o autoridad competente en Guatemala</li>
        </ul>
      </Section>

      <Section title="5. Almacenamiento y seguridad">
        <p>
          Tu información se almacena en servidores seguros. Implementamos medidas técnicas para proteger
          tus datos contra acceso no autorizado. Las contraseñas se almacenan cifradas y nunca en texto plano.
        </p>
      </Section>

      <Section title="6. Tus derechos">
        <p>Tienes derecho a:</p>
        <ul>
          <li>Acceder a los datos que tenemos sobre ti</li>
          <li>Solicitar corrección de datos incorrectos</li>
          <li>Solicitar la eliminación de tu cuenta y datos personales</li>
          <li>Retirar tu consentimiento en cualquier momento</li>
        </ul>
        <p>
          Para ejercer estos derechos escríbenos a{' '}
          <a href="mailto:soporte@logickem.com">soporte@logickem.com</a>.
        </p>
      </Section>

      <Section title="7. Cookies">
        <p>
          Usamos cookies esenciales para mantener tu sesión activa. No usamos cookies de seguimiento ni publicidad.
        </p>
      </Section>

      <Section title="8. Menores de edad">
        <p>
          Nuestros servicios están dirigidos a personas mayores de 18 años. No recopilamos
          intencionalmente datos de menores.
        </p>
      </Section>

      <Section title="9. Cambios a esta política">
        <p>
          Podemos actualizar esta política ocasionalmente. Te notificaremos por correo electrónico
          ante cambios significativos.
        </p>
      </Section>

      <Section title="10. Contacto">
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