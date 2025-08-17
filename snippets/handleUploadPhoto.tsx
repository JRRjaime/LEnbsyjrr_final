// Reemplaza tu handleUploadPhoto por esta versión (usa Supabase Storage + DB)
import { supabase } from "@/lib/supabase-browser";

const handleUploadPhoto = async () => {
  if (!newPhoto.title || !newPhoto.description || !newPhoto.category || !newPhoto.file) return;

  const tags = newPhoto.tags.split(",").map((t) => t.trim()).filter(Boolean);

  // 1) Subir a Storage
  const ext = newPhoto.file.name.split(".").pop() || "jpg";
  const filename = `${crypto.randomUUID()}.${ext}`;
  const path = `posts/${filename}`;

  const { error: upErr } = await supabase
    .storage
    .from(process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET!)
    .upload(path, newPhoto.file, { cacheControl: "3600", upsert: false, contentType: newPhoto.file.type });

  if (upErr) {
    alert("Error subiendo imagen: " + upErr.message);
    return;
  }

  // 2) URL pública
  const { data: { publicUrl } } = supabase
    .storage
    .from(process.env.NEXT_PUBLIC_SUPABASE_STORAGE_BUCKET!)
    .getPublicUrl(path);

  // 3) Insertar fila en la tabla
  const { data, error: dbErr } = await supabase
    .from(process.env.NEXT_PUBLIC_SUPABASE_PHOTOS_TABLE!)
    .insert({
      title: newPhoto.title,
      description: newPhoto.description,
      category: newPhoto.category,
      tags,
      image_url: publicUrl,
      storage_path: path
    })
    .select("id, title, description, category, tags, image_url, created_at")
    .single();

  if (dbErr) {
    alert("Error guardando en DB: " + dbErr.message);
    return;
  }

  // 4) Refrescar UI local
  setPhotos((prev) => [{
    id: data.id,
    title: data.title,
    description: data.description,
    category: data.category,
    tags: data.tags || [],
    imageUrl: data.image_url,
    likes: 0,
    isLiked: false,
    comments: [],
    timestamp: "ahora",
    reactions: { heart: 0, love: 0, fire: 0, clap: 0 },
    userReaction: undefined
  }, ...prev]);

  // 5) Reset y cerrar modal
  setNewPhoto({ title: "", description: "", category: "", imageUrl: "", tags: "", file: null });
  setIsUploadOpen(false);
};
