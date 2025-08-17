import { notFound } from "next/navigation"
import { Container } from "@/components/container"
import { SectionTitle } from "@/components/section-title"
import { VideoCard } from "@/components/video-card"
import { videoLocations } from "@/lib/data"

interface PageProps {
  params: Promise<{ slug: string }>
}

export async function generateStaticParams() {
  return videoLocations.map((location) => ({
    slug: location.slug,
  }))
}

export async function generateMetadata({ params }: PageProps) {
  const { slug } = await params
  const location = videoLocations.find((loc) => loc.slug === slug)

  if (!location) {
    return {
      title: "Ubicación no encontrada - LensByJRR",
    }
  }

  return {
    title: `Vídeos de ${location.title} - LensByJRR`,
    description: `Explora mis vídeos grabados en ${location.title}.`,
  }
}

export default async function LocationPage({ params }: PageProps) {
  const { slug } = await params
  const location = videoLocations.find((loc) => loc.slug === slug)

  if (!location) {
    notFound()
  }

  return (
    <div className="pt-24 pb-16">
      <Container>
        <SectionTitle
          title={`Vídeos de ${location.title}`}
          subtitle={`${location.videos.length} vídeos disponibles`}
          className="mb-12"
        />

        {location.videos.length > 0 ? (
          <div className="grid md:grid-cols-2 gap-8">
            {location.videos.map((video, index) => (
              <VideoCard key={index} video={video} index={index} />
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-[#B4B4B4] text-lg">Próximamente nuevos vídeos de {location.title}.</p>
          </div>
        )}
      </Container>
    </div>
  )
}
