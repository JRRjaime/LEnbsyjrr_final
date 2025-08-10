import type { MetadataRoute } from "next"

const BASE = process.env.NEXT_PUBLIC_SITE_URL?.replace(/\/$/, "") || "https://lensbyjrr.vercel.app"

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: "*",
      allow: "/",
    },
    sitemap: `${BASE}/sitemap.xml`,
  }
}
