import type { MetadataRoute } from "next"

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "LENSBYJRR",
    short_name: "LENSBYJRR",
    description: "LENSBYJRR: Portafolio y blog de fotografía. Explora mi trabajo y contáctame para sesiones.",
    start_url: "/",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#7e22ce",
    icons: [
      { src: "/icon.png", sizes: "512x512", type: "image/png" },
      { src: "/apple-icon.png", sizes: "180x180", type: "image/png", purpose: "apple-touch-icon" },
    ],
  }
}
