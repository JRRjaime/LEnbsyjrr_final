import Image from "next/image"
import Link from "next/link"
import { Container } from "@/components/container"
import { siteConfig } from "@/lib/data"

export const metadata = {
  title: "Sobre mí - LensByJRR",
  description: "Conoce más sobre Jaime R.R. y su trabajo en fotografía y vídeo.",
}

export default function AboutPage() {
  return (
    <div className="pt-24 pb-16">
      <Container>
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div className="relative aspect-[3/4] rounded-lg overflow-hidden">
            <Image src="/about/portrait.png" alt="Retrato de Jaime R.R." fill className="object-cover" />
          </div>

          <div>
            <h1 className="text-4xl md:text-5xl font-bold mb-6">Historias en luz y sombra</h1>
            <p className="text-lg text-[#B4B4B4] leading-relaxed mb-8">
              Busco escenas sinceras y atmósferas que hablan por sí solas. Trabajo entre viajes y ciudad, con
              preferencia por tonos oscuros para que las imágenes respiren. Aquí comparto mis series favoritas y algunos
              vídeos de ruta.
            </p>
            <Link
              href={siteConfig.social.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-[#10B981] hover:bg-[#0d9668] text-white px-6 py-3 rounded-lg font-semibold transition-colors focus-visible"
            >
              Instagram
            </Link>
          </div>
        </div>
      </Container>
    </div>
  )
}
