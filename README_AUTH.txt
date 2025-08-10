SUPABASE AUTH – PACK RÁPIDO (App Router)

1) Variables de entorno (.env.local):
   NEXT_PUBLIC_SUPABASE_URL=TU_URL_DE_SUPABASE
   NEXT_PUBLIC_SUPABASE_ANON_KEY=TU_ANON_KEY

2) En Supabase → Authentication → URL Configuration:
   - Site URL: https://TU_DOMINIO (o el de Vercel)
   - Redirect URLs: añade también https://TU_DOMINIO

3) Copia los archivos:
   /lib/supabaseClient.ts
   /app/(auth)/login/page.tsx
   /app/(auth)/logout/page.tsx
   /components/AuthButton.tsx

4) En el lugar donde tienes el botón "Únete ahora", importa y usa:
   import AuthButton from "@/components/AuthButton";
   ...
   <AuthButton />

5) Flujo:
   - /login permite registrarse (signUp) e iniciar sesión (signInWithPassword).
   - /logout cierra sesión y redirige al inicio.

6) Opcional: proteger páginas
   - Usa supabase.auth.getUser() en componentes cliente o añade middleware/server actions.
