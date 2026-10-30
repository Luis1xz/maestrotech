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
  title: 'MaestroTech — La plataforma del docente colombiano',
  description:
    'MaestroTech es la plataforma educativa más avanzada para docentes colombianos. Prepárate para concursos de méritos, ascensos, traslados y desarrollo profesional continuo.',
  keywords: ['MaestroTech', 'docentes Colombia', 'concurso méritos', 'ascenso docente', 'evaluación docente'],
  openGraph: {
    title: 'MaestroTech — La plataforma del docente colombiano',
    description: 'El futuro del desarrollo profesional docente empieza aquí con MaestroTech.',
    type: 'website',
  },
  icons: {
    icon: '/logo.png',
    shortcut: '/logo.png',
    apple: '/apple-icon.png',
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
