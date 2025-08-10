"use client"

import type React from "react"
import { useCallback, useEffect, useMemo, useRef, useState } from "react"
import { useActionState } from "react"
import Image from "next/image"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  Heart,
  MessageCircle,
  Camera,
  Plane,
  Flower2,
  Church,
  Mountain,
  Building2,
  Send,
  Upload,
  Plus,
  Sparkles,
  Star,
  Zap,
  Crown,
  Search,
  TagIcon,
  HandHeart,
  ExternalLink,
  Mail,
  Instagram,
  Trash2,
} from "lucide-react"
import type { Comment, Photo } from "@/lib/data"
import { categories, getAllTags, getMorePhotos, initialPhotos } from "@/lib/data"
import ReactionBar from "@/components/reaction-bar"
import CommentTicker from "@/components/comment-ticker"
import Lightbox from "@/components/lightbox"
import ShareButtons from "@/components/share-buttons"
import { donation } from "@/lib/config"
import { submitContact, type ContactActionState } from "@/app/actions/contact"
import { useToast } from "@/hooks/use-toast"
import { savePhotoWithBlob, loadAllPhotos, updatePhotoData, removePhoto, type StoredPhotoData } from "@/lib/storage"

const CONTACT_EMAIL = "jrrfotografia20004@gmail.com"
const iconMap = { Camera, Plane, Flower2, Church, Mountain, Building2 }

export function PhotoBlog() {
  const [selectedCategory, setSelectedCategory] = useState("all")
  const [photos, setPhotos] = useState<Photo[]>(initialPhotos)
  const [newComment, setNewComment] = useState<{ [key: string]: string }>({})
  const [commenterName, setCommenterName] = useState<{ [key: string]: string }>({})
  const [isUploadOpen, setIsUploadOpen] = useState(false)
  const [isRegisterOpen, setIsRegisterOpen] = useState(false)
  const [newPhoto, setNewPhoto] = useState<{
    title: string
    description: string
    category: string
    imageUrl: string
    tags: string
    file?: File | null
  }>({ title: "", description: "", category: "", imageUrl: "", tags: "", file: null })
  const fileInputRef = useRef<HTMLInputElement>(null)

  const [query, setQuery] = useState("")
  const [selectedTags, setSelectedTags] = useState<string[]>([])
  const allTags = useMemo(() => getAllTags(photos), [photos])

  // Cargar fotos guardadas en IndexedDB al montar
  useEffect(() => {
    let mounted = true
    loadAllPhotos().then((loaded) => {
      if (mounted && loaded.length) setPhotos(loaded)
    })
    return () => {
      mounted = false
    }
  }, [])

  const filteredPhotos = useMemo(() => {
    const byCategory = selectedCategory === "all" ? photos : photos.filter((p) => p.category === selectedCategory)
    const byTags = selectedTags.length
      ? byCategory.filter((p) => selectedTags.every((t) => p.tags.includes(t)))
      : byCategory
    const q = query.trim().toLowerCase()
    if (!q) return byTags
    return byTags.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.tags.some((t) => t.toLowerCase().includes(q)),
    )
  }, [photos, selectedCategory, query, selectedTags])

  
  // Eliminar publicación localmente (IndexedDB + UI)
  const handleDelete = async (photoId: string) => {
    if (!confirm("¿Eliminar esta publicación?")) return
    try {
      await removePhoto(photoId) // elimina de IndexedDB si existe
    } catch (_) {
      // ignorar si no estaba persistida
    }
    setPhotos((arr) => arr.filter((p) => p.id !== photoId)) // quita de la UI
  }
