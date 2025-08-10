// lib/storage.ts
// Adaptador para mantener las firmas antiguas pero usando Supabase Storage + DB.
// Asegúrate de tener NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en el entorno.

import { supabase } from "./supabaseClient";

export type SaveData = {
  title: string;
  description: string;
  category?: string | null;
  tags?: string[];
};

// Sube el archivo al bucket "photos", obtiene URL pública e inserta fila en public.photos
export async function savePhotoWithBlob(data: SaveData, file: Blob) {
  // 1) Usuario actual
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr) throw userErr;
  const user = userData?.user;
  if (!user) throw new Error("Debes iniciar sesión para subir una foto.");

  // 2) Generar ruta segura
  const ext = (file as any)?.type?.split("/")[1] || "jpg";
  const path = `users/${user.id}/${crypto.randomUUID()}.${ext}`;

  // 3) Subir al bucket
  const { error: upErr } = await supabase.storage
    .from("photos")
    .upload(path, file, { contentType: (file as any)?.type || "image/jpeg" });
  if (upErr) throw upErr;

  // 4) Obtener URL pública
  const { data: pub } = supabase.storage.from("photos").getPublicUrl(path);
  const image_url = pub?.publicUrl;
  if (!image_url) throw new Error("No se pudo obtener la URL pública");

  // 5) Insertar en la tabla
  const payload: Record<string, any> = {
    title: data.title,
    description: data.description,
    category: data.category ?? null,
    tags: data.tags ?? [],
    image_url,
    user_id: user.id,
  };

  const { error: insErr } = await supabase.from("photos").insert(payload);
  if (insErr) throw insErr;

  return { imageUrl: image_url };
}

// Cargar todas las fotos públicas (lectura sin login gracias a policy "Public read photos")
export async function loadAllPhotos() {
  const { data, error } = await supabase
    .from("photos")
    .select("*")
    .order("created_at", { ascending: false });
  if (error) throw error;

  return (data || []).map((row: any) => ({
    id: String(row.id),
    title: row.title ?? "",
    description: row.description ?? "",
    imageUrl: row.image_url,
    category: row.category ?? "other",
    tags: Array.isArray(row.tags)
      ? row.tags
      : row.tags
      ? String(row.tags).split(",").map((t) => t.trim())
      : [],
    created_at: row.created_at,
    user_id: row.user_id,
  }));
}

// Actualizar (solo dueño con RLS)
export async function updatePhotoData(id: string, changes: Record<string, any>) {
  const { error } = await supabase.from("photos").update(changes).eq("id", id);
  if (error) throw error;
}

// Borrar (solo dueño con RLS)
export async function deletePhoto(id: string) {
  const { error } = await supabase.from("photos").delete().eq("id", id);
  if (error) throw error;
}
