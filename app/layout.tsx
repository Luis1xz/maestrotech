import type { Metadata, Viewport } from 'next'
import { Inter, Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-inter',
  display: 'swap',
})

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://legadodocente.com'),
  title: 'Legado Docente — «Aprende, comparte, deja huella»',
  description:
    'Legado Docente es la plataforma oficial de preparación para el Concurso de Méritos Docente en Colombia. Curso integral de 140 horas, simulacros oficiales y caracterización inteligente.',
  keywords: [
    'Legado Docente',
    'Aprende comparte deja huella',
    'Concurso Docente 2917-3006',
    'concurso méritos docente',
    'Decreto Ley 1278',
    'CNSC',
    'SIMO',
    'evaluación docente',
  ],
  openGraph: {
    title: 'Legado Docente — «Aprende, comparte, deja huella»',
    description: 'Prepárate con método, fuentes oficiales y una comunidad de colegas. Curso oficial de 140 horas.',
    type: 'website',
    url: 'https://legadodocente.com',
    siteName: 'Legado Docente',
  },
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-32.png', type: 'image/png', sizes: '32x32' },
      { url: '/favicon-16.png', type: 'image/png', sizes: '16x16' },
    ],
    shortcut: '/favicon.ico',
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180', type: 'image/png' },
    ],
  },
  manifest: '/site.webmanifest',
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#0038DF',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html
      lang="es"
      className={`${inter.variable} ${plusJakarta.variable} bg-background`}
      suppressHydrationWarning
    >
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32.png" />
        <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16.png" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <link rel="manifest" href="/site.webmanifest" />
      </head>
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  )
}