// Lightbox
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [lightboxIndex, setLightboxIndex] = useState(0)
  const lightboxImages = useMemo(() => filteredPhotos.map((p) => ({ src: p.imageUrl, alt: p.title })), [filteredPhotos])

  // Infinite scroll (desactivado si no hay backend/semillas)
  const [hasMore, setHasMore] = useState(false)
  const [loadingMore, setLoadingMore] = useState(false)
  const sentinelRef = useRef<HTMLDivElement | null>(null)

  const [isDonateOpen, setIsDonateOpen] = useState(false)

  // Contact action state
  const initialContactState: ContactActionState = { success: undefined, message: "", errors: {} }
  const [contactState, formAction, isSending] = useActionState(submitContact, initialContactState)
  const { toast } = useToast()

  useEffect(() => {
    if (contactState?.success) {
      toast({ title: "Mensaje preparado", description: contactState.message })
      if (contactState.mailto) {
        window.location.href = contactState.mailto
      }
      const form = document.getElementById("contact-form") as HTMLFormElement | null
      form?.reset()
    }
  }, [contactState?.success, contactState?.mailto, contactState?.message, toast])

  // PayPal: hosted_button_id -> business email -> PayPal.Me
  const paypalLink =
    donation.paypalHostedButtonId && donation.paypalHostedButtonId.trim() !== ""
      ? `https://www.paypal.com/donate?hosted_button_id=${encodeURIComponent(donation.paypalHostedButtonId)}`
      : donation.paypalBusinessEmail && donation.paypalBusinessEmail.trim() !== ""
        ? `https://www.paypal.com/donate?business=${encodeURIComponent(
            donation.paypalBusinessEmail,
          )}&no_recurring=0&item_name=${encodeURIComponent(
            "Apoyo a LENSBYJRR",
          )}&currency_code=${encodeURIComponent(donation.currency || "EUR")}`
        : donation.paypalMeUsername && donation.paypalMeUsername.trim() !== ""
          ? `https://www.paypal.me/${encodeURIComponent(donation.paypalMeUsername)}${
              donation.defaultAmount ? `/${encodeURIComponent(donation.defaultAmount)}` : ""
            }`
          : ""

  useEffect(() => {
    if (!sentinelRef.current || !hasMore) return
    const observer = new IntersectionObserver(
      (entries) => {
        const first = entries[0]
        if (first.isIntersecting && hasMore && !loadingMore) {
          setLoadingMore(true)
          setTimeout(() => {
            const more = getMorePhotos(photos.length, 8)
            if (more.length === 0) {
              setHasMore(false)
              setLoadingMore(false)
              return
            }
            setPhotos((prev) => [...prev, ...more])
            if (photos.length + more.length > 80) setHasMore(false)
            setLoadingMore(false)
          }, 700)
        }
      },
      { rootMargin: "1200px" },
    )
    observer.observe(sentinelRef.current)
    return () => observer.disconnect()
  }, [photos.length, hasMore, loadingMore])

  const handleLike = async (photoId: string) => {
    setPhotos((arr) =>
      arr.map((photo) =>
        photo.id === photoId
          ? { ...photo, likes: photo.isLiked ? photo.likes - 1 : photo.likes + 1, isLiked: !photo.isLiked }
          : photo,
      ),
    )
    const current = photos.find((p) => p.id === photoId)
    if (current) {
      await updatePhotoData(photoId, {
        likes: current.isLiked ? current.likes - 1 : current.likes + 1,
        isLiked: !current.isLiked,
      } as Partial<StoredPhotoData>)
    }
  }

  const handleAddComment = async (photoId: string) => {
    const comment = newComment[photoId]
    const name = commenterName[photoId]
    if (!comment?.trim() || !name?.trim()) return
    const newCommentObj: Comment = {
      id: Date.now().toString(),
      author: name,
      content: comment,
      timestamp: "ahora",
    }
    setPhotos((arr) => arr.map((p) => (p.id === photoId ? { ...p, comments: [...p.comments, newCommentObj] } : p)))
    setNewComment({ ...newComment, [photoId]: "" })
    setCommenterName({ ...commenterName, [photoId]: "" })
    const current = photos.find((p) => p.id === photoId)
    if (current) {
      await updatePhotoData(photoId, { comments: [...current.comments, newCommentObj] })
    }
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const preview = URL.createObjectURL(file)
      setNewPhoto((np) => ({ ...np, file, imageUrl: preview }))
    }
  }

  const handleUploadPhoto = async () => {
    if (!newPhoto.title || !newPhoto.description || !newPhoto.category || !newPhoto.file) return
    const tags = newPhoto.tags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)
    const id = Date.now().toString()

    const data: StoredPhotoData = {
      id,
      title: newPhoto.title,
      description: newPhoto.description,
      // imageUrl se reconstruirá desde IndexedDB con objectURL
      category: newPhoto.category as Photo["category"],
      likes: 0,
      isLiked: false,
      comments: [],
      timestamp: "ahora",
      tags,
      reactions: { heart: 0, love: 0, fire: 0, clap: 0 },
      userReaction: undefined,
    }

    // Persistir en IndexedDB
    await savePhotoWithBlob(data, newPhoto.file)

    // Añadir inmediatamente a la UI usando la preview
    setPhotos((prev) => [{ ...data, imageUrl: newPhoto.imageUrl }, ...prev])

    // Reset del formulario
    setNewPhoto({ title: "", description: "", category: "", imageUrl: "", tags: "", file: null })
    setIsUploadOpen(false)
  }

  const toggleTag = useCallback((tag: string) => {
    setSelectedTags((prev) => (prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]))
  }, [])

  const scrollToContact = () => {
    const el = document.getElementById("contacto")
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      {/* Fondo animado */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full mix-blend-multiply blur-xl opacity-20 motion-safe:animate-pulse"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-r from-cyan-400 to-blue-400 rounded-full mix-blend-multiply blur-xl opacity-20 motion-safe:animate-pulse animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full mix-blend-multiply blur-xl opacity-20 motion-safe:animate-pulse animation-delay-4000"></div>
      </div>

      {/* Header */}
      <header className="relative bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 shadow-2xl">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-1.5 bg-white/20 backdrop-blur-sm rounded-2xl ring-2 ring-white/30">
                <Image
                  src="/logo.png"
                  alt="Logo LENSBYJRR"
                  width={56}
                  height={56}
                  className="h-14 w-14 rounded-xl object-cover"
                  priority
                />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white flex items-center gap-2">
                  LENSBYJRR
                  <Sparkles className="h-8 w-8 text-yellow-300 motion-safe:animate-pulse" />
                </h1>
                <p className="text-white/90 mt-1 text-lg">
                  Explora por categorías, etiquetas y disfruta el lightbox ✨
                </p>
              </div>
            </div>

            {/* Botón de registro llamativo */}
            <Dialog open={isRegisterOpen} onOpenChange={setIsRegisterOpen}>
              <DialogTrigger asChild>
                <Button className="relative group bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 hover:from-yellow-500 hover:via-pink-600 hover:to-purple-700 text-white font-bold py-4 px-8 rounded-2xl shadow-2xl transform hover:scale-105 transition-all duration-300 border-0 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-r from-yellow-400 via-pink-500 to-purple-600 motion-safe:animate-pulse opacity-75"></div>
                  <div className="relative flex items-center gap-3">
                    <Crown className="h-6 w-6 motion-safe:animate-bounce" />
                    <span className="text-lg">¡ÚNETE AHORA!</span>
                    <Zap className="h-6 w-6 motion-safe:animate-pulse" />
                  </div>
                  <div className="absolute inset-0 bg-white/20 scale-x-0 group-hover:scale-x-100 transition-transform duration-500 origin-left"></div>
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent flex items-center gap-2">
                    <Star className="h-6 w-6 text-yellow-500" />
                    ¡Únete a la Comunidad!
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-4 pt-4">
                  <Input
                    placeholder="Tu nombre completo"
                    className="border-2 border-purple-200 focus:border-purple-400"
                  />
                  <Input
                    placeholder="tu@email.com"
                    type="email"
                    className="border-2 border-purple-200 focus:border-purple-400"
                  />
                  <Input
                    placeholder="Contraseña súper secreta"
                    type="password"
                    className="border-2 border-purple-200 focus:border-purple-400"
                  />
                  <Button className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold py-3 rounded-xl">
                    🚀 ¡Crear mi cuenta VIP!
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {/* Buscador y etiquetas */}
          <div className="mt-6 flex flex-col md:flex-row items-stretch gap-3">
            <div className="flex-1 relative">
              <Search className="h-5 w-5 text-purple-600 absolute left-3 top-1/2 -translate-y-1/2" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar por título, descripción o etiqueta..."
                className="pl-10 border-2 border-purple-200 focus:border-purple-400 bg-white/70"
              />
            </div>
            <div className="flex flex-wrap gap-2">
              <div className="flex items-center text-white bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl px-3 py-2 gap-2">
                <TagIcon className="h-4 w-4" />
                <span className="text-sm">Etiquetas</span>
              </div>
              {allTags.slice(0, 10).map((tag) => (
                <button
                  key={tag}
                  onClick={() => toggleTag(tag)}
                  className={`px-3 py-2 rounded-xl text-sm border-2 transition-all ${
                    selectedTags.includes(tag)
                      ? "border-purple-500 bg-purple-50 text-purple-700"
                      : "border-purple-200 hover:border-purple-400"
                  }`}
                >
                  #{tag}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      {/* Nav categorías + Subir */}
      <nav className="bg-white/80 backdrop-blur-md border-b border-purple-200 sticky top-0 z-20 shadow-lg">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between py-4">
            <div className="flex space-x-2 overflow-x-auto">
              {categories.map((category) => {
                const Icon = iconMap[category.icon as keyof typeof iconMap]
                return (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "ghost"}
                    onClick={() => setSelectedCategory(category.id)}
                    className={`flex items-center gap-2 whitespace-nowrap transition-all duration-300 ${
                      selectedCategory === category.id
                        ? `bg-gradient-to-r ${category.color} text-white shadow-lg scale-105`
                        : "hover:bg-gradient-to-r hover:from-purple-100 hover:to-pink-100"
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    {category.name}
                  </Button>
                )
              })}
            </div>

            <Button
              variant="outline"
              className="hidden sm:inline-flex mr-2 bg-transparent"
              onClick={scrollToContact}
              aria-label="Ir a la sección de contacto"
            >
              Contacto
            </Button>

            {/* Subir foto */}
            <Dialog open={isUploadOpen} onOpenChange={setIsUploadOpen}>
              <DialogTrigger asChild>
                <Button className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-2 px-6 rounded-xl shadow-lg transform hover:scale-105 transition-all duration-300">
                  <Plus className="h-5 w-5 mr-2" />
                  Subir Foto
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 max-w-2xl">
                <DialogHeader>
                  <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
                    📸 Subir Nueva Fotografía
                  </DialogTitle>
                </DialogHeader>
                <div className="space-y-6 pt-4">
                  <div
                    className="border-2 border-dashed border-green-300 rounded-xl p-8 text-center bg-gradient-to-br from-green-50 to-emerald-50 hover:from-green-100 hover:to-emerald-100 transition-all duration-300 cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    {newPhoto.imageUrl ? (
                      <div className="space-y-4">
                        <Image
                          src={newPhoto.imageUrl || "/placeholder.svg"}
                          alt="Preview"
                          width={400}
                          height={300}
                          className="mx-auto rounded-lg shadow-lg object-cover"
                        />
                        <p className="text-green-600 font-medium">¡Imagen cargada! 🎉</p>
                      </div>
                    ) : (
                      <div className="space-y-4">
                        <Upload className="h-16 w-16 text-green-400 mx-auto" />
                        <div>
                          <p className="text-lg font-medium text-green-700">Arrastra tu foto aquí</p>
                          <p className="text-green-600">o haz clic para seleccionar</p>
                        </div>
                      </div>
                    )}
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input
                      placeholder="Título de la foto"
                      value={newPhoto.title}
                      onChange={(e) => setNewPhoto({ ...newPhoto, title: e.target.value })}
                      className="border-2 border-green-200 focus:border-green-400"
                    />
                    <Select
                      value={newPhoto.category}
                      onValueChange={(value) => setNewPhoto({ ...newPhoto, category: value })}
                    >
                      <SelectTrigger className="border-2 border-green-200 focus:border-green-400">
                        <SelectValue placeholder="Categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.slice(1).map((category) => (
                          <SelectItem key={category.id} value={category.id}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <Textarea
                    placeholder="Describe tu fotografía..."
                    value={newPhoto.description}
                    onChange={(e) => setNewPhoto({ ...newPhoto, description: e.target.value })}
                    className="border-2 border-green-200 focus:border-green-400"
                    rows={3}
                  />
                  <Input
                    placeholder="Etiquetas separadas por coma: paisaje, montaña, azul..."
                    value={newPhoto.tags}
                    onChange={(e) => setNewPhoto({ ...newPhoto, tags: e.target.value })}
                    className="border-2 border-green-200 focus:border-green-400"
                  />

                  <Button
                    onClick={handleUploadPhoto}
                    disabled={!newPhoto.title || !newPhoto.description || !newPhoto.category || !newPhoto.file}
                    className="w-full bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-bold py-3 rounded-xl disabled:opacity-50"
                  >
                    🚀 ¡Publicar Fotografía!
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </nav>

      {/* Contenido principal — Masonry grid */}
      <main className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {filteredPhotos.length === 0 ? (
          <div className="text-center py-16">
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-3xl p-12 max-w-md mx-auto">
              <Camera className="h-16 w-16 text-purple-400 mx-auto mb-6" />
              <h3 className="text-2xl font-bold text-purple-700 mb-2">Aún no hay fotos</h3>
              <p className="text-purple-600 mb-6">Sube tus primeras imágenes para empezar tu galería.</p>
              <Button
                onClick={() => setIsUploadOpen(true)}
                className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold px-6 py-3 rounded-xl"
              >
                Subir primera foto
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="columns-1 sm:columns-2 lg:columns-3 gap-6 [column-fill:_balance]">
              {filteredPhotos.map((photo) => (
                <div key={photo.id} className="mb-6 break-inside-avoid">
                  <Card className="overflow-hidden bg-white/90 backdrop-blur-sm shadow-2xl hover:shadow-3xl transition-all duration-500 hover:-translate-y-1 border-2 border-purple-100">
                    <CardContent className="p-0">
                      <div className="relative group">
                        {/* Botón eliminar */}
                        <button
                          onClick={() => handleDelete(photo.id)}
                          className="absolute right-3 top-3 z-10 rounded-lg bg-red-600 text-white px-3 py-1 text-sm shadow hover:bg-red-700 active:scale-95 focus:outline-none focus:ring-2 focus:ring-red-300"
                          title="Eliminar publicación"
                          aria-label="Eliminar publicación"
                        >
                          Eliminar
                        </button>
                        <Image
                          src={photo.imageUrl || "/placeholder.svg"}
                          alt={photo.title}
                          width={1600}
                          height={1200}
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                          className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-[1.02] cursor-zoom-in"
                          onClick={() => {
                            const start = filteredPhotos.findIndex((p) => p.id === photo.id)
                            setLightboxIndex(Math.max(0, start))
                            setLightboxOpen(true)
                          }}
                        />
                        <Badge
                          className={`absolute top-4 left-4 bg-gradient-to-r ${
                            (categories.find((c) => c.id === photo.category) as any)?.color
                          } text-white font-bold px-3 py-1 rounded-full shadow-lg`}
                        >
                          {categories.find((c) => c.id === photo.category)?.name}
                        </Badge>

                        <CommentTicker comments={photo.comments} overlay />
                      </div>

                      <div className="p-6 bg-gradient-to-br from-white to-purple-50">
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <h2 className="text-xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                              {photo.title}
                            </h2>
                            <p className="text-purple-600 text-xs font-medium">Hace {photo.timestamp} ⏰</p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {photo.tags.slice(0, 4).map((t) => (
                              <span
                                key={t}
                                className="text-xs px-2 py-1 rounded-full bg-purple-100 text-purple-700 border border-purple-200"
                              >
                                #{t}
                              </span>
                            ))}
                          </div>
                        </div>

                        <p className="text-slate-700 mt-3">{photo.description}</p>

                        <div className="mt-5 flex items-center gap-3">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleLike(photo.id)}
                            className={`flex items-center gap-2 transition-all ${
                              photo.isLiked ? "text-red-500 bg-red-50 hover:bg-red-100 scale-105" : "text-slate-700"
                            }`}
                          >
                            <Heart
                              className={`h-5 w-5 ${photo.isLiked ? "fill-current motion-safe:animate-pulse" : ""}`}
                            />
                            <span className="font-semibold">{photo.likes}</span>
                          </Button>

                          <Button
                            variant="ghost"
                            size="sm"
                            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                            onClick={() => (window.location.href = `/photos/${photo.id}`)}
                          >
                            <MessageCircle className="h-5 w-5" />
                            <span className="font-semibold">{photo.comments.length}</span>
                          </Button>

                          <ShareButtons
                            title={photo.title}
                            className="ml-1"
                            shareUrl={`${typeof window !== "undefined" ? window.location.origin : ""}/photos/${photo.id}`}
                          />

                          <div className="ml-auto">
                            <ReactionBar
                              initialReactions={photo.reactions}
                              initialUserReaction={photo.userReaction}
                              onChange={async (next, key) => {
                                setPhotos((arr) =>
                                  arr.map((p) =>
                                    p.id === photo.id ? { ...p, reactions: next, userReaction: key } : p,
                                  ),
                                )
                                await updatePhotoData(photo.id, { reactions: next, userReaction: key })
                              }}
                            />
                          </div>
                        </div>

                        {/* Comentarios + añadir */}
                        <div className="mt-6 space-y-3">
                          <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                            {photo.comments.map((comment) => (
                              <div
                                key={comment.id}
                                className="flex gap-3 p-3 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl border border-purple-100"
                              >
                                <Avatar className="h-9 w-9 border-2 border-purple-200">
                                  <AvatarImage
                                    src={comment.avatar || "/placeholder.svg?height=40&width=40&query=avatar"}
                                  />
                                  <AvatarFallback>U</AvatarFallback>
                                </Avatar>
                                <div className="flex-1">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="font-semibold text-purple-700">{comment.author}</span>
                                    <span className="text-xs text-purple-600 bg-purple-100 px-2 py-0.5 rounded-full">
                                      hace {comment.timestamp}
                                    </span>
                                  </div>
                                  <p className="text-slate-700 text-sm">{comment.content}</p>
                                </div>
                              </div>
                            ))}
                          </div>

                          <div className="pt-3 border-t border-purple-200 space-y-2">
                            <Input
                              placeholder="Tu nombre ✨"
                              value={commenterName[photo.id] || ""}
                              onChange={(e) => setCommenterName({ ...commenterName, [photo.id]: e.target.value })}
                              className="border-2 border-purple-200 focus:border-purple-400 bg-gradient-to-r from-purple-50 to-pink-50"
                            />
                            <div className="flex gap-2">
                              <Textarea
                                placeholder="Escribe tu comentario... 💭"
                                value={newComment[photo.id] || ""}
                                onChange={(e) => setNewComment({ ...newComment, [photo.id]: e.target.value })}
                                className="flex-1 resize-none border-2 border-purple-200 focus:border-purple-400 bg-gradient-to-r from-purple-50 to-pink-50"
                                rows={2}
                              />
                              <Button
                                onClick={() => handleAddComment(photo.id)}
                                size="sm"
                                className="self-end bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold px-6 py-3 rounded-xl shadow-lg"
                                disabled={!newComment[photo.id]?.trim() || !commenterName[photo.id]?.trim()}
                              >
                                <Send className="h-5 w-5" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))}
            </div>

            {/* Sentinel para infinite scroll */}
            <div ref={sentinelRef} className="h-10" />
            <div className="sr-only" aria-live="polite">
              {loadingMore ? "Cargando más fotos..." : !hasMore ? "Has llegado al final" : ""}
            </div>
            {loadingMore && (
              <div className="py-8 text-center text-purple-600 font-medium" role="status">
                Cargando más fotos...
              </div>
            )}
            {!hasMore && <div className="py-8 text-center text-slate-500">Has llegado al final ✨</div>}
          </>
        )}
      </main>

      {/* Sección Contacto (Server Action) */}
      <section
        id="contacto"
        aria-labelledby="contacto-title"
        className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 mt-8"
      >
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="bg-white/90 backdrop-blur-sm rounded-2xl border-2 border-purple-100 shadow-2xl p-6">
            <h2
              id="contacto-title"
              className="text-3xl font-extrabold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent"
            >
              Contacto
            </h2>
            <p className="mt-2 text-slate-700">
              ¿Tienes una idea, quieres colaborar o reservar una sesión? Escríbeme y te respondo lo antes posible.
            </p>

            <form id="contact-form" action={formAction} className="mt-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <Input
                    name="name"
                    required
                    placeholder="Tu nombre"
                    className="border-2 border-purple-200 focus:border-purple-400"
                    aria-invalid={!!contactState?.errors?.name}
                  />
                  {contactState?.errors?.name && (
                    <p className="text-xs text-rose-600 mt-1" role="alert">
                      {contactState.errors.name}
                    </p>
                  )}
                </div>
                <div>
                  <Input
                    name="email"
                    required
                    type="email"
                    placeholder="Tu email"
                    className="border-2 border-purple-200 focus:border-purple-400"
                    aria-invalid={!!contactState?.errors?.email}
                  />
                  {contactState?.errors?.email && (
                    <p className="text-xs text-rose-600 mt-1" role="alert">
                      {contactState.errors.email}
                    </p>
                  )}
                </div>
              </div>
              <div>
                <Textarea
                  name="message"
                  required
                  placeholder="Tu mensaje"
                  rows={5}
                  className="border-2 border-purple-200 focus:border-purple-400"
                  aria-invalid={!!contactState?.errors?.message}
                />
                {contactState?.errors?.message && (
                  <p className="text-xs text-rose-600 mt-1" role="alert">
                    {contactState.errors.message}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-3">
                <Button
                  type="submit"
                  disabled={isSending}
                  className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600 text-white font-bold px-6 py-3 rounded-xl disabled:opacity-60"
                >
                  {isSending ? "Enviando…" : "Enviar mensaje"}
                </Button>
                <a
                  href={`mailto:${CONTACT_EMAIL}`}
                  className="text-sm text-purple-700 underline"
                  aria-label={`Abrir nuevo correo a ${CONTACT_EMAIL}`}
                >
                  O escribir directamente a {CONTACT_EMAIL}
                </a>
              </div>

              <div className="sr-only" aria-live="polite">
                {contactState?.message || ""}
              </div>
              {contactState?.success && (
                <p className="text-sm text-emerald-600 mt-2">¡Mensaje preparado! Revisa tu cliente de correo.</p>
              )}
            </form>
          </div>

          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl border-2 border-purple-100 shadow-2xl p-6">
            <h3 className="text-2xl font-bold text-purple-700">También puedes escribirme aquí</h3>
            <div className="mt-4 space-y-3">
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="flex items-center gap-3 p-3 rounded-xl bg-white/80 hover:bg-white transition-colors border border-purple-100"
                aria-label={`Enviar email a ${CONTACT_EMAIL}`}
              >
                <Mail className="h-5 w-5 text-rose-600" />
                <span className="font-medium text-slate-800">{CONTACT_EMAIL}</span>
              </a>
              <a
                href="https://instagram.com/LensByJRR"
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-3 p-3 rounded-xl bg-white/80 hover:bg-white transition-colors border border-purple-100"
                aria-label="Abrir Instagram LensByJRR"
              >
                <Instagram className="h-5 w-5 text-fuchsia-600" />
                <span className="font-medium text-slate-800">@LensByJRR</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gradient-to-r from-purple-600 via-pink-600 to-red-500 mt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 mb-4">
              <Image src="/logo.png" alt="Logo LENSBYJRR" width={32} height={32} className="h-8 w-8 rounded-lg" />
              <h3 className="text-2xl font-bold text-white">LENSBYJRR</h3>
              <Sparkles className="h-8 w-8 text-yellow-300 motion-safe:animate-pulse" />
            </div>
            <p className="text-white/90 text-lg">© 2025 Todos los derechos reservados.</p>

            {/* Contacto rápido */}
            <div className="mt-6 flex flex-col sm:flex-row items-center justify-center gap-3 text-white">
              <a
                href={`mailto:${CONTACT_EMAIL}`}
                className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 transition-colors px-4 py-2 rounded-xl"
                aria-label={`Enviar email a ${CONTACT_EMAIL}`}
              >
                <Mail className="h-4 w-4" />
                <span className="font-medium">{CONTACT_EMAIL}</span>
              </a>
              <a
                href="https://instagram.com/LensByJRR"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 bg-white/15 hover:bg-white/25 transition-colors px-4 py-2 rounded-xl"
                aria-label="Abrir Instagram LensByJRR"
              >
                <Instagram className="h-4 w-4" />
                <span className="font-medium">@LensByJRR</span>
              </a>
            </div>

            <p className="mt-4 text-white/80 text-sm">¿Te gusta mi trabajo? Apóyame con una donación. ¡Gracias! 💖</p>
          </div>
        </div>
      </footer>

      {/* Botón de donación flotante */}
      <Dialog open={isDonateOpen} onOpenChange={setIsDonateOpen}>
        <DialogTrigger asChild>
          <Button
            className="fixed right-6 z-50 group bg-gradient-to-r from-fuchsia-500 via-pink-500 to-rose-500 hover:from-fuchsia-600 hover:via-pink-600 hover:to-rose-600 text-white font-extrabold px-6 py-5 rounded-2xl shadow-[0_10px_30px_rgba(236,72,153,0.5)] transform hover:scale-105 transition-all duration-300 border-0"
            style={{ bottom: "calc(1.5rem + env(safe-area-inset-bottom))" }}
            aria-label="Hacer una donación"
          >
            <span className="absolute inset-0 rounded-2xl bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
            <span className="absolute -inset-1 rounded-2xl blur-lg bg-gradient-to-r from-fuchsia-500 via-pink-500 to-rose-500 opacity-50 group-hover:opacity-70 -z-10" />
            <div className="flex items-center gap-2 relative">
              <HandHeart className="h-6 w-6 motion-safe:animate-pulse" />
              <span className="text-lg">Donar</span>
            </div>
          </Button>
        </DialogTrigger>

        <DialogContent className="bg-gradient-to-br from-rose-50 via-pink-50 to-fuchsia-50 border-2 border-pink-200">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold bg-gradient-to-r from-rose-600 to-fuchsia-600 bg-clip-text text-transparent">
              Apoya este proyecto 💖
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-5 pt-2">
            <p className="text-slate-700">
              Si te gusta mi trabajo, puedes apoyar con una pequeña donación. ¡Gracias por ayudarme a seguir creando! ✨
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {paypalLink ? (
                <Button asChild className="w-full bg-[#003087] hover:bg-[#00256b] text-white font-bold rounded-xl">
                  <a
                    href={paypalLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Donar con PayPal (se abre en otra pestaña)"
                  >
                    Donar con PayPal
                    <ExternalLink className="ml-2 h-4 w-4" />
                  </a>
                </Button>
              ) : (
                <Button disabled className="w-full bg-[#003087]/60 text-white font-bold rounded-xl">
                  Configura PayPal en lib/config.ts
                </Button>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Lightbox global */}
      <Lightbox
        open={lightboxOpen}
        onClose={() => setLightboxOpen(false)}
        images={lightboxImages}
        startIndex={lightboxIndex}
      />

      <style jsx>{`
        @keyframes fadeInUp {
          from { opacity: 0; transform: translateY(30px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animation-delay-2000 { animation-delay: 2s; }
        .animation-delay-4000 { animation-delay: 4s; }
      `}</style>
      <style jsx global>{`
        html { scroll-behavior: smooth; }
      `}</style>
    </div>
  )
}
