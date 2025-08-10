"use client"

import { useEffect, useState } from "react"
import Image from "next/image"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Heart, MessageCircle } from "lucide-react"
import ReactionBar from "@/components/reaction-bar"
import CommentTicker from "@/components/comment-ticker"
import ShareButtons from "@/components/share-buttons"
import type { Photo } from "@/lib/data"
import { loadPhotoById, updatePhotoData } from "@/lib/storage"

type Params = { id: string }

export default function PhotoPageClient({ params }: { params: Params }) {
  const [photo, setPhoto] = useState<Photo | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    loadPhotoById(params.id).then((p) => {
      if (!mounted) return
      setPhoto(p)
      setLoading(false)
    })
    return () => {
      mounted = false
    }
  }, [params.id])

  if (loading) return <main className="min-h-screen bg-slate-50 p-8">Cargando…</main>
  if (!photo) {
    return (
      <main className="min-h-screen bg-slate-50 p-8">
        <div className="max-w-2xl mx-auto text-center p-8 bg-white rounded-xl shadow">
          <p className="text-lg">No he encontrado esta foto en este dispositivo.</p>
          <Button className="mt-4" onClick={() => (window.location.href = "/")}>
            Volver al inicio
          </Button>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="relative w-full h-[52vh] md:h-[68vh] bg-black">
        <Image
          src={photo.imageUrl || "/placeholder.svg"}
          alt={photo.title}
          fill
          sizes="100vw"
          style={{ objectFit: "cover" }}
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6 md:left-10 md:right-10 text-white">
          <div className="flex items-center gap-3 mb-3">
            <Badge className="bg-white/20 text-white border-white/30">#{photo.category}</Badge>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold">{photo.title}</h1>
          <p className="mt-2 max-w-3xl text-white/90">{photo.description}</p>
          <div className="mt-4 max-w-2xl">
            <CommentTicker comments={photo.comments} />
          </div>
        </div>
      </div>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            className="text-rose-600 hover:bg-rose-50"
            onClick={async () => {
              const next = {
                ...photo,
                likes: photo.isLiked ? photo.likes - 1 : photo.likes + 1,
                isLiked: !photo.isLiked,
              }
              setPhoto(next)
              await updatePhotoData(photo.id, { likes: next.likes, isLiked: next.isLiked })
            }}
          >
            <Heart className="h-5 w-5 mr-2" />
            {photo.likes}
          </Button>
          <Button variant="ghost" className="text-blue-600 hover:bg-blue-50">
            <MessageCircle className="h-5 w-5 mr-2" />
            {photo.comments.length}
          </Button>
          <ShareButtons
            title={photo.title}
            shareUrl={`${typeof window !== "undefined" ? window.location.origin : ""}/photos/${photo.id}`}
            className="ml-1"
          />

          <div className="ml-auto">
            <ReactionBar
              initialReactions={photo.reactions}
              initialUserReaction={photo.userReaction}
              onChange={async (reactions, key) => {
                setPhoto({ ...photo, reactions, userReaction: key })
                await updatePhotoData(photo.id, { reactions, userReaction: key })
              }}
            />
          </div>
        </div>

        <div className="mt-6">
          <Image
            src={photo.imageUrl || "/placeholder.svg"}
            alt={photo.title}
            width={1600}
            height={1200}
            sizes="(max-width: 1024px) 100vw, 960px"
            className="w-full h-auto rounded-xl shadow-lg"
          />
        </div>
      </section>
    </main>
  )
}
