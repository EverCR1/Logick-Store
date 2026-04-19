import type { Metadata } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import Providers from './providers'
import Header from '@/components/layout/Header'
import Footer from '@/components/layout/Footer'
import AnnouncementBar from '@/components/layout/AnnouncementBar'

const font = Plus_Jakarta_Sans({ subsets: ['latin'], weight: ['400', '500', '600', '700', '800'] })

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://logickem.com'

export const metadata: Metadata = {
  metadataBase: new URL(BASE),
  title: {
    default: process.env.NEXT_PUBLIC_STORE_NAME ?? 'Logickem',
    template: `%s | ${process.env.NEXT_PUBLIC_STORE_NAME ?? 'Logickem'}`,
  },
  description: 'Logickem — tienda de tecnología en Guatemala. Computadoras, celulares, audio, gaming y accesorios con envío a todo el país.',
  alternates: {
    canonical: BASE,
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className="h-full">
      <body className={`${font.className} min-h-full flex flex-col antialiased bg-white text-gray-900`}>
        <Providers>
          <AnnouncementBar />
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
        </Providers>
      </body>
    </html>
  )
}