import type React from "react"
import { GeistSans } from "geist/font/sans"
import { GeistMono } from "geist/font/mono"
import "./globals.css"

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://lensbyjrr.vercel.app"),
  title: {
    default: "LENSBYJRR — Blog de Fotografía",
    template: "%s | LENSBYJRR",
  },
  description: "LENSBYJRR: Portafolio y blog de fotografía. Explora mi trabajo por categorías y etiquetas.",
  icons: {
    icon: "/icon.png",
    apple: "/apple-icon.png",
  },
  openGraph: {
    title: "LENSBYJRR — Blog de Fotografía",
    description: "Explora mi trabajo fotográfico y contáctame para sesiones o colaboraciones.",
    url: "/",
    siteName: "LENSBYJRR",
    images: [{ url: "/logo.png", width: 1200, height: 630 }],
    locale: "es_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "LENSBYJRR — Blog de Fotografía",
    images: ["/logo.png"],
  },
  themeColor: "#7e22ce",
    generator: 'v0.dev'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <head>
        <style>{`
html {
  font-family: ${GeistSans.style.fontFamily};
  --font-sans: ${GeistSans.variable};
  --font-mono: ${GeistMono.variable};
}
        `}</style>
      </head>
      <body>{children}</body>
    </html>
  )
}
