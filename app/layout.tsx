import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { Toaster } from 'react-hot-toast'
import NavigationProvider from '@/components/NavigationProvider'
import SmoothScroll from '@/components/SmoothScroll'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Trinck - Modern Transport Platform',
  description: 'Connect drivers with customers for seamless transportation services on Trinck. Find jobs, track shipments, and manage payments all in one place.',
  keywords: 'transport, logistics, trucking, shipping, delivery, freight',
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
        <link rel="icon" href="/favicon.ico" />
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
            {children}
          </NavigationProvider>
        </SmoothScroll>
      </body>
    </html>
  )
}