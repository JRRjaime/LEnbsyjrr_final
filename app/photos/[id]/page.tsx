import type { Metadata } from "next"
import PhotoPageClient from "./PhotoPageClient"

type Params = { id: string }

export async function generateMetadata({ params }: { params: Params }): Promise<Metadata> {
  // Como las fotos ahora se cargan desde IndexedDB (cliente), usamos metadatos genéricos.
  return {
    title: `Foto ${params.id} — LENSBYJRR`,
    description: "Detalle de fotografía en LENSBYJRR.",
    openGraph: {
      title: "LENSBYJRR — Detalle de fotografía",
      description: "Explora detalles de la fotografía.",
      images: ["/logo.png"],
    },
    twitter: {
      card: "summary_large_image",
      title: "LENSBYJRR — Detalle de fotografía",
      images: ["/logo.png"],
    },
  }
}

export default function PhotoPage({ params }: { params: Params }) {
  // No hacemos notFound aquí: el cliente intentará cargar desde IndexedDB.
  return <PhotoPageClient params={params} />
}
