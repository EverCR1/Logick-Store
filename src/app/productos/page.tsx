import type { Metadata } from 'next'
import CatalogoCliente from './CatalogoCliente'

export const metadata: Metadata = { title: 'Productos' }

export default function ProductosPage() {
  return <CatalogoCliente />
}
