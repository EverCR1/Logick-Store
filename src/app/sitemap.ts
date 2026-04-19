import type { MetadataRoute } from 'next'
import { tiendaApi } from '@/lib/api'
import { toSlug } from '@/lib/utils'
import type { Paginacion } from '@/types/producto'

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://logickem.com'

const STATIC: MetadataRoute.Sitemap = [
  { url: BASE,                      priority: 1.0, changeFrequency: 'daily',   lastModified: new Date() },
  { url: `${BASE}/productos`,       priority: 0.9, changeFrequency: 'daily',   lastModified: new Date() },
  { url: `${BASE}/garantias`,       priority: 0.5, changeFrequency: 'monthly', lastModified: new Date() },
  { url: `${BASE}/envios`,          priority: 0.5, changeFrequency: 'monthly', lastModified: new Date() },
  { url: `${BASE}/faq`,             priority: 0.5, changeFrequency: 'monthly', lastModified: new Date() },
  { url: `${BASE}/terminos`,        priority: 0.3, changeFrequency: 'yearly',  lastModified: new Date() },
  { url: `${BASE}/privacidad`,      priority: 0.3, changeFrequency: 'yearly',  lastModified: new Date() },
]

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  try {
    let page     = 1
    let lastPage = 1
    const urls: MetadataRoute.Sitemap = []

    do {
      const data = await tiendaApi.productos.listar({ page, per_page: 100 })
      const meta = data.productos as unknown as Paginacion & { data: typeof data.productos.data }

      for (const p of meta.data ?? []) {
        urls.push({
          url:             `${BASE}/productos/${toSlug(p.nombre, p.id)}`,
          priority:        0.8,
          changeFrequency: 'weekly',
          lastModified:    new Date(),
        })
      }

      lastPage = meta.last_page ?? 1
      page++
    } while (page <= lastPage)

    return [...STATIC, ...urls]
  } catch {
    return STATIC
  }
}