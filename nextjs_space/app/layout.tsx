
import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { Toaster } from '@/components/ui/toaster'
import { SessionProvider } from 'next-auth/react'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth'
import Providers from '@/components/providers'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Finanzas Personales - Gestiona tu dinero inteligentemente | atonixdev.com',
  description: 'Aplicación completa para gestionar tus finanzas personales con seguimiento de gastos, presupuestos, análisis con IA y modo business para autónomos. Powered by atonixdev.com',
  keywords: [
    'finanzas personales',
    'gestión de gastos',
    'presupuestos',
    'análisis financiero',
    'IA',
    'autónomos',
    'freelancers',
    'facturación',
    'contabilidad',
    'atonixdev'
  ],
  authors: [{ name: 'atonixdev.com', url: 'https://atonixdev.com' }],
  creator: 'atonixdev.com',
  publisher: 'atonixdev.com',
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    url: 'https://finanzas.atonixdev.com',
    title: 'Finanzas Personales - Gestiona tu dinero inteligentemente',
    description: 'Aplicación completa para gestionar tus finanzas personales con IA. Modo personal y business para autónomos.',
    siteName: 'Finanzas Personales - atonixdev.com',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Finanzas Personales - atonixdev.com',
    description: 'Gestiona tus finanzas con IA. Personal y Business.',
    creator: '@atonixdev',
  },
  metadataBase: new URL(process.env.NEXTAUTH_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const session = await getServerSession(authOptions)

  return (
    <html lang="es" suppressHydrationWarning>
      <body className={inter.className}>
        <Providers session={session}>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            <div className="min-h-screen bg-background">
              {children}
            </div>
            <Toaster />
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  )
}
