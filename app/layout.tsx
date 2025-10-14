import type { Metadata, Viewport } from 'next'
import { Analytics } from '@vercel/analytics/next'
import { Inter } from 'next/font/google'
import Script from 'next/script'
import './globals.css'

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? 'https://tinhthue.vn'

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Tính Thuế TNCN mới 2026 - Miễn phí',
    template: '%s | Máy tính Thuế TNCN',
  },
  description:
    'Công cụ tính thuế thu nhập cá nhân chính xác, cập nhật 2026. Hỗ trợ giảm trừ, BHXH/BHYT/BHTN, net↔gross, biểu thuế lũy tiến.',
  keywords: [
    'máy tính thuế TNCN',
    'tính thuế thu nhập cá nhân',
    'thuế Việt Nam',
    'thuế TNCN',
    'gross to net',
    'VND',
  ],
  applicationName: 'Máy tính Thuế TNCN',
  generator: 'du',
  alternates: {
    canonical: '/',
    languages: {
      'vi-VN': '/',
      'x-default': '/',
    },
  },
  openGraph: {
    title: 'Tính Thuế TNCN mới 2026 - Miễn phí',
    description:
      'Công cụ tính thuế thu nhập cá nhân chính xác, cập nhật 2026. Hỗ trợ giảm trừ, BHXH/BHYT/BHTN, net↔gross, biểu thuế lũy tiến.',
    url: '/',
    siteName: 'Máy tính Thuế TNCN',
    locale: 'vi_VN',
    type: 'website',
  },
  twitter: {
    card: 'summary',
    title: 'Tính Thuế TNCN mới 2026 - Miễn phí',
    description:
      'Công cụ tính thuế thu nhập cá nhân chính xác, cập nhật 2026. Hỗ trợ giảm trừ, BHXH/BHYT/BHTN, net↔gross, biểu thuế lũy tiến.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GSC_VERIFICATION,
  },
  other: {
    currency: 'VND',
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: '/logo.ico' },
      { url: '/logo.png', type: 'image/png' },
    ],
    shortcut: ['/logo.ico'],
    apple: [{ url: '/logo.png', type: 'image/png' }],
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  viewportFit: 'cover',
}


const inter = Inter({
  weight: '500',
  subsets: ['vietnamese', 'latin'],
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const organizationLd = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Máy tính Thuế TNCN',
    url: SITE_URL,
    alternateName: 'Tax Calculator',
  }

  const websiteLd = {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: 'Máy tính Thuế TNCN',
    url: SITE_URL,
    inLanguage: 'vi-VN',
  }

  const breadcrumbLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      {
        '@type': 'ListItem',
        position: 1,
        name: 'Trang chủ',
        item: SITE_URL,
      },
    ],
  }

  return (
    <html lang="vi-VN">
      <body className={`${inter.className}`}>
        <Script id="ld-org" type="application/ld+json" strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }} />
        <Script id="ld-website" type="application/ld+json" strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }} />
        <Script id="ld-breadcrumb" type="application/ld+json" strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />
        {children}
        <Analytics />
      </body>
    </html>
  )
}
