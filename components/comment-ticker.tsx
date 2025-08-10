"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import { MessageCircle, Pause, Play } from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import type { Comment } from "@/lib/data"

type Props = {
  comments?: Comment[]
  intervalMs?: number
  overlay?: boolean
}

export default function CommentTicker(
  { comments = [], intervalMs = 3500, overlay = false }: Props = { comments: [], intervalMs: 3500, overlay: false },
) {
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const timerRef = useRef<number | null>(null)
  const reduceMotion = useRef<boolean>(false)

  const list = useMemo(() => (comments.length ? comments : []), [comments])

  useEffect(() => {
    // Respeta prefers-reduced-motion
    if (typeof window !== "undefined") {
      reduceMotion.current = window.matchMedia("(prefers-reduced-motion: reduce)").matches
    }
  }, [])

  useEffect(() => {
    if (paused || list.length === 0 || reduceMotion.current) return
    timerRef.current = window.setInterval(() => {
      setIndex((i) => (i + 1) % list.length)
    }, intervalMs)
    return () => {
      if (timerRef.current) window.clearInterval(timerRef.current)
    }
  }, [paused, list, intervalMs])

  if (!list.length) return null
  const current = list[index]

  return (
    <div
      className={`${overlay ? "absolute bottom-4 left-4 right-4 md:left-auto md:right-4 md:bottom-4" : "w-full"}`}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      aria-live="polite"
    >
      <div className="flex w-full items-start sm:items-center gap-3 sm:gap-4 bg-white/90 backdrop-blur-md rounded-xl shadow-lg p-3 sm:p-3 border border-purple-100 hover:border-purple-200 transition-colors">
        <div className="flex items-center gap-2 shrink-0 px-2 py-1 rounded-lg bg-purple-50 border border-purple-200 text-purple-700 font-semibold">
          <MessageCircle className="h-4 w-4" />
          <span className="hidden sm:inline">Comentario</span>
          <span className="sm:hidden">Coment.</span>
        </div>

        <Avatar className="h-8 w-8 border-2 border-purple-200 shrink-0">
          <AvatarImage src={current.avatar || "/placeholder.svg?height=40&width=40&query=avatar"} />
          <AvatarFallback className="text-xs">U</AvatarFallback>
        </Avatar>

        <div className="min-w-0 flex-1">
          <p className="text-sm font-semibold text-slate-900 truncate">{current.author}</p>
          <p className="text-sm text-slate-700 truncate">{current.content}</p>
        </div>

        <button
          aria-label={paused ? "Reanudar" : "Pausar"}
          className="ml-auto text-slate-600 hover:text-slate-900 shrink-0"
          onClick={() => setPaused((p) => !p)}
        >
          {paused ? <Play className="h-5 w-5" /> : <Pause className="h-5 w-5" />}
        </button>
      </div>
    </div>
  )
}
