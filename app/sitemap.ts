import type { MetadataRoute } from "next"
import { initialPhotos } from "@/lib/data"

const BASE = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://lensbyjrr.vercel.app"

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()
  const photos = initialPhotos.map((p) => ({
    url: `${BASE}/photos/${p.id}`,
    lastModified: now,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }))

  return [
    {
      url: `${BASE}/`,
      lastModified: now,
      changeFrequency: "weekly",
      priority: 1,
    },
    ...photos,
  ]
}
