
// lib/storage.ts
import { supabase } from "./supabaseClient";

export type SaveData = {
  title: string;
  description: string;
  category?: string | null;
  tags?: string[];
};

// Recibe userId desde el componente; aquí no se consulta auth.
export async function savePhotoWithBlob(data: SaveData, file: Blob, userId: string) {
  const ext = (file as any)?.type?.split("/")[1] || "jpg";
  const path = `users/${userId}/${crypto.randomUUID()}.${ext}`;

  const { error: upErr } = await supabase.storage
    .from("photos")
    .upload(path, file, { contentType: (file as any)?.type || "image/jpeg" });
  if (upErr) throw upErr;

  const { data: pub } = supabase.storage.from("photos").getPublicUrl(path);
  const image_url = pub?.publicUrl;
  if (!image_url) throw new Error("No se pudo obtener la URL pública");

  const payload: Record<string, any> = {
    title: data.title,
    description: data.description,
    category: data.category ?? null,
    tags: data.tags ?? [],
    image_url,
    user_id: userId, // 👈 viene del componente
  };

  const { error: insErr } = await supabase.from("photos").insert(payload);
  if (insErr) throw insErr;

  return { imageUrl: image_url };
}
