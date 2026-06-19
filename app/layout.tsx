import type React from "react"
import type { Metadata, Viewport } from "next"
import "./globals.css"
import "leaflet/dist/leaflet.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"

// Optimize font loading
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  preload: true,
  fallback: ["system-ui", "sans-serif"],
})

export const metadata: Metadata = {
  title: {
    default: "Rayder - Modern Weather Application",
    template: "%s | Rayder Weather App",
  },
  description:
    "Get accurate real-time weather forecasts, interactive maps, air quality data, and weather alerts for any location worldwide. Modern, responsive weather app with dark mode support.",
  keywords: [
    "weather",
    "forecast",
    "weather app",
    "real-time weather",
    "weather maps",
    "air quality",
    "weather alerts",
    "responsive design",
    "dark mode",
    "PWA",
    "Next.js weather app",
  ],
  authors: [{ name: "Bijan Murmu", url: "https://github.com/bijanmurmu" }],
  creator: "Bijan Murmu",
  publisher: "Rayder",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "https://rayder-weather.vercel.app"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "Rayder - Modern Weather Application",
    description:
      "Get accurate real-time weather forecasts, interactive maps, air quality data, and weather alerts for any location worldwide.",
    siteName: "Rayder Weather App",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Rayder Weather App - Modern Weather Application",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Rayder - Modern Weather Application",
    description:
      "Get accurate real-time weather forecasts, interactive maps, air quality data, and weather alerts for any location worldwide.",
    images: ["/og-image.png"],
    creator: "@bijanmurmu",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  manifest: "/manifest.json",
  category: "weather",
  icons: [
    { rel: "icon", url: "/icon.svg", type: "image/svg+xml" },
    { rel: "icon", url: "/favicon.ico" },
    { rel: "icon", url: "/icons/icon-16.png", sizes: "16x16", type: "image/png" },
    { rel: "icon", url: "/icons/icon-32.png", sizes: "32x32", type: "image/png" },
    { rel: "apple-touch-icon", url: "/icons/apple-icon-180.png" },
  ],
    generator: 'v0.app'
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#1e40af" },
    { media: "(prefers-color-scheme: dark)", color: "#1e293b" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        {/* Preconnect to external domains */}
        <link rel="preconnect" href="https://openweathermap.org" />
        <link rel="dns-prefetch" href="https://openweathermap.org" />

        {/* Favicon - Additional explicit declarations for better browser support */}
        <link rel="icon" type="image/svg+xml" href="/icon.svg" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" type="image/png" sizes="16x16" href="/icons/icon-16.png" />
        <link rel="icon" type="image/png" sizes="32x32" href="/icons/icon-32.png" />
        <link rel="icon" type="image/png" sizes="48x48" href="/icons/icon-48.png" />
        <link rel="icon" type="image/png" sizes="192x192" href="/icons/icon-192.png" />

        {/* Apple Touch Icons */}
        <link rel="apple-touch-icon" href="/icons/apple-icon-180.png" />
        <link rel="apple-touch-icon" sizes="152x152" href="/icons/apple-icon-152.png" />
        <link rel="apple-touch-icon" sizes="180x180" href="/icons/apple-icon-180.png" />
        <link rel="apple-touch-icon" sizes="167x167" href="/icons/apple-icon-167.png" />

        {/* PWA meta tags */}
        <meta name="application-name" content="Rayder" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content="Rayder" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="msapplication-config" content="/browserconfig.xml" />
        <meta name="msapplication-TileColor" content="#1e40af" />
        <meta name="msapplication-tap-highlight" content="no" />

        {/* Structured data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "WebApplication",
              name: "Rayder Weather App",
              description:
                "Modern weather application with real-time forecasts, interactive maps, and air quality data",
              url: process.env.NEXT_PUBLIC_APP_URL || "https://rayder-weather.vercel.app",
              applicationCategory: "Weather",
              operatingSystem: "Any",
              offers: {
                "@type": "Offer",
                price: "0",
                priceCurrency: "USD",
              },
              author: {
                "@type": "Person",
                name: "Bijan Murmu",
                url: "https://github.com/bijanmurmu",
              },
              publisher: {
                "@type": "Organization",
                name: "Rayder",
              },
            }),
          }}
        />
      </head>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <main role="main" id="main-content">
            {children}
          </main>
        </ThemeProvider>
      </body>
    </html>
  )
}
