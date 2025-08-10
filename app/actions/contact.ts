"use server"

export type ContactActionState = {
  success?: boolean
  message: string
  errors: { name?: string; email?: string; message?: string }
  mailto?: string
}

const CONTACT_TO = "jrrfotografia20004@gmail.com"

function isValidEmail(email: string) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
}

export async function submitContact(_prev: ContactActionState, formData: FormData): Promise<ContactActionState> {
  const name = String(formData.get("name") || "").trim()
  const email = String(formData.get("email") || "").trim()
  const message = String(formData.get("message") || "").trim()

  const errors: ContactActionState["errors"] = {}
  if (!name) errors.name = "Tu nombre es obligatorio."
  if (!isValidEmail(email)) errors.email = "Introduce un email válido."
  if (!message) errors.message = "Escribe un mensaje."

  if (Object.keys(errors).length) {
    return { success: false, message: "Revisa los campos.", errors }
  }

  // Aquí podrías integrar un envío real (Resend, SMTP, etc.).
  // Por ahora, generamos un mailto para que el usuario envíe desde su cliente.
  const subject = "Contacto desde LENSBYJRR"
  const body = `Nombre: ${name}\nEmail: ${email}\n\n${message}`
  const mailto = `mailto:${CONTACT_TO}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`

  // Log server-side for your records (visible en logs de Vercel)
  console.log("[CONTACT] Nuevo mensaje", { name, email, message })

  return {
    success: true,
    message: "Mensaje preparado. Abriendo tu cliente de correo…",
    errors: {},
    mailto,
  }
}
