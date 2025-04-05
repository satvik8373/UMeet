import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Providers } from './providers'
import IOSInstallPrompt from './components/IOSInstallPrompt'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'UMeet - Connect and Watch Together',
  description: 'Watch videos together with friends in real-time. Chat, sync playback, and share moments.',
  icons: {
    icon: [
      {
        url: '/icon',
        sizes: '32x32',
        type: 'image/png',
      }
    ],
    apple: [
      {
        url: '/apple-icon',
        sizes: '180x180',
        type: 'image/png',
      }
    ],
  },
  openGraph: {
    title: 'UMeet - Connect and Watch Together',
    description: 'Watch videos together with friends in real-time. Chat, sync playback, and share moments.',
    url: 'https://umeet.onrender.com',
    siteName: 'UMeet',
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'UMeet - Connect and Watch Together',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'UMeet - Connect and Watch Together',
    description: 'Watch videos together with friends in real-time. Chat, sync playback, and share moments.',
    images: ['/opengraph-image'],
  },
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'UMeet',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 1,
    userScalable: false,
  },
  themeColor: '#1a1a1a',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="theme-color" content="#00a8ff" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-title" content="UMeet" />
      </head>
      <body className={inter.className}>
        <Providers>{children}</Providers>
        <IOSInstallPrompt />
      </body>
    </html>
  )
} 