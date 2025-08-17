"use client"

import { Container } from "@/components/container"
import { SectionTitle } from "@/components/section-title"
import { photoCategories } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Plus, X, Loader2 } from "lucide-react"
import { useParams } from "next/navigation"
import { useState, useEffect } from "react"
import { uploadPhoto, getPhotosByCategory, deletePhoto, getPhotoUrl } from "@/lib/photo-upload"
import type { Photo } from "@/lib/supabase/client"
import Image from "next/image"

export default function CategoryPageClient() {
  const params = useParams()
  const slug = params.slug as string
  const category = photoCategories.find((cat) => cat.slug === slug)

  const [photos, setPhotos] = useState<Photo[]>([])
  const [isUploading, setIsUploading] = useState(false)
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null)
  const [showUploadModal, setShowUploadModal] = useState(false)
  const [selectedFiles, setSelectedFiles] = useState<FileList | null>(null)
  const [uploadForm, setUploadForm] = useState({
    name: "",
    description: "",
  })

  const handleDeletePhoto = async (photoId: string) => {
    try {
      await deletePhoto(photoId)
      setPhotos((prevPhotos) => prevPhotos.filter((photo) => photo.id !== photoId))
      alert("Foto eliminada exitosamente")
    } catch (error) {
      console.error("[v0] Delete error:", error)
      alert("Error al eliminar la foto. Inténtalo de nuevo.")
    }
  }

  useEffect(() => {
    if (category) {
      loadPhotos()
    }
  }, [category])

  const loadPhotos = async () => {
    if (!category) return
    const categoryPhotos = await getPhotosByCategory(category.slug)
    setPhotos(categoryPhotos)
  }

  const handleFileUpload = async () => {
    if (!category || !selectedFiles) return

    setIsUploading(true)
    const uploadPromises = Array.from(selectedFiles).map((file) =>
      uploadPhoto(file, category.slug, uploadForm.name || file.name, uploadForm.description),
    )

    try {
      const results = await Promise.all(uploadPromises)
      const successfulUploads = results.filter((result) => result !== null) as Photo[]

      if (successfulUploads.length > 0) {
        await loadPhotos()
        alert(`${successfulUploads.length} foto(s) subida(s) exitosamente`)
        setShowUploadModal(false)
        setSelectedFiles(null)
        setUploadForm({ name: "", description: "" })
      }

      if (results.some((result) => result === null)) {
        alert("Algunas fotos no se pudieron subir. Inténtalo de nuevo.")
      }
    } catch (error) {
      console.error("[v0] Upload error:", error)
      alert("Error al subir las fotos. Inténtalo de nuevo.")
    } finally {
      setIsUploading(false)
    }
  }

  const handleFileSelection = (files: FileList) => {
    setSelectedFiles(files)
    setUploadForm({
      name: files.length === 1 ? files[0].name.replace(/\.[^/.]+$/, "") : "",
      description: "",
    })
    setShowUploadModal(true)
  }

  if (!category) {
    return <div>Category not found</div>
  }

  return (
    <div className="min-h-screen bg-zinc-950 pt-24 pb-16">
      <Container>
        <div className="flex items-center justify-between mb-12">
          <SectionTitle title={category.title} subtitle={category.intro} className="mb-0 text-amber-50" />
          <Button
            size="sm"
            variant="ghost"
            className="text-zinc-400 hover:text-amber-300 opacity-60 hover:opacity-100 transition-all"
            disabled={isUploading}
            onClick={() => {
              const input = document.createElement("input")
              input.type = "file"
              input.accept = "image/*"
              input.multiple = true
              input.onchange = (e) => {
                const files = (e.target as HTMLInputElement).files
                if (files && files.length > 0) {
                  handleFileSelection(files)
                }
              }
              input.click()
            }}
          >
            {isUploading ? (
              <>
                <Loader2 className="w-4 h-4 mr-1 animate-spin" />
                Subiendo...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4 mr-1" />
                Subir Fotos
              </>
            )}
          </Button>
        </div>

        {photos.length > 0 ? (
          <div className="columns-1 md:columns-2 lg:columns-3 xl:columns-4 gap-6 space-y-6">
            {photos.map((photo) => (
              <div
                key={photo.id}
                className="break-inside-avoid group cursor-pointer"
                onClick={() => setSelectedPhoto(photo)}
              >
                <div className="relative overflow-hidden rounded-lg bg-zinc-800/50 hover:bg-zinc-800/70 transition-all duration-300">
                  <Image
                    src={getPhotoUrl(photo.storage_path) || "/placeholder.svg"}
                    alt={photo.original_name}
                    width={photo.width || 400}
                    height={photo.height || 600}
                    className="w-full h-auto object-cover group-hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors duration-300" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20">
            <div className="w-16 h-16 mx-auto mb-6 rounded-full bg-zinc-800/50 flex items-center justify-center">
              <Plus className="w-8 h-8 text-zinc-500" />
            </div>
            <h3 className="text-xl font-semibold text-zinc-300 mb-2">No hay fotos aún</h3>
            <p className="text-zinc-400 mb-6">Sube tus primeras fotografías de {category.title.toLowerCase()}</p>
            <Button
              variant="outline"
              className="border-zinc-700 text-zinc-300 hover:bg-zinc-800 hover:text-amber-300 bg-transparent"
              disabled={isUploading}
              onClick={() => {
                const input = document.createElement("input")
                input.type = "file"
                input.accept = "image/*"
                input.multiple = true
                input.onchange = (e) => {
                  const files = (e.target as HTMLInputElement).files
                  if (files && files.length > 0) {
                    handleFileSelection(files)
                  }
                }
                input.click()
              }}
            >
              {isUploading ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Subiendo...
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4 mr-2" />
                  Subir Primera Foto
                </>
              )}
            </Button>
          </div>
        )}

        {showUploadModal && (
          <div className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4">
            <div className="bg-zinc-900 rounded-lg p-6 max-w-md w-full">
              <h3 className="text-xl font-semibold text-white mb-4">
                Subir {selectedFiles?.length === 1 ? "Foto" : `${selectedFiles?.length} Fotos`}
              </h3>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Nombre {selectedFiles?.length === 1 ? "" : "(para todas las fotos)"}
                  </label>
                  <input
                    type="text"
                    value={uploadForm.name}
                    onChange={(e) => setUploadForm((prev) => ({ ...prev, name: e.target.value }))}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder:text-zinc-400"
                    placeholder="Nombre de la foto"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-zinc-300 mb-2">
                    Descripción {selectedFiles?.length === 1 ? "" : "(para todas las fotos)"}
                  </label>
                  <textarea
                    value={uploadForm.description}
                    onChange={(e) => setUploadForm((prev) => ({ ...prev, description: e.target.value }))}
                    className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-md text-white placeholder:text-zinc-400 min-h-20"
                    placeholder="Descripción de la foto"
                  />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button
                  variant="outline"
                  onClick={() => {
                    setShowUploadModal(false)
                    setSelectedFiles(null)
                    setUploadForm({ name: "", description: "" })
                  }}
                  className="flex-1 border-zinc-700 text-zinc-300 hover:bg-zinc-800"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleFileUpload}
                  disabled={isUploading}
                  className="flex-1 bg-amber-600 hover:bg-amber-700 text-white"
                >
                  {isUploading ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Subiendo...
                    </>
                  ) : (
                    "Subir"
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}

        {selectedPhoto && (
          <div
            className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedPhoto(null)}
          >
            <div className="relative max-w-4xl max-h-full" onClick={(e) => e.stopPropagation()}>
              <button
                onClick={() => setSelectedPhoto(null)}
                className="absolute -top-12 right-0 text-white hover:text-amber-300 transition-colors"
              >
                <X className="w-8 h-8" />
              </button>
              <button
                onClick={() => handleDeletePhoto(selectedPhoto.id)}
                className="absolute -top-12 right-12 text-red-400 hover:text-red-300 transition-colors"
              >
                Eliminar
              </button>
              <Image
                src={getPhotoUrl(selectedPhoto.storage_path) || "/placeholder.svg"}
                alt={selectedPhoto.original_name}
                width={selectedPhoto.width || 800}
                height={selectedPhoto.height || 1200}
                className="max-w-full max-h-full object-contain rounded-lg"
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-4 rounded-b-lg">
                <h4 className="text-white font-medium">{selectedPhoto.name || selectedPhoto.original_name}</h4>
                {selectedPhoto.description && <p className="text-zinc-300 text-sm mt-1">{selectedPhoto.description}</p>}
              </div>
            </div>
          </div>
        )}
      </Container>
    </div>
  )
}
