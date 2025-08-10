// app/(auth)/login/page.tsx
"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const [mode, setMode] = useState<"login" | "signup">("signup");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState(""); 
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();

  // Si ya hay sesión, redirige
  useEffect(() => {
    let mounted = true;

    const checkSession = async () => {
      const { data } = await supabase.auth.getSession();
      if (!mounted) return;
      if (data.session) {
        router.replace("/");
      }
    };

    // Hidrata sesión al entrar
    checkSession();

    // Escucha cambios de auth para hidratar si inicia/cierra sesión
    const { data: sub } = supabase.auth.onAuthStateChange((_event, session) => {
      if (session) router.replace("/");
    });

    return () => {
      mounted = false;
      sub.subscription.unsubscribe();
    };
  }, [router]);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (loading) return;
    setLoading(true);
    setMsg(null);
    try {
      if (mode === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            // Redirección tras confirmar el email
            emailRedirectTo: typeof window !== "undefined" 
              ? `${window.location.origin}/login`
              : undefined,
          },
        });
        if (error) throw error;
        setMsg("Registro enviado. Revisa tu email para confirmar la cuenta.");
      } else {
        const { error } = await supabase.auth.signInWithPassword({ email, password });
        if (error) throw error;
        // Asegurar que la sesión esté cargada antes de redirigir
        await supabase.auth.getSession();
        setMsg("Sesión iniciada ✅");
        router.push("/");
      }
    } catch (err: any) {
      setMsg(err?.message || "Error al autenticar");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <div className="w-full max-w-md rounded-2xl border p-6 shadow-sm bg-white/90">
        <h1 className="text-2xl font-bold mb-4">
          {mode === "signup" ? "Crear cuenta" : "Iniciar sesión"}
        </h1>

        <form onSubmit={onSubmit} className="space-y-3" aria-describedby="auth-description">
          <p id="auth-description" className="sr-only">
            {mode === "signup" 
              ? "Formulario para crear una cuenta con email y contraseña"
              : "Formulario para iniciar sesión con email y contraseña"}
          </p>

          <div>
            <label className="text-sm">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full rounded-lg border px-3 py-2"
              placeholder="tucorreo@ejemplo.com"
              autoComplete="email"
            />
          </div>
          <div>
            <label className="text-sm">Contraseña</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-lg border px-3 py-2"
              placeholder="••••••••"
              autoComplete={mode === "signup" ? "new-password" : "current-password"}
            />
          </div>

          {msg && <p className="text-sm">{msg}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-red-600 text-white py-2 hover:bg-red-700 disabled:opacity-50"
          >
            {loading ? "Procesando..." : mode === "signup" ? "Crear cuenta" : "Entrar"}
          </button>
        </form>

        <div className="mt-4 text-sm">
          {mode === "signup" ? (
            <button className="underline" onClick={() => setMode("login")} aria-describedby="auth-description">
              ¿Ya tienes cuenta? Inicia sesión
            </button>
          ) : (
            <button className="underline" onClick={() => setMode("signup")} aria-describedby="auth-description">
              ¿Nuevo aquí? Crear cuenta
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
