// lib/storage.ts
import { supabase } from "./supabaseClient";

export type SaveData = {
  title: string;
  description: string;
  category?: string | null;
  tags?: string[];
};

/**
 * Sube una foto al bucket `photos`, genera URL pública e inserta fila en la tabla `photos`.
 * Recibe el userId desde el componente (no consulta auth aquí).
 */
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
    user_id: userId,
  };

  const { error: insErr } = await supabase.from("photos").insert(payload);
  if (insErr) throw insErr;

  return { imageUrl: image_url };
}

/**
 * Devuelve todas las fotos (ajusta RLS/policies para lectura pública).
 */
export async function loadAllPhotos() {
  const { data, error } = await supabase
    .from("photos")
    .select("id,title,description,category,tags,image_url,created_at,user_id")
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

/**
 * Carga una sola foto por id.
 */
export async function loadPhotoById(id: string) {
  const { data, error } = await supabase
    .from("photos")
    .select("id,title,description,category,tags,image_url,created_at,user_id")
    .eq("id", id)
    .single();
  if (error) throw error;
  return {
    id: String(data.id),
    title: data.title ?? "",
    description: data.description ?? "",
    imageUrl: data.image_url,
    category: data.category ?? "other",
    tags: Array.isArray(data.tags)
      ? data.tags
      : data.tags
      ? String(data.tags).split(",").map((t) => t.trim())
      : [],
    created_at: data.created_at,
    user_id: data.user_id,
  };
}

/**
 * Borra una foto (requiere RLS que permita borrar al dueño).
 * Exportada con el nombre esperado por tu UI: removePhoto.
 */
export async function removePhoto(id: string) {
  const { error } = await supabase.from("photos").delete().eq("id", id);
  if (error) throw error;
}
