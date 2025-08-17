"use client"

import { motion } from "framer-motion"
import type { Video } from "@/lib/data"

interface VideoCardProps {
  video: Video
  index: number
}

export function VideoCard({ video, index }: VideoCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="bg-[#141414] rounded-lg overflow-hidden"
    >
      <div className="aspect-video">
        <iframe
          src={video.url}
          title={video.title}
          className="w-full h-full"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          loading="lazy"
        />
      </div>
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{video.title}</h3>
        {video.description && <p className="text-[#B4B4B4] text-sm">{video.description}</p>}
      </div>
    </motion.div>
  )
}
