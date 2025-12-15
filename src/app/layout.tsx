import { GoogleAnalytics } from "@next/third-parties/google"
import { Analytics } from "@vercel/analytics/next"
import { SpeedInsights } from "@vercel/speed-insights/next"
import type { Metadata, Viewport } from "next"
import { Inter } from "next/font/google"
import Script from "next/script"

import "./globals.css"

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tinhthue.vn"

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Tính Thuế TNCN mới 2026 - Miễn phí",
    template: "%s | Máy tính Thuế TNCN",
  },
  description:
    "Công cụ tính thuế thu nhập cá nhân chính xác, cập nhật 2026. Hỗ trợ giảm trừ, BHXH/BHYT/BHTN, net↔gross, biểu thuế lũy tiến.",
  keywords: [
    "máy tính thuế TNCN",
    "tính thuế thu nhập cá nhân",
    "thuế Việt Nam",
    "thuế TNCN",
    "gross to net",
    "VND",
    "tính lương",
    "tính lương ròng",
    "tính lương net",
    "tính lương gross",
    "tính lương sau thuế",
    "tính lương trước thuế",
    "tool tính lương",
    "công cụ tính lương",
    "tính lương BHXH",
    "tính lương BHYT",
    "tính lương BHTN",
  ],
  applicationName: "Máy tính Thuế TNCN",
  generator: "du",
  alternates: {
    canonical: "/",
    languages: {
      "vi-VN": "/",
      "x-default": "/",
    },
  },
  openGraph: {
    title: "Tính Thuế TNCN mới 2026 - Miễn phí",
    description:
      "Công cụ tính thuế thu nhập cá nhân chính xác, cập nhật 2026. Hỗ trợ giảm trừ, BHXH/BHYT/BHTN, net↔gross, biểu thuế lũy tiến.",
    url: "/",
    siteName: "Máy tính Thuế TNCN",
    locale: "vi_VN",
    type: "website",
    images: [
      {
        url: "/tinhthue-preview-v0.1.0.png",
        width: 1200,
        height: 630,
        alt: "Tính Thuế TNCN Preview",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Tính Thuế TNCN mới 2026 - Miễn phí",
    description:
      "Công cụ tính thuế thu nhập cá nhân chính xác, cập nhật 2026. Hỗ trợ giảm trừ, BHXH/BHYT/BHTN, net↔gross, biểu thuế lũy tiến.",
    images: ["/tinhthue-preview-v0.1.0.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  verification: {
    google: process.env.NEXT_PUBLIC_GSC_VERIFICATION,
  },
  other: {
    currency: "VND",
  },
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", type: "image/x-icon" },
      { url: "/logo.png", type: "image/png" },
    ],
    shortcut: ["/favicon.ico"],
    apple: [{ url: "/logo.png", type: "image/png" }],
  },
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
}

const inter = Inter({
  weight: "500",
  subsets: ["vietnamese", "latin"],
})

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const organizationLd = {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "Máy tính Thuế TNCN",
    url: SITE_URL,
    alternateName: "Tax Calculator",
  }

  const websiteLd = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "Máy tính Thuế TNCN",
    url: SITE_URL,
    inLanguage: "vi-VN",
  }

  const breadcrumbLd = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: [
      {
        "@type": "ListItem",
        position: 1,
        name: "Trang chủ",
        item: SITE_URL,
      },
    ],
  }

  const faqLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "Thuế TNCN mới 2026 thay đổi như thế nào?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Luật thuế mới 2026 giảm từ 7 bậc xuống 5 bậc, tăng mức giảm trừ gia cảnh từ 11 triệu lên 15.5 triệu, và giảm trừ người phụ thuộc từ 4.4 triệu lên 6.2 triệu.",
        },
      },
      {
        "@type": "Question",
        name: "Mức giảm trừ gia cảnh năm 2026 là bao nhiêu?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Mức giảm trừ gia cảnh bản thân là 15.5 triệu đồng/tháng, và mức giảm trừ cho mỗi người phụ thuộc là 6.2 triệu đồng/tháng.",
        },
      },
      {
        "@type": "Question",
        name: "Cách tính thuế TNCN theo biểu thuế lũy tiến?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Thu nhập chịu thuế được tính bằng lương gross trừ đi bảo hiểm và các khoản giảm trừ. Phần thu nhập chịu thuế sẽ được áp dụng thuế suất lũy tiến từ 5% đến 35% tùy theo mức thu nhập.",
        },
      },
    ],
  }

  const webAppLd = {
    "@context": "https://schema.org",
    "@type": "WebApplication",
    name: "Máy tính Thuế TNCN",
    description: "Công cụ tính thuế thu nhập cá nhân chính xác, cập nhật 2026",
    url: SITE_URL,
    applicationCategory: "FinanceApplication",
    operatingSystem: "Any",
    browserRequirements: "Requires JavaScript",
    offers: {
      "@type": "Offer",
      price: "0",
      priceCurrency: "VND",
    },
    inLanguage: "vi-VN",
  }


  return (
    <html lang="vi-VN">
      <body className={`${inter.className}`}>
        <Script
          id="ld-org"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationLd) }}
        />
        <Script
          id="ld-website"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(websiteLd) }}
        />
        <Script
          id="ld-breadcrumb"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }}
        />
        <Script
          id="ld-faq"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
        <Script
          id="ld-webapp"
          type="application/ld+json"
          strategy="afterInteractive"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(webAppLd) }}
        />
        <div className="flex flex-col min-h-screen">
          <main className="flex-1">{children}</main>
        </div>
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID ?? ""} />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
