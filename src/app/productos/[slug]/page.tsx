import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { tiendaApi } from '@/lib/api'
import { idFromSlug, toSlug } from '@/lib/utils'
import DetalleCliente from './DetalleCliente'
import type { Paginacion } from '@/types/producto'

const BASE        = process.env.NEXT_PUBLIC_SITE_URL  ?? 'https://logickem.com'
const STORE_NAME  = process.env.NEXT_PUBLIC_STORE_NAME ?? 'Logickem'

export const revalidate = 3600 // revalida cada hora sin necesitar rebuild

export async function generateStaticParams() {
  try {
    let page = 1, lastPage = 1
    const slugs: { slug: string }[] = []

    do {
      const data = await tiendaApi.productos.listar({ page, per_page: 100 })
      const meta = data.productos as unknown as Paginacion & { data: typeof data.productos.data }

      for (const p of meta.data ?? []) {
        slugs.push({ slug: toSlug(p.nombre, p.id) })
      }

      lastPage = meta.last_page ?? 1
      page++
    } while (page <= lastPage)

    return slugs
  } catch {
    return []
  }
}

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