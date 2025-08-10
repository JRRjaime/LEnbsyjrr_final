import { ImageResponse } from "next/og"
import { initialPhotos } from "@/lib/data"

export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

export default async function OG({ params }: { params: { id: string } }) {
  const photo = initialPhotos.find((p) => p.id === params.id)
  const title = photo?.title || "Mi Blog de Fotografía"
  const subtitle = photo?.description?.slice(0, 120) || "Explora fotografía por categorías"

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        justifyContent: "flex-end",
        backgroundImage:
          "linear-gradient(to top, rgba(0,0,0,0.6), rgba(0,0,0,0.0)), radial-gradient(circle at 20% 20%, #a78bfa 0, transparent 40%), radial-gradient(circle at 80% 30%, #f472b6 0, transparent 40%), #111827",
        color: "white",
        padding: "48px",
        fontFamily: "Inter, ui-sans-serif, system-ui",
      }}
    >
      <div
        style={{
          fontSize: 60,
          fontWeight: 800,
          lineHeight: 1.1,
          textShadow: "0 4px 20px rgba(0,0,0,0.3)",
        }}
      >
        {title}
      </div>
      <div style={{ fontSize: 28, opacity: 0.9, marginTop: 12 }}>{subtitle}</div>
      <div style={{ display: "flex", gap: 8, marginTop: 24 }}>
        <div
          style={{
            background: "linear-gradient(90deg,#8b5cf6,#ec4899)",
            color: "white",
            padding: "8px 16px",
            borderRadius: 999,
            fontSize: 20,
            fontWeight: 700,
          }}
        >
          Mi Blog de Fotografía
        </div>
      </div>
    </div>,
    { ...size },
  )
}
