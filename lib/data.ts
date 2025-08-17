export interface PhotoImage {
  src: string
  alt: string
  caption?: string
}

export interface PhotoCategory {
  slug: string
  title: string
  cover: string
  intro: string
  images: PhotoImage[]
}

export interface Video {
  title: string
  provider: "youtube" | "vimeo"
  url: string
  description?: string
}

export interface VideoLocation {
  slug: string
  title: string
  cover: string
  videos: Video[]
}

export const photoCategories: PhotoCategory[] = [
  {
    slug: "paisajes",
    title: "Paisajes",
    cover: "/gallery/paisajes/cover.png",
    intro: "Horizontes amplios y luz cambiante.",
    images: [],
  },
  {
    slug: "urbana",
    title: "Urbana",
    cover: "/gallery/urbana/cover.png",
    intro: "Geometrías, reflejos y paso ligero.",
    images: [],
  },
  {
    slug: "semana-santa",
    title: "Semana Santa",
    cover: "/gallery/semana-santa/cover.png",
    intro: "Sombras, cera y tradición en movimiento.",
    images: [],
  },
  {
    slug: "fauna-flora",
    title: "Fauna y Flora",
    cover: "/gallery/fauna-flora/cover.png",
    intro: "Vida en primer plano: ritmo y paciencia.",
    images: [],
  },
  {
    slug: "aviacion",
    title: "Aviación",
    cover: "/gallery/aviacion/cover.png",
    intro: "Acero, velocidad y cielo abierto.",
    images: [],
  },
]

export const videoLocations: VideoLocation[] = [
  {
    slug: "granada",
    title: "Granada",
    cover: "/videos/granada/cover.png",
    videos: [
      {
        title: "Alhambra al Atardecer",
        provider: "youtube",
        url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        description: "Recorrido por los jardines de la Alhambra durante la hora dorada",
      },
      {
        title: "Albaicín Nocturno",
        provider: "vimeo",
        url: "https://player.vimeo.com/video/123456789",
        description: "Las calles empedradas del Albaicín bajo la luz de la luna",
      },
      {
        title: "Sierra Nevada",
        provider: "youtube",
        url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        description: "Paisajes nevados y picos montañosos",
      },
    ],
  },
  {
    slug: "lisboa",
    title: "Lisboa",
    cover: "/videos/lisboa/cover.png",
    videos: [
      {
        title: "Tranvía 28",
        provider: "youtube",
        url: "https://www.youtube.com/embed/dQw4w9WgXcQ",
        description: "Un viaje nostálgico por las colinas de Lisboa",
      },
      {
        title: "Fado en Alfama",
        provider: "vimeo",
        url: "https://player.vimeo.com/video/987654321",
        description: "La música tradicional portuguesa en su barrio más auténtico",
      },
    ],
  },
]

export const siteConfig = {
  name: "LensByJRR",
  title: "LensByJRR — Fotografía & Vídeo",
  description: "Portfolio de fotografía y vídeo por Jaime R.R. Estilo oscuro para que las imágenes respiren.",
  author: "Jaime R.R.",
  social: {
    instagram: "https://instagram.com/lensbyjrr",
    tiktok: "https://tiktok.com/@lensbyjrr",
    email: "contacto@lensbyjrr.com",
  },
}
