// lib/storage.ts
// Compatibilidad + robustez:
// - Exporta tanto `uploadPhoto(file)` como `savePhotoWithBlob(data, file, userId?)`
// - Usa carpeta <uid>/archivo para cumplir RLS en Storage
// - Inserta en public.photos con `user_id` y `url` (image_url) + metadatos opcionales
// - Helpers: loadAllPhotos, loadPhotoById, removePhoto

import { supabase } from "./supabaseClient";

export type SaveData = {
  title?: string;
  description?: string;
  category?: string | null;
  tags?: string[];
};

type DBPhoto = {
  id: string;
  url?: string;          // por compatibilidad si tu tabla tiene `url`
  image_url?: string;    // o si usas `image_url`
  user_id: string;
  title?: string | null;
  description?: string | null;
  category?: string | null;
  tags?: string[] | null;
  created_at?: string;
};

function safeExt(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase() || "jpg";
  return ["jpg", "jpeg", "png", "webp", "gif", "avif", "heic"].includes(ext) ? ext : "jpg";
}

async function requireUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  const uid = data.user?.id;
  if (!uid) throw new Error("Debes iniciar sesión para publicar.");
  return uid;
}

function buildPublicUrl(path: string): string {
  const { data } = supabase.storage.from("photos").getPublicUrl(path);
  if (!data?.publicUrl) throw new Error("No se pudo obtener la URL pública.");
  return data.publicUrl;
}

function pathFromPublicUrl(url: string): string | null {
  const marker = "/storage/v1/object/public/photos/";
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return url.slice(idx + marker.length);
}

// === API NUEVA ===
export async function uploadPhoto(file: File) {
  const uid = await requireUserId();
  const ext = safeExt(file.name);
  const filename = `${crypto.randomUUID()}.${ext}`;
  const path = `${uid}/${filename}`;

  const { error: upErr } = await supabase.storage
    .from("photos")
    .upload(path, file, { upsert: false, contentType: file.type || `image/${ext}`, cacheControl: "3600" });
  if (upErr) throw upErr;

  const publicUrl = buildPublicUrl(path);

  // intenta insertar en cualquiera de los dos esquemas: url o image_url
  const row: Partial<DBPhoto> = { user_id: uid, url: publicUrl, image_url: publicUrl };
  const { error: insErr } = await supabase.from("photos").insert(row);
  if (insErr) throw insErr;

  return { url: publicUrl, path };
}

// === API ANTIGUA (compat) ===
// Si tu UI llama a savePhotoWithBlob(data, file, userId?), seguirá funcionando.
export async function savePhotoWithBlob(data: SaveData, file: Blob, userId?: string) {
  const uid = userId || (await requireUserId());
  const ext = (file as any)?.name?.split(".").pop()?.toLowerCase() || safeExt("photo.jpg");
  const filename = `${crypto.randomUUID()}.${ext}`;
  const path = `${uid}/${filename}`;

  const { error: upErr } = await supabase.storage
    .from("photos")
    .upload(path, file as File, { upsert: false, contentType: (file as any).type || `image/${ext}`, cacheControl: "3600" });
  if (upErr) throw upErr;

  const publicUrl = buildPublicUrl(path);

  const payload: Partial<DBPhoto> = {
    user_id: uid,
    url: publicUrl,
    image_url: publicUrl,
    title: data.title ?? null,
    description: data.description ?? null,
    category: data.category ?? null,
    tags: Array.isArray(data.tags) ? data.tags : null,
  };

  const { error: insErr } = await supabase.from("photos").insert(payload);
  if (insErr) throw insErr;

  return { imageUrl: publicUrl, path };
}

export async function loadAllPhotos(): Promise<DBPhoto[]> {
  const { data, error } = await supabase
    .from("photos")
    .select("id, url, image_url, user_id, title, description, category, tags, created_at")
    .order("created_at", { ascending: false });
  if (error) throw error;
  return (data ?? []).map((p: any) => ({
    ...p,
    image_url: p.image_url ?? p.url, // homogeneiza
    url: p.url ?? p.image_url,
  }));
}

export async function loadPhotoById(id: string): Promise<DBPhoto | null> {
  const { data, error } = await supabase
    .from("photos")
    .select("id, url, image_url, user_id, title, description, category, tags, created_at")
    .eq("id", id)
    .maybeSingle();
  if (error) throw error;
  if (!data) return null;
  return {
    ...data,
    image_url: data.image_url ?? data.url,
    url: data.url ?? data.image_url,
  };
}

export async function removePhoto(photoId: string) {
  const uid = await requireUserId();

  const { data, error } = await supabase
    .from("photos")
    .select("id, url, image_url, user_id")
    .eq("id", photoId)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error("Foto no encontrada.");
  if (data.user_id !== uid) throw new Error("No puedes borrar fotos de otros usuarios.");

  const fileUrl = data.image_url ?? data.url;
  const path = fileUrl ? pathFromPublicUrl(fileUrl) : null;
  if (!path) throw new Error("No se pudo resolver la ruta en el bucket.");

  const { error: sErr } = await supabase.storage.from("photos").remove([path]);
  if (sErr) throw sErr;

  const { error: dErr } = await supabase.from("photos").delete().eq("id", photoId);
  if (dErr) throw dErr;

  return { ok: true };
}
