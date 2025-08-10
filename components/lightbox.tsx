"use client"

import type React from "react"

import { useCallback, useEffect, useRef, useState } from "react"
import Image from "next/image"
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react"
import { Button } from "@/components/ui/button"

type Props = {
  open?: boolean
  onClose?: () => void
  images?: { src: string; alt: string }[]
  startIndex?: number
}

export default function Lightbox(
  { open = false, onClose, images = [], startIndex = 0 }: Props = { open: false, images: [], startIndex: 0 },
) {
  const [index, setIndex] = useState(startIndex)
  const [zoom, setZoom] = useState(1)
  const [drag, setDrag] = useState<{ x: number; y: number }>({ x: 0, y: 0 })
  const dragRef = useRef<{ startX: number; startY: number; active: boolean }>({
    startX: 0,
    startY: 0,
    active: false,
  })

  useEffect(() => setIndex(startIndex), [startIndex])

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (!open) return
      if (e.key === "Escape") onClose?.()
      if (e.key === "ArrowRight") next()
      if (e.key === "ArrowLeft") prev()
    }
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [open])

  const next = useCallback(() => {
    setIndex((i) => (i + 1) % images.length)
    setZoom(1)
    setDrag({ x: 0, y: 0 })
  }, [images.length])
  const prev = useCallback(() => {
    setIndex((i) => (i - 1 + images.length) % images.length)
    setZoom(1)
    setDrag({ x: 0, y: 0 })
  }, [images.length])

  // Swipe en móvil
  const touchStart = useRef<number | null>(null)
  function onTouchStart(e: React.TouchEvent) {
    touchStart.current = e.touches[0].clientX
  }
  function onTouchEnd(e: React.TouchEvent) {
    if (touchStart.current === null) return
    const dx = e.changedTouches[0].clientX - touchStart.current
    if (dx > 50) prev()
    if (dx < -50) next()
    touchStart.current = null
  }

  function onMouseDown(e: React.MouseEvent) {
    if (zoom === 1) return
    dragRef.current = { startX: e.clientX - drag.x, startY: e.clientY - drag.y, active: true }
  }
  function onMouseMove(e: React.MouseEvent) {
    if (!dragRef.current.active) return
    setDrag({ x: e.clientX - dragRef.current.startX, y: e.clientY - dragRef.current.startY })
  }
  function onMouseUp() {
    dragRef.current.active = false
  }

  if (!open) return null
  const current = images[index]

  return (
    <div
      className="fixed inset-0 z-[60] bg-black/90 backdrop-blur-sm"
      role="dialog"
      aria-modal="true"
      onClick={(e) => {
        if ((e.target as HTMLElement).id === "lightbox-backdrop") onClose?.()
      }}
    >
      <div id="lightbox-backdrop" className="absolute inset-0" />
      <div className="relative h-full w-full flex items-center justify-center select-none overflow-hidden">
        {/* Imagen con fill y cover para cubrir toda la pantalla */}
        <div
          className="relative w-full h-full"
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
          onMouseMove={onMouseMove}
          onMouseUp={onMouseUp}
          onMouseLeave={onMouseUp}
          onMouseDown={onMouseDown}
        >
          <Image
            id="lightbox-img"
            src={current?.src || "/placeholder.svg"}
            alt={current?.alt || "Imagen"}
            fill
            sizes="100vw"
            style={{
              objectFit: "contain",
              transform: `translate(${drag.x}px, ${drag.y}px) scale(${zoom})`,
            }}
            priority
          />
        </div>

        {/* Controles */}
        <div className="absolute top-4 right-4 flex gap-2">
          <Button
            variant="secondary"
            size="icon"
            onClick={() => setZoom((z) => Math.max(1, z - 0.25))}
            aria-label="Alejar"
          >
            <ZoomOut className="h-5 w-5" />
          </Button>
          <Button
            variant="secondary"
            size="icon"
            onClick={() => setZoom((z) => Math.min(3, z + 0.25))}
            aria-label="Acercar"
          >
            <ZoomIn className="h-5 w-5" />
          </Button>
          <Button variant="secondary" size="icon" onClick={onClose} aria-label="Cerrar">
            <X className="h-5 w-5" />
          </Button>
        </div>

        <Button
          variant="secondary"
          size="icon"
          className="absolute left-3 top-1/2 -translate-y-1/2"
          onClick={prev}
          aria-label="Anterior"
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
        <Button
          variant="secondary"
          size="icon"
          className="absolute right-3 top-1/2 -translate-y-1/2"
          onClick={next}
          aria-label="Siguiente"
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      </div>

      {/* Respeta reduce motion: elimina transiciones del zoom/drag */}
      <style jsx global>{`
        #lightbox-img {
          transition: transform 0.2s ease;
          will-change: transform;
        }
        @media (prefers-reduced-motion: reduce) {
          #lightbox-img {
            transition: none;
          }
        }
      `}</style>
    </div>
  )
}
