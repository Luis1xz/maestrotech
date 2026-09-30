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
  title: 'Maestro — La plataforma del docente colombiano',
  description:
    'La plataforma educativa más avanzada para docentes colombianos. Prepárate para concursos de méritos, ascensos, traslados y desarrollo profesional continuo.',
  keywords: ['docentes Colombia', 'concurso méritos', 'ascenso docente', 'evaluación docente'],
  openGraph: {
    title: 'Maestro — La plataforma del docente colombiano',
    description: 'El futuro del desarrollo profesional docente empieza aquí.',
    type: 'website',
  },
  icons: {
    icon: '/logo.jpg',
    shortcut: '/logo.jpg',
    apple: '/logo.jpg',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#fafafa' },
    { media: '(prefers-color-scheme: dark)', color: '#0b0b0d' },
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
