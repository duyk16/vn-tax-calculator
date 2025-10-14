import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { Inter } from 'next/font/google'
import './globals.css'

export const metadata: Metadata = {
  title: 'Tax Calculator',
  description:
    'Tax Calculator is a tool to help you calculate your tax based on new law in 2025.',
  generator: 'du',
}

const inter = Inter({
  weight: '500',
  subsets: ['latin'],
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className}`}>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
