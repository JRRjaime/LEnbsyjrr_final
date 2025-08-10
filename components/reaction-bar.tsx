"use client"

import { useMemo, useState } from "react"
import { Button } from "@/components/ui/button"
import { Heart, Flame, HandIcon as HandClap, Smile } from "lucide-react"
import type { Reactions } from "@/lib/data"

type ReactionKey = keyof Reactions

type Props = {
  initialReactions?: Reactions
  initialUserReaction?: ReactionKey
  onChange?: (reactions: Reactions, userReaction?: ReactionKey) => void
}

export default function ReactionBar({ initialReactions, initialUserReaction, onChange }: Props = {}) {
  const [reactions, setReactions] = useState<Reactions>(initialReactions || { heart: 0, love: 0, fire: 0, clap: 0 })
  const [userReaction, setUserReaction] = useState<ReactionKey | undefined>(initialUserReaction)

  const buttons = useMemo(
    () => [
      { key: "heart" as ReactionKey, label: "❤️", Icon: Heart, color: "text-rose-600" },
      { key: "love" as ReactionKey, label: "😍", Icon: Smile, color: "text-pink-600" },
      { key: "fire" as ReactionKey, label: "🔥", Icon: Flame, color: "text-orange-600" },
      { key: "clap" as ReactionKey, label: "👏", Icon: HandClap, color: "text-emerald-600" },
    ],
    [],
  )

  function toggle(key: ReactionKey) {
    setReactions((r) => {
      const next = { ...r }
      if (userReaction === key) {
        next[key] = Math.max(0, next[key] - 1)
        setUserReaction(undefined)
        onChange?.(next, undefined)
        return next
      }
      // cambiar de reacción
      if (userReaction) next[userReaction] = Math.max(0, next[userReaction] - 1)
      next[key] = (next[key] || 0) + 1
      setUserReaction(key)
      onChange?.(next, key)
      return next
    })
  }

  return (
    <div className="flex items-center gap-2">
      {buttons.map(({ key, label, Icon, color }) => (
        <Button
          key={key}
          variant="ghost"
          size="sm"
          onClick={() => toggle(key)}
          className={`flex items-center gap-1 ${color} ${userReaction === key ? "bg-slate-100" : ""}`}
          aria-pressed={userReaction === key}
          aria-label={`Reacción ${label}`}
          title={`Reacción ${label}`}
        >
          <Icon className={`h-5 w-5 ${userReaction === key ? "fill-current" : ""}`} />
          <span className="font-semibold tabular-nums">{reactions[key] || 0}</span>
        </Button>
      ))}
    </div>
  )
}
