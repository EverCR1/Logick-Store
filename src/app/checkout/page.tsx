import { Metadata } from 'next'
import CheckoutForm from './CheckoutForm'

export const metadata: Metadata = { title: 'Finalizar pedido' }

export default function CheckoutPage() {
  return <CheckoutForm />
}