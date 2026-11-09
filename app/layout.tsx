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
  },
  icons: {
    icon: '/logo-icon.png',
    shortcut: '/logo-icon.png',
    apple: '/logo-icon.png',
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GOOGLE_SITE_VERIFICATION || undefined,
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#F3F8FD' },
    { media: '(prefers-color-scheme: dark)', color: '#142D49' },
  ],
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
      <body className="antialiased font-sans">
        {children}
      </body>
    </html>
  )
}
