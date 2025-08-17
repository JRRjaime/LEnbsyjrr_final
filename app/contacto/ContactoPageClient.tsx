"use client"

import type React from "react"
import { useState } from "react"
import { Container } from "@/components/container"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Card } from "@/components/ui/card"
import { Instagram, Mail, Music, Camera, MapPin, Clock } from "lucide-react"

export function ContactoPageClient() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // Create mailto link with form data
    const subject = encodeURIComponent(`Consulta de ${formData.name}`)
    const body = encodeURIComponent(
      `Nombre: ${formData.name}\nEmail: ${formData.email}\n\nMensaje:\n${formData.message}`,
    )
    window.location.href = `mailto:jrrfotografia2004@gmail.com?subject=${subject}&body=${body}`
  }

  const socialLinks = [
    {
      name: "Instagram",
      username: "@LensByJRR",
      url: "https://instagram.com/LensByJRR",
      icon: Instagram,
      color: "from-pink-500 to-purple-600",
    },
    {
      name: "TikTok",
      username: "@LensByJRR",
      url: "https://tiktok.com/@LensByJRR",
      icon: Music,
      color: "from-black to-red-500",
    },
    {
      name: "Gmail",
      username: "jrrfotografia2004@gmail.com",
      url: "mailto:jrrfotografia2004@gmail.com",
      icon: Mail,
      color: "from-red-500 to-orange-500",
    },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-black text-white">
      <Container className="py-20">
        <div className="text-center mb-20">
          <div className="relative inline-block">
            <h1 className="text-6xl md:text-7xl font-bold mb-6 bg-gradient-to-r from-amber-200 via-amber-300 to-orange-400 bg-clip-text text-transparent">
              Contacto
            </h1>
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-600/20 to-orange-600/20 blur-xl -z-10"></div>
          </div>
          <p className="text-xl md:text-2xl text-zinc-300 max-w-3xl mx-auto leading-relaxed">
            ¿Tienes un proyecto en mente? Me encantaría escuchar tu historia y capturar esos momentos únicos que
            perdurarán para siempre.
          </p>
          <div className="mt-8">
            <Camera className="w-12 h-12 mx-auto text-amber-400/60" />
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          <Card className="bg-gradient-to-br from-zinc-900/80 to-zinc-800/60 border-zinc-700/50 backdrop-blur-sm p-8 shadow-2xl">
            <div className="flex items-center gap-3 mb-6">
              <Mail className="w-6 h-6 text-amber-400" />
              <h2 className="text-2xl font-semibold text-white">Envíame un mensaje</h2>
            </div>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <Input
                  placeholder="Tu nombre"
                  value={formData.name}
                  onChange={(e) => setFormData((prev) => ({ ...prev, name: e.target.value }))}
                  className="bg-zinc-800/50 border-zinc-600/50 text-white placeholder:text-zinc-400 focus:border-amber-400/50 focus:ring-amber-400/20 h-12"
                  required
                />
              </div>
              <div>
                <Input
                  type="email"
                  placeholder="Tu email"
                  value={formData.email}
                  onChange={(e) => setFormData((prev) => ({ ...prev, email: e.target.value }))}
                  className="bg-zinc-800/50 border-zinc-600/50 text-white placeholder:text-zinc-400 focus:border-amber-400/50 focus:ring-amber-400/20 h-12"
                  required
                />
              </div>
              <div>
                <Textarea
                  placeholder="Cuéntame sobre tu proyecto... ¿Qué tipo de fotografía necesitas? ¿Cuándo y dónde sería?"
                  value={formData.message}
                  onChange={(e) => setFormData((prev) => ({ ...prev, message: e.target.value }))}
                  className="bg-zinc-800/50 border-zinc-600/50 text-white placeholder:text-zinc-400 focus:border-amber-400/50 focus:ring-amber-400/20 min-h-32 resize-none"
                  required
                />
              </div>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-black font-semibold py-4 text-lg shadow-lg hover:shadow-xl transition-all duration-300"
              >
                Enviar Mensaje
              </Button>
            </form>
          </Card>

          <div className="space-y-8">
            <div>
              <h2 className="text-2xl font-semibold mb-6 text-white flex items-center gap-3">
                <Instagram className="w-6 h-6 text-amber-400" />
                Sígueme en redes
              </h2>
              <div className="space-y-4">
                {socialLinks.map((social) => {
                  const Icon = social.icon
                  return (
                    <a
                      key={social.name}
                      href={social.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block"
                    >
                      <Card className="bg-gradient-to-r from-zinc-900/80 to-zinc-800/60 border-zinc-700/50 backdrop-blur-sm p-6 hover:from-zinc-800/80 hover:to-zinc-700/60 transition-all duration-300 group-hover:scale-105 group-hover:shadow-xl">
                        <div className="flex items-center space-x-4">
                          <div
                            className={`p-4 rounded-full bg-gradient-to-r ${social.color} shadow-lg group-hover:shadow-xl transition-shadow`}
                          >
                            <Icon className="w-6 h-6 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-white text-lg">{social.name}</h3>
                            <p className="text-zinc-400 group-hover:text-zinc-300 transition-colors">
                              {social.username}
                            </p>
                          </div>
                        </div>
                      </Card>
                    </a>
                  )
                })}
              </div>
            </div>

            <Card className="bg-gradient-to-br from-zinc-900/80 to-zinc-800/60 border-zinc-700/50 backdrop-blur-sm p-6 shadow-xl">
              <div className="flex items-center gap-3 mb-4">
                <Camera className="w-6 h-6 text-amber-400" />
                <h3 className="font-semibold text-white text-xl">Servicios</h3>
              </div>
              <div className="grid grid-cols-1 gap-3">
                {[
                  "Fotografía de paisajes",
                  "Fotografía urbana",
                  "Fotografía de fauna y flora",
                  "Fotografía de eventos (Semana Santa)",
                  "Fotografía aérea",
                  "Producción de video",
                ].map((service, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 text-zinc-300 hover:text-amber-300 transition-colors"
                  >
                    <div className="w-2 h-2 bg-amber-400 rounded-full"></div>
                    <span>{service}</span>
                  </div>
                ))}
              </div>
            </Card>

            <div className="grid grid-cols-1 gap-4">
              <Card className="bg-gradient-to-br from-zinc-900/80 to-zinc-800/60 border-zinc-700/50 backdrop-blur-sm p-6">
                <div className="flex items-center gap-3 mb-2">
                  <MapPin className="w-5 h-5 text-amber-400" />
                  <h4 className="font-semibold text-white">Ubicación</h4>
                </div>
                <p className="text-zinc-300">Disponible para proyectos locales y viajes</p>
              </Card>

              <Card className="bg-gradient-to-br from-zinc-900/80 to-zinc-800/60 border-zinc-700/50 backdrop-blur-sm p-6">
                <div className="flex items-center gap-3 mb-2">
                  <Clock className="w-5 h-5 text-amber-400" />
                  <h4 className="font-semibold text-white">Disponibilidad</h4>
                </div>
                <p className="text-zinc-300">Respuesta en 24-48 horas</p>
              </Card>
            </div>
          </div>
        </div>
      </Container>
    </div>
  )
}
