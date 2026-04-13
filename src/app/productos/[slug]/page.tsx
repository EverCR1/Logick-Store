import { notFound } from 'next/navigation'
import { tiendaApi } from '@/lib/api'
import { idFromSlug } from '@/lib/utils'
import DetalleCliente from './DetalleCliente'

interface Props {
  params: Promise<{ slug: string }>
}

export default async function ProductoDetallePage({ params }: Props) {
  const { slug } = await params
  const id = idFromSlug(slug)

  if (!id) notFound()

  try {
    const data = await tiendaApi.productos.detalle(id)
    if (!data.success || !data.producto) notFound()
    return <DetalleCliente producto={data.producto} />
  } catch {
    notFound()
  }
}