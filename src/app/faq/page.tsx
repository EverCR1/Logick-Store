'use client'

import { useState } from 'react'
import type { Metadata } from 'next'

function ChevronDownIcon({ className }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none"
      stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
      className={className}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  )
}

const faqs = [
  {
    pregunta: '¿Cómo hago un pedido?',
    respuesta:
      'Agrega los productos que deseas a tu carrito, luego ve al carrito y presiona "Proceder al pago". Completa tus datos de envío y elige el método de pago. Recibirás un correo de confirmación con el número de tu pedido.',
  },
  {
    pregunta: '¿Cuáles son los métodos de pago disponibles?',
    respuesta:
      'Aceptamos pago en efectivo contra entrega, transferencia bancaria y depósito. Al finalizar tu pedido encontrarás los datos necesarios para completar tu pago.',
  },
  {
    pregunta: '¿Cuánto tiempo tarda mi pedido en llegar?',
    respuesta:
      'El tiempo de entrega depende de tu ubicación. Generalmente los pedidos dentro del municipio se entregan el mismo día o al día siguiente. Para otros departamentos el tiempo estimado es de 2 a 5 días hábiles.',
  },
  {
    pregunta: '¿Cómo puedo rastrear mi pedido?',
    respuesta:
      'Puedes consultar el estado de tu pedido en cualquier momento ingresando a "Mis pedidos" en tu cuenta, o usando el número de pedido que te enviamos por correo electrónico.',
  },
  {
    pregunta: '¿Puedo cancelar o modificar mi pedido?',
    respuesta:
      'Puedes solicitar la cancelación o modificación de tu pedido mientras esté en estado "Pendiente" o "Confirmado". Una vez que el pedido está en preparación ya no es posible hacer cambios. Contáctanos lo antes posible a soporte@logickem.com.',
  },
  {
    pregunta: '¿Qué hago si recibí un producto dañado o incorrecto?',
    respuesta:
      'Comunícate con nosotros dentro de las 48 horas siguientes a la recepción del pedido a soporte@logickem.com con fotos del producto y tu número de pedido. Gestionaremos el cambio o reembolso según corresponda.',
  },
  {
    pregunta: '¿Los precios incluyen IVA?',
    respuesta:
      'Sí, todos los precios mostrados en la tienda incluyen IVA.',
  },
  {
    pregunta: '¿Necesito crear una cuenta para comprar?',
    respuesta:
      'No es obligatorio. Puedes realizar tu pedido como invitado ingresando solo tu correo y datos de envío. Sin embargo, al crear una cuenta puedes rastrear tus pedidos, guardar direcciones y acumular puntos de fidelidad.',
  },
  {
    pregunta: '¿Cómo funciona el programa de puntos?',
    respuesta:
      'Por cada compra completada acumulas puntos equivalentes a un porcentaje del monto total. Estos puntos pueden canjearse como descuento en futuras compras. Consulta los detalles en la sección "Mis puntos" dentro de tu cuenta.',
  },
  {
    pregunta: '¿Cómo puedo usar un cupón de descuento?',
    respuesta:
      'En el paso de pago encontrarás un campo para ingresar tu código de cupón. Aplícalo antes de confirmar el pedido para que el descuento se refleje en el total.',
  },
]

function FaqItem({ pregunta, respuesta }: { pregunta: string; respuesta: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="border-b border-gray-100 last:border-0">
      <button
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between py-5 text-left gap-4"
      >
        <span className="text-gray-800 font-medium text-sm sm:text-base">{pregunta}</span>
        <ChevronDownIcon
          className={`w-5 h-5 text-gray-400 flex-shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
        />
      </button>
      {open && (
        <p className="pb-5 text-sm text-gray-500 leading-relaxed">{respuesta}</p>
      )}
    </div>
  )
}

export default function FaqPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Preguntas frecuentes</h1>
        <p className="text-gray-500 text-sm">
          Si no encuentras respuesta a tu duda, escríbenos a{' '}
          <a href="mailto:soporte@logickem.com" className="text-blue-600 hover:underline">
            soporte@logickem.com
          </a>
        </p>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 px-6">
        {faqs.map((faq, i) => (
          <FaqItem key={i} pregunta={faq.pregunta} respuesta={faq.respuesta} />
        ))}
      </div>
    </div>
  )
}
