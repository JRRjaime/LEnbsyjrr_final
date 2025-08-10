// lib/storage.ts
// Utilidades robustas para Supabase Storage + tabla `public.photos`
// - Subida bajo carpeta del usuario: <uid>/<archivo>
// - Inserción en DB con `user_id` y `url` pública
// - Helpers para listar, obtener y borrar
// Nota: Requiere que tus RLS del bucket permitan INSERT en <uid>/...
// y que la tabla `public.photos` permita INSERT con `user_id = auth.uid()`.

import { supabase } from './supabaseClient';

export type PhotoRow = {
  id: string;
  url: string;
  user_id: string;
  title?: string | null;
  description?: string | null;
  created_at?: string;
};

function safeExt(name: string): string {
  const ext = name.split('.').pop()?.toLowerCase() || 'jpg';
  return ['jpg','jpeg','png','webp','gif','avif'].includes(ext) ? ext : 'jpg';
}

async function requireUserId(): Promise<string> {
  const { data, error } = await supabase.auth.getUser();
  if (error) throw error;
  const uid = data.user?.id;
  if (!uid) throw new Error('No hay sesión. Inicia sesión para publicar.');
  return uid;
}

export async function uploadPhoto(file: File) {
  // 1) Asegurar usuario
  const uid = await requireUserId();

  // 2) Construir ruta: PRIMER SEGMENTO = UID (coincide con tus policies)
  const ext = safeExt(file.name);
  const filename = `${crypto.randomUUID()}.${ext}`;
  const path = `${uid}/${filename}`;

  // 3) Subir al bucket "photos"
  const { error: upErr } = await supabase.storage
    .from('photos')
    .upload(path, file, {
      upsert: false,
      contentType: file.type || `image/${ext}`,
      cacheControl: '3600',
    });
  if (upErr) throw upErr;

  // 4) Obtener URL pública
  const { data: pub } = supabase.storage.from('photos').getPublicUrl(path);
  const publicUrl = pub?.publicUrl;
  if (!publicUrl) throw new Error('No se pudo obtener la URL pública.');

  // 5) Insertar fila en DB cumpliendo RLS (user_id = auth.uid())
  const { error: dbErr } = await supabase
    .from('photos')
    .insert([{ user_id: uid, url: publicUrl }]);
  if (dbErr) throw dbErr;

  return { url: publicUrl, path };
}

export async function loadAllPhotos(): Promise<PhotoRow[]> {
  const { data, error } = await supabase
    .from('photos')
    .select('id, url, user_id, title, description, created_at')
    .order('created_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function loadPhotoById(id: string): Promise<PhotoRow | null> {
  const { data, error } = await supabase
    .from('photos')
    .select('id, url, user_id, title, description, created_at')
    .eq('id', id)
    .maybeSingle();
  if (error) throw error;
  return data ?? null;
}

function pathFromPublicUrl(url: string): string | null {
  // Esperado: https://<proj>.supabase.co/storage/v1/object/public/photos/<PATH>
  const marker = '/storage/v1/object/public/photos/';
  const idx = url.indexOf(marker);
  if (idx === -1) return null;
  return url.slice(idx + marker.length);
}

export async function removePhoto(photoId: string) {
  const uid = await requireUserId();

  // Tomar fila para resolver ruta y validar dueño
  const { data, error } = await supabase
    .from('photos')
    .select('id, url, user_id')
    .eq('id', photoId)
    .maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('Foto no encontrada.');
  if (data.user_id !== uid) throw new Error('No puedes borrar fotos de otros usuarios.');

  const path = pathFromPublicUrl(data.url);
  if (!path) throw new Error('No se pudo resolver la ruta del archivo en el bucket.');

  // 1) Borrar del Storage
  const { error: sErr } = await supabase.storage.from('photos').remove([path]);
  if (sErr) throw sErr;

  // 2) Borrar de la DB
  const { error: dErr } = await supabase.from('photos').delete().eq('id', photoId);
  if (dErr) throw dErr;

  return { ok: true };
}
