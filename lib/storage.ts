\/\/ lib/storage.ts (patched)
import { supabase } from "./supabaseClient";

export type SaveData = {
  title?: string;
  description?: string;
  category?: string | null;
  tags?: string[];
};

type DBPhoto = {
  id: string;
  url?: string;
  image_url?: string;
  user_id: string | null;
  title?: string | null;
  description?: string | null;
  category?: string | null;
  tags?: string[] | null;
  created_at?: string;
};

const BUCKET = process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET || "blog-images";

function safeExt(name: string): string {
  const ext = name.split(".").pop()?.toLowerCase() || "jpg";
  return ["jpg", "jpeg", "png", "webp", "gif", "avif", "heic"].includes(ext) ? ext : "jpg";
}

// Dev-friendly: no lances si no hay sesión; devuelve null (modo anónimo)
async function getUserIdOrNull(): Promise<string | null> {
  const { data, error } = await supabase.auth.getUser();
  if (error) {
    if ((error as any)?.name === "AuthSessionMissingError" || /Auth session missing/i.test(String(error.message))) {
      return null;
    }
    // Otros errores sí se propagan
    throw error;
  }
  return data.user?.id ?? null;
}

function buildPublicUrl(path: string): string {
  const { data } = supabase.storage.from(BUCKET).getPublicUrl(path);
  if (!data?.publicUrl) throw new Error("No se pudo obtener la URL pública.");
  return data.publicUrl;
}

function pathFromPublicUrl(url: string): string | null {
  const marker = `/storage/v1/object/public/${BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return url.slice(idx + marker.length);
}

// === API NUEVA ===
export async function uploadPhoto(file: File, meta?: SaveData) {
  const uid = await getUserIdOrNull();
  const ext = safeExt(file.name);
  const filename = `${crypto.randomUUID()}.${ext}`;
  const folder = uid || "anon";
  const path = `${folder}/${filename}`;

  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, { upsert: false, contentType: file.type || `image/${ext}`, cacheControl: "3600" });
  if (upErr) throw upErr;

  const publicUrl = buildPublicUrl(path);

  const payload: Partial<DBPhoto> = {
    user_id: uid ?? null,
    url: publicUrl,
    image_url: publicUrl,
    title: meta?.title ?? null,
    description: meta?.description ?? null,
    category: meta?.category ?? null,
    tags: Array.isArray(meta?.tags) ? meta?.tags : null,
  };

  const { error: insErr } = await supabase.from("photos").insert(payload);
  if (insErr) throw insErr;

  return { imageUrl: publicUrl, path };
}

// === API ANTIGUA (compat) ===
export async function savePhotoWithBlob(data: SaveData, file: Blob, userId?: string) {
  // Acepta un userId opcional, pero si no hay, usa el de sesión o "anon"
  const sessionUid = await getUserIdOrNull();
  const uid = userId || sessionUid;
  const ext = (file as any)?.name?.split(".").pop()?.toLowerCase() || safeExt("photo.jpg");
  const filename = `${crypto.randomUUID()}.${ext}`;
  const folder = uid || "anon";
  const path = `${folder}/${filename}`;

  const { error: upErr } = await supabase.storage
    .from(BUCKET)
    .upload(path, file as File, { upsert: false, contentType: (file as any).type || `image/${ext}`, cacheControl: "3600" });
  if (upErr) throw upErr;

  const publicUrl = buildPublicUrl(path);

  const payload: Partial<DBPhoto> = {
    user_id: uid ?? null,
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
    image_url: p.image_url ?? p.url,
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
  // Si no hay sesión, no permitimos borrar (puedes ampliar políticas si quieres)
  const uid = await getUserIdOrNull();
  if (!uid) throw new Error("Debes iniciar sesión para borrar una foto.");

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

  const { error: sErr } = await supabase.storage.from(BUCKET).remove([path]);
  if (sErr) throw sErr;

  const { error: dErr } = await supabase.from("photos").delete().eq("id", photoId);
  if (dErr) throw dErr;

  return { ok: true };
}
