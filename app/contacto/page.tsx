"use client"

import type React from "react"

import { useState } from "react"
import { Container } from "@/components/container"
import { SectionTitle } from "@/components/section-title"

export default function ContactoPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    message: "",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [errors, setErrors] = useState<Record<string, string>>({})

  const validateForm = () => {
    const newErrors: Record<string, string> = {}

    if (!formData.name.trim()) {
      newErrors.name = "El nombre es obligatorio"
    }

    if (!formData.email.trim()) {
      newErrors.email = "El email es obligatorio"
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "El email no es válido"
    }

    if (!formData.message.trim()) {
      newErrors.message = "El mensaje es obligatorio"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsSubmitting(true)

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000))

    setIsSubmitting(false)
    setShowSuccess(true)
    setFormData({ name: "", email: "", message: "" })

    setTimeout(() => setShowSuccess(false), 5000)
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  return (
    <div className="pt-24 pb-16">
      <Container>
        <SectionTitle
          title="Contacto"
          subtitle="¿Tienes un proyecto en mente? Me encantaría escucharte."
          className="mb-12 text-center"
        />

        <div className="max-w-2xl mx-auto">
          {showSuccess && (
            <div className="bg-[#10B981]/10 border border-[#10B981]/20 text-[#10B981] p-4 rounded-lg mb-8">
              ¡Gracias por tu mensaje! Te responderé pronto.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium mb-2">
                Nombre *
              </label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#141414] border border-[#333] rounded-lg focus:border-[#10B981] focus:outline-none transition-colors"
                placeholder="Tu nombre"
              />
              {errors.name && <p className="text-red-400 text-sm mt-1">{errors.name}</p>}
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium mb-2">
                Email *
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-[#141414] border border-[#333] rounded-lg focus:border-[#10B981] focus:outline-none transition-colors"
                placeholder="tu@email.com"
              />
              {errors.email && <p className="text-red-400 text-sm mt-1">{errors.email}</p>}
            </div>

            <div>
              <label htmlFor="message" className="block text-sm font-medium mb-2">
                Mensaje *
              </label>
              <textarea
                id="message"
                name="message"
                value={formData.message}
                onChange={handleChange}
                rows={6}
                className="w-full px-4 py-3 bg-[#141414] border border-[#333] rounded-lg focus:border-[#10B981] focus:outline-none transition-colors resize-vertical"
                placeholder="Cuéntame sobre tu proyecto..."
              />
              {errors.message && <p className="text-red-400 text-sm mt-1">{errors.message}</p>}
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-[#10B981] hover:bg-[#0d9668] disabled:bg-[#10B981]/50 text-white py-3 px-6 rounded-lg font-semibold transition-colors focus-visible"
            >
              {isSubmitting ? "Enviando..." : "Enviar mensaje"}
            </button>
          </form>
        </div>
      </Container>
    </div>
  )
}
