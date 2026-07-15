import type { Metadata, Viewport } from 'next'
import { Poppins, Inter } from 'next/font/google'
import { AuthProvider } from '@/components/AuthProvider'
import { QueryProvider } from '@/components/providers/QueryProvider'
import { PWAProvider } from '@/components/providers/PWAProvider'
import { AppFrame } from '@/components/layout/AppFrame'
import './globals.css'

const poppins = Poppins({
  subsets: ['latin'],
  weight: ['600', '700'],
  variable: '--font-poppins',
})

const inter = Inter({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-inter',
})

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'),
  title: 'Qhatu — Tu mundo. Tus chismes.',
  description: 'La red social anónima de tu universidad',
  manifest: '/manifest.json',
  applicationName: 'Qhatu',
  appleWebApp: { capable: true, statusBarStyle: 'black-translucent', title: 'Qhatu' },
  icons: { icon: '/isotipo.png', apple: '/isotipo.png' },
  formatDetection: { telephone: false },
  openGraph: {
    type: 'website', siteName: 'Qhatu', title: 'Qhatu — Tu mundo. Tus chismes.',
    description: 'La red social anónima de tu universidad', images: ['/isotipo.png'],
  },
  twitter: {
    card: 'summary', title: 'Qhatu — Tu mundo. Tus chismes.',
    description: 'La red social anónima de tu universidad', images: ['/isotipo.png'],
  },
}

export const viewport: Viewport = {
  themeColor: '#7B3FF2',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es" className={`${poppins.variable} ${inter.variable}`}>
      <body className="bg-carbon text-white font-body antialiased">
        <QueryProvider>
          <AuthProvider>
            <PWAProvider>
              <AppFrame>{children}</AppFrame>
            </PWAProvider>
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  )
}
