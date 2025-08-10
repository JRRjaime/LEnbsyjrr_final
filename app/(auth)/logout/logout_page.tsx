// app/(auth)/logout/page.tsx
"use client";

import { useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";

export default function LogoutPage() {
  const router = useRouter();

  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        await supabase.auth.signOut();
      } catch (e) {
        // no-op
      } finally {
        if (alive) router.replace("/login");
      }
    })();
    return () => {
      alive = false;
    };
  }, [router]);

  return <p className="p-8">Cerrando sesión...</p>;
}
