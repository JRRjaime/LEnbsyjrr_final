"use client"

import Image from "next/image"
import Link from "next/link"
import { motion } from "framer-motion"

interface CardProps {
  href: string
  image: string
  title: string
  subtitle?: string
  className?: string
}

export function Card({ href, image, title, subtitle, className }: CardProps) {
  return (
    <motion.div whileHover={{ scale: 1.03, y: -4 }} transition={{ duration: 0.2 }} className={className}>
      <Link href={href} className="block relative group overflow-hidden rounded-lg focus-visible">
        <div className="aspect-[4/3] relative">
          <Image
            src={image || "/placeholder.svg"}
            alt={title}
            fill
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h3 className="text-2xl font-bold mb-2">{title}</h3>
            {subtitle && <p className="text-[#B4B4B4] text-sm">{subtitle}</p>}
          </div>
        </div>
      </Link>
    </motion.div>
  )
}
