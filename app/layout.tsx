import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import toast, { Toaster } from 'react-hot-toast'
import NavigationProvider from '@/components/NavigationProvider'
import SmoothScroll from '@/components/SmoothScroll'
import SubscriptionExpiryNotification from '@/components/SubscriptionExpiryNotification'
import SessionManager from '@/components/SessionManager'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Trinck - Modern Transport Platform',
  description: 'Connect drivers with customers for seamless transportation services on Trinck. Find jobs, track shipments, and manage payments all in one place.',
  keywords: 'transport, logistics, trucking, shipping, delivery, freight',
  icons: {
    icon: '/logo.ico',
    shortcut: '/logo.ico',
    apple: '/logo.png',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=0, viewport-fit=cover" />
        <link rel="icon" href="/logo.ico" type="image/x-icon" />
        <link rel="shortcut icon" href="/logo.ico" type="image/x-icon" />
        <link rel="apple-touch-icon" href="/logo.png" />
      </head>
      <body className={inter.className}>
        <SmoothScroll>
          <NavigationProvider>
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
              }}
            />
            <SessionManager />
            {children}
            <SubscriptionExpiryNotification />
          </NavigationProvider>
        </SmoothScroll>
      </body>
    </html>
  )
}