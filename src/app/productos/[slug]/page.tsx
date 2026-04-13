import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { tiendaApi } from '@/lib/api'
import { idFromSlug } from '@/lib/utils'
import DetalleCliente from './DetalleCliente'

const BASE        = process.env.NEXT_PUBLIC_SITE_URL  ?? 'https://logickem.com'
const STORE_NAME  = process.env.NEXT_PUBLIC_STORE_NAME ?? 'Logickem'

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const id = idFromSlug(slug)
  if (!id) return {}

  try {
    const data = await tiendaApi.productos.detalle(id)
    const p    = data.producto
    if (!p) return {}

    const title       = p.nombre
    const description = p.descripcion
      ? p.descripcion.replace(/<[^>]+>/g, '').slice(0, 160)
      : `Compra ${p.nombre} en ${STORE_NAME}. Envío a toda Guatemala.`
    const imageUrl    = p.imagen_principal ?? undefined
    const pageUrl     = `${BASE}/productos/${slug}`

    return {
      title,
      description,
      openGraph: {
        title,
        description,
        url:    pageUrl,
        type:   'website',
        ...(imageUrl && { images: [{ url: imageUrl, alt: title }] }),
      },
      twitter: {
        card:        'summary_large_image',
        title,
        description,
        ...(imageUrl && { images: [imageUrl] }),
      },
      alternates: { canonical: pageUrl },
    }
  } catch {
    return {}
  }
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