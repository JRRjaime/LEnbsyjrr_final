"use client"

import { Container } from "@/components/container"
import { Camera, Video } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

export default function HomePage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-zinc-950 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-amber-900/20 via-zinc-950 to-zinc-950" />

      <Container className="text-center relative z-10">
        <div className="mb-12">
          <div className="w-32 h-32 mx-auto mb-8 rounded-full overflow-hidden border-4 border-amber-600/30">
            <Image
              src="/logo.png"
              alt="LensByJRR Logo"
              width={128}
              height={128}
              className="w-full h-full object-cover"
            />
          </div>
          <h1 className="text-6xl md:text-8xl font-bold mb-6 tracking-tight text-amber-50">LensByJRR</h1>
          <p className="text-2xl md:text-3xl text-amber-200/80 font-light">Fotografía & Vídeo</p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 max-w-3xl mx-auto">
          <Link href="/fotografia" className="group">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-amber-800/40 to-zinc-800/60 border border-amber-600/20 hover:border-amber-500/40 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-amber-900/20">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="p-12 text-center relative z-10">
                <Camera className="w-16 h-16 mx-auto mb-6 text-amber-400 group-hover:text-amber-300 transition-colors duration-300 group-hover:scale-110 transform transition-transform" />
                <h2 className="text-3xl font-bold text-amber-50 mb-2">Fotografía</h2>
                <p className="text-amber-200/60 group-hover:text-amber-200/80 transition-colors duration-300">
                  Explora mi trabajo visual
                </p>
              </div>
            </div>
          </Link>

          <Link href="/videos" className="group">
            <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-zinc-800/60 to-zinc-900/80 border border-zinc-600/20 hover:border-zinc-400/40 transition-all duration-500 hover:scale-105 hover:shadow-2xl hover:shadow-zinc-900/40">
              <div className="absolute inset-0 bg-gradient-to-br from-zinc-600/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="p-12 text-center relative z-10">
                <Video className="w-16 h-16 mx-auto mb-6 text-zinc-300 group-hover:text-zinc-200 transition-colors duration-300 group-hover:scale-110 transform transition-transform" />
                <h2 className="text-3xl font-bold text-zinc-100 mb-2">Video</h2>
                <p className="text-zinc-400 group-hover:text-zinc-300 transition-colors duration-300">
                  Historias en movimiento
                </p>
              </div>
            </div>
          </Link>
        </div>
      </Container>
    </div>
  )
}
