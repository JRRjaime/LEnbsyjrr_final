export type Comment = {
  id: string
  author: string
  content: string
  timestamp: string
  avatar?: string
}

export type Reactions = {
  heart: number
  love: number // 😍
  fire: number // 🔥
  clap: number // 👏
}

export type Photo = {
  id: string
  title: string
  description: string
  imageUrl: string
  category: "aviation" | "nature" | "easter" | "landscapes" | "urban"
  likes: number
  isLiked: boolean
  comments: Comment[]
  timestamp: string
  tags: string[]
  reactions: Reactions
  userReaction?: keyof Reactions
}

export const categories = [
  { id: "all", name: "Todas", icon: "Camera", color: "from-purple-500 to-pink-500" },
  { id: "aviation", name: "Aviación", icon: "Plane", color: "from-blue-500 to-cyan-500" },
  { id: "nature", name: "Fauna y Flora", icon: "Flower2", color: "from-green-500 to-emerald-500" },
  { id: "easter", name: "Semana Santa", icon: "Church", color: "from-amber-500 to-orange-500" },
  { id: "landscapes", name: "Paisajes", icon: "Mountain", color: "from-indigo-500 to-purple-500" },
  { id: "urban", name: "Urbano", icon: "Building2", color: "from-gray-700 to-zinc-600" },
] as const

export const initialPhotos: Photo[] = []

// Utilidad para obtener etiquetas únicas
export function getAllTags(data: Photo[]) {
  return Array.from(new Set(data.flatMap((p) => p.tags))).sort((a, b) => a.localeCompare(b))
}

// Simulación de “cargar más” duplicando/variando datos (demo sin backend)
export function getMorePhotos(offset: number, limit: number) {
  const source = initialPhotos
  if (source.length === 0) return []
  const items = []
  for (let i = offset; i < offset + limit; i++) {
    const base = source[i % source.length]
    items.push({
      ...base,
      id: `${base.id}-${i}`,
      title: `${base.title} #${i + 1}`,
      timestamp: "ahora",
    } as Photo)
  }
  return items
}
