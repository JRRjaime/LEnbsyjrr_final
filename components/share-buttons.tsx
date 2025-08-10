"use client"

import { Button } from "@/components/ui/button"
import { Facebook, Mail, Send, Twitter, MessageCircle } from "lucide-react"
import { cn } from "@/lib/utils"

type Props = {
  title: string
  shareUrl?: string
  className?: string
  compact?: boolean
}

// Abre en nueva pestaña y deja que el sistema haga deep link a la app si está instalada
function openShare(url: string) {
  window.open(url, "_blank", "noopener,noreferrer")
}

export default function ShareButtons({ title, shareUrl, className, compact = false }: Props) {
  const currentUrl = typeof window !== "undefined" ? shareUrl || window.location.href : shareUrl || "/"

  const encodedUrl = encodeURIComponent(currentUrl)
  const encodedText = encodeURIComponent(title)

  const links = {
    whatsapp: `https://wa.me/?text=${encodedText}%20${encodedUrl}`,
    x: `https://twitter.com/intent/tweet?text=${encodedText}&url=${encodedUrl}`,
    facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`,
    telegram: `https://t.me/share/url?url=${encodedUrl}&text=${encodedText}`,
    email: `mailto:?subject=${encodedText}&body=${encodedText}%0A${encodedUrl}`,
  }

  if (compact) {
    // Variante compacta en un solo botón que abre opciones nativas si existen
    return (
      <Button
        variant="ghost"
        size="sm"
        className={cn("flex items-center gap-2 text-green-600 hover:text-green-700 hover:bg-green-50", className)}
        onClick={() => {
          if (navigator.share) {
            navigator.share({ title, text: title, url: currentUrl }).catch(() => {})
          } else {
            openShare(links.whatsapp)
          }
        }}
      >
        <MessageCircle className="h-5 w-5" />
        Compartir
      </Button>
    )
  }

  return (
    <div className={cn("flex items-center gap-1 sm:gap-2", className)}>
      <Button
        variant="ghost"
        size="sm"
        aria-label="Compartir por WhatsApp"
        className="text-green-600 hover:text-green-700 hover:bg-green-50"
        onClick={() => openShare(links.whatsapp)}
      >
        <MessageCircle className="h-5 w-5" />
        <span className="sr-only">WhatsApp</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        aria-label="Compartir en X"
        className="text-black hover:bg-slate-100"
        onClick={() => openShare(links.x)}
      >
        <Twitter className="h-5 w-5" />
        <span className="sr-only">X</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        aria-label="Compartir en Facebook"
        className="text-blue-700 hover:text-blue-800 hover:bg-blue-50"
        onClick={() => openShare(links.facebook)}
      >
        <Facebook className="h-5 w-5" />
        <span className="sr-only">Facebook</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        aria-label="Compartir por Telegram"
        className="text-sky-600 hover:text-sky-700 hover:bg-sky-50"
        onClick={() => openShare(links.telegram)}
      >
        <Send className="h-5 w-5" />
        <span className="sr-only">Telegram</span>
      </Button>
      <Button
        variant="ghost"
        size="sm"
        aria-label="Compartir por Email"
        className="text-rose-600 hover:text-rose-700 hover:bg-rose-50"
        onClick={() => openShare(links.email)}
      >
        <Mail className="h-5 w-5" />
        <span className="sr-only">Email</span>
      </Button>
    </div>
  )
}
