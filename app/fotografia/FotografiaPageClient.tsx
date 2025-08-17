"use client"

import { Container } from "@/components/container"
import { Button } from "@/components/ui/button"
import { Plus, Mountain, Leaf, Church, Building, Plane } from "lucide-react"
import Link from "next/link"
import { useState, useEffect } from "react"
import { getPhotosByCategory, deletePhoto, type Photo } from "@/lib/photo-upload"

export default function FotografiaPageClient() {
  const [photoCounts, setPhotoCounts] = useState<Record<string, number>>({})
  const [recentPhotos, setRecentPhotos] = useState<Photo[]>([])
  const [lightboxPhoto, setLightboxPhoto] = useState<Photo | null>(null)
  const [showRecentPhotos, setShowRecentPhotos] = useState(false)

  useEffect(() => {
    const loadPhotoCounts = async () => {
      const categories = ["paisajes", "fauna-flora", "semana-santa", "urbana", "aviacion"]
      const counts: Record<string, number> = {}
      const allPhotos: Photo[] = []

      for (const category of categories) {
        const photos = await getPhotosByCategory(category)
        counts[category] = photos.length
        allPhotos.push(...photos)
      }

      setPhotoCounts(counts)
      setRecentPhotos(
        allPhotos.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()).slice(0, 6),
      )
    }

    loadPhotoCounts()
  }, [])

  const handleDeletePhoto = async (photoId: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar esta foto?")) {
      const success = await deletePhoto(photoId)
      if (success) {
        setRecentPhotos((prev) => prev.filter((p) => p.id !== photoId))
        const categories = ["paisajes", "fauna-flora", "semana-santa", "urbana", "aviacion"]
        const counts: Record<string, number> = {}
        for (const category of categories) {
          const photos = await getPhotosByCategory(category)
          counts[category] = photos.length
        }
        setPhotoCounts(counts)
      }
    }
  }

  return (
    <div className="min-h-screen bg-zinc-950 pt-24 pb-16">
      <Container>
        <div className="flex items-center justify-between mb-12">
          <h1 className="text-4xl font-bold text-amber-50">Fotografía</h1>
          <div className="flex gap-2">
            <Button
              size="sm"
              variant="ghost"
              className="text-zinc-400 hover:text-amber-300 opacity-60 hover:opacity-100 transition-all"
              onClick={() => setShowRecentPhotos(!showRecentPhotos)}
            >
              {showRecentPhotos ? "Ocultar Recientes" : "Ver Recientes"}
            </Button>
            <Button
              size="sm"
              variant="ghost"
              className="text-zinc-400 hover:text-amber-300 opacity-60 hover:opacity-100 transition-all"
              onClick={() => {
                const input = document.createElement("input")
                input.type = "file"
                input.accept = "image/*"
                input.multiple = true
                input.onchange = (e) => {
                  const files = (e.target as HTMLInputElement).files
                  if (files) {
                    console.log(
                      "[v0] Selected files for general upload:",
                      Array.from(files).map((f) => f.name),
                    )
                    alert(`Seleccionadas ${files.length} foto(s) para subir`)
                  }
                }
                input.click()
              }}
            >
              <Plus className="w-4 h-4 mr-1" />
              Subir
            </Button>
          </div>
        </div>

        {showRecentPhotos && recentPhotos.length > 0 && (
          <div className="mb-16">
            <h2 className="text-2xl font-bold text-amber-50 mb-6">Fotos Recientes</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
              {recentPhotos.map((photo) => (
                <div key={photo.id} className="group relative aspect-square overflow-hidden rounded-lg bg-zinc-800">
                  <img
                    src={photo.url || "/placeholder.svg"}
                    alt={photo.title || "Foto"}
                    className="w-full h-full object-cover cursor-pointer transition-transform group-hover:scale-105"
                    onClick={() => setLightboxPhoto(photo)}
                  />
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDeletePhoto(photo.id)
                      }}
                      className="bg-red-600 hover:bg-red-700 w-8 h-8 p-0"
                    >
                      <Plus className="w-4 h-4 rotate-45" />
                    </Button>
                  </div>
                  <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                    <p className="text-white text-xs truncate">{photo.title}</p>
                    <p className="text-zinc-400 text-xs capitalize">{photo.category}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          <Link href="/fotografia/paisajes" className="group">
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-emerald-900/40 to-zinc-800/60 border border-emerald-600/20 hover:border-emerald-500/40 transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-emerald-900/20 aspect-[4/3]">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="p-8 h-full flex flex-col items-center justify-center relative z-10">
                <Mountain className="w-12 h-12 mb-4 text-emerald-400 group-hover:text-emerald-300 transition-colors duration-300 group-hover:scale-110 transform transition-transform" />
                <h3 className="text-xl font-bold text-emerald-50 mb-2">Paisajes</h3>
                <p className="text-emerald-200/60 text-sm text-center">Naturaleza y horizontes</p>
                {photoCounts.paisajes > 0 && (
                  <div className="mt-2 px-2 py-1 bg-emerald-600/20 rounded-full">
                    <span className="text-xs text-emerald-300">{photoCounts.paisajes} fotos</span>
                  </div>
                )}
              </div>
            </div>
          </Link>

          <Link href="/fotografia/fauna-flora" className="group">
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-green-900/40 to-zinc-800/60 border border-green-600/20 hover:border-green-500/40 transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-green-900/20 aspect-[4/3]">
              <div className="absolute inset-0 bg-gradient-to-br from-green-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="p-8 h-full flex flex-col items-center justify-center relative z-10">
                <Leaf className="w-12 h-12 mb-4 text-green-400 group-hover:text-green-300 transition-colors duration-300 group-hover:scale-110 transform transition-transform" />
                <h3 className="text-xl font-bold text-green-50 mb-2">Fauna & Flora</h3>
                <p className="text-green-200/60 text-sm text-center">Vida silvestre</p>
                {photoCounts["fauna-flora"] > 0 && (
                  <div className="mt-2 px-2 py-1 bg-green-600/20 rounded-full">
                    <span className="text-xs text-green-300">{photoCounts["fauna-flora"]} fotos</span>
                  </div>
                )}
              </div>
            </div>
          </Link>

          <Link href="/fotografia/semana-santa" className="group">
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-purple-900/40 to-zinc-800/60 border border-purple-600/20 hover:border-purple-500/40 transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-purple-900/20 aspect-[4/3]">
              <div className="absolute inset-0 bg-gradient-to-br from-purple-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="p-8 h-full flex flex-col items-center justify-center relative z-10">
                <Church className="w-12 h-12 mb-4 text-purple-400 group-hover:text-purple-300 transition-colors duration-300 group-hover:scale-110 transform transition-transform" />
                <h3 className="text-xl font-bold text-purple-50 mb-2">Semana Santa</h3>
                <p className="text-purple-200/60 text-sm text-center">Tradición y fe</p>
                {photoCounts["semana-santa"] > 0 && (
                  <div className="mt-2 px-2 py-1 bg-purple-600/20 rounded-full">
                    <span className="text-xs text-purple-300">{photoCounts["semana-santa"]} fotos</span>
                  </div>
                )}
              </div>
            </div>
          </Link>

          <Link href="/fotografia/urbana" className="group">
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-blue-900/40 to-zinc-800/60 border border-blue-600/20 hover:border-blue-500/40 transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-blue-900/20 aspect-[4/3]">
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="p-8 h-full flex flex-col items-center justify-center relative z-10">
                <Building className="w-12 h-12 mb-4 text-blue-400 group-hover:text-blue-300 transition-colors duration-300 group-hover:scale-110 transform transition-transform" />
                <h3 className="text-xl font-bold text-blue-50 mb-2">Urbano</h3>
                <p className="text-blue-200/60 text-sm text-center">Ciudad y arquitectura</p>
                {photoCounts.urbana > 0 && (
                  <div className="mt-2 px-2 py-1 bg-blue-600/20 rounded-full">
                    <span className="text-xs text-blue-300">{photoCounts.urbana} fotos</span>
                  </div>
                )}
              </div>
            </div>
          </Link>

          <Link href="/fotografia/aviacion" className="group">
            <div className="relative overflow-hidden rounded-xl bg-gradient-to-br from-orange-900/40 to-zinc-800/60 border border-orange-600/20 hover:border-orange-500/40 transition-all duration-500 hover:scale-105 hover:shadow-xl hover:shadow-orange-900/20 aspect-[4/3]">
              <div className="absolute inset-0 bg-gradient-to-br from-orange-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="p-8 h-full flex flex-col items-center justify-center relative z-10">
                <Plane className="w-12 h-12 mb-4 text-orange-400 group-hover:text-orange-300 transition-colors duration-300 group-hover:scale-110 transform transition-transform" />
                <h3 className="text-xl font-bold text-orange-50 mb-2">Aviación</h3>
                <p className="text-orange-200/60 text-sm text-center">Vuelo y tecnología</p>
                {photoCounts.aviacion > 0 && (
                  <div className="mt-2 px-2 py-1 bg-orange-600/20 rounded-full">
                    <span className="text-xs text-orange-300">{photoCounts.aviacion} fotos</span>
                  </div>
                )}
              </div>
            </div>
          </Link>
        </div>

        <div className="text-center py-20">
          <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-zinc-800/50 flex items-center justify-center">
            <Mountain className="w-8 h-8 text-zinc-500" />
          </div>
          <p className="text-zinc-400">Selecciona una categoría para explorar las fotografías</p>
        </div>
      </Container>

      {lightboxPhoto && (
        <div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
          onClick={() => setLightboxPhoto(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img
              src={lightboxPhoto.url || "/placeholder.svg"}
              alt={lightboxPhoto.title || "Foto"}
              className="max-w-full max-h-full object-contain"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute top-4 right-4 flex gap-2">
              <Button
                size="sm"
                variant="destructive"
                onClick={(e) => {
                  e.stopPropagation()
                  handleDeletePhoto(lightboxPhoto.id)
                  setLightboxPhoto(null)
                }}
                className="bg-red-600 hover:bg-red-700"
              >
                <Plus className="w-4 h-4 rotate-45" />
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setLightboxPhoto(null)}
                className="bg-black/50 hover:bg-black/70 text-white"
              >
                <Plus className="w-4 h-4 rotate-45" />
              </Button>
            </div>
            {(lightboxPhoto.title || lightboxPhoto.description) && (
              <div className="absolute bottom-4 left-4 right-4 bg-black/80 rounded-lg p-4">
                {lightboxPhoto.title && <h3 className="text-white font-semibold">{lightboxPhoto.title}</h3>}
                {lightboxPhoto.description && <p className="text-zinc-300 text-sm mt-1">{lightboxPhoto.description}</p>}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
