import { supabase } from './supabaseClient';

export async function uploadPhoto(file: File, userId: string) {
  if (!userId) {
    throw new Error('No se encontró el ID del usuario. Asegúrate de que la sesión esté activa.');
  }

  const fileExt = file.name.split('.').pop();
  const fileName = `${crypto.randomUUID()}.${fileExt}`;
  const filePath = `users/${userId}/${fileName}`;

  // Subir archivo
  const { error: uploadError } = await supabase.storage
    .from('photos')
    .upload(filePath, file);

  if (uploadError) {
    throw uploadError;
  }

  // Obtener URL pública
  const { data } = supabase.storage.from('photos').getPublicUrl(filePath);

  // Insertar referencia en la tabla
  const { error: insertError } = await supabase.from('photos').insert([
    { user_id: userId, url: data.publicUrl }
  ]);

  if (insertError) {
    throw insertError;
  }

  return data.publicUrl;
}
