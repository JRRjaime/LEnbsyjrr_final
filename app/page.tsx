import type { Metadata } from "next"
import { PhotoBlog } from "@/components/photo-blog"

export const metadata: Metadata = {
  title: "LENSBYJRR — Blog de Fotografía",
  description:
    "LENSBYJRR: Portafolio y blog de fotografía. Explora categorías, etiquetas, lightbox, comentarios y reacciones. Contacta para sesiones o colaboraciones.",
  openGraph: {
    title: "LENSBYJRR — Blog de Fotografía",
    description: "Explora mi trabajo fotográfico por categorías y etiquetas. Contacta para sesiones o colaboraciones.",
    images: [{ url: "/logo.png", width: 1200, height: 630 }],
    type: "website",
    locale: "es_ES",
  },
  twitter: {
    card: "summary_large_image",
    title: "LENSBYJRR — Blog de Fotografía",
    images: ["/logo.png"],
  },
}

export default function Home() {
  return <PhotoBlog />
}
