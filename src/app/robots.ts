import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  const url = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://logickem.com'
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/cuenta/', '/checkout', '/carrito'],
    },
    sitemap: `${url}/sitemap.xml`,
  }
}