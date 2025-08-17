import { supabase } from "./supabase/client"
import type { Photo } from "./supabase/client"

export async function uploadPhoto(file: File, category: string): Promise<Photo | null> {
  try {
    // Generate unique filename
    const fileExt = file.name.split(".").pop()
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
    const filePath = `${category}/${fileName}`

    console.log("[v0] Uploading file:", file.name, "to path:", filePath)

    // Upload file to Supabase Storage
    const { data: uploadData, error: uploadError } = await supabase.storage.from("photos").upload(filePath, file)

    if (uploadError) {
      console.error("[v0] Upload error:", uploadError)
      throw uploadError
    }

    console.log("[v0] File uploaded successfully:", uploadData)

    // Get image dimensions if it's an image
    let width: number | undefined
    let height: number | undefined

    if (file.type.startsWith("image/")) {
      try {
        const dimensions = await getImageDimensions(file)
        width = dimensions.width
        height = dimensions.height
      } catch (error) {
        console.warn("[v0] Could not get image dimensions:", error)
      }
    }

    // Save metadata to database
    const { data: photoData, error: dbError } = await supabase
      .from("photos")
      .insert({
        filename: fileName,
        original_name: file.name,
        category,
        storage_path: filePath,
        file_size: file.size,
        mime_type: file.type,
        width,
        height,
      })
      .select()
      .single()

    if (dbError) {
      console.error("[v0] Database error:", dbError)
      // Clean up uploaded file if database insert fails
      await supabase.storage.from("photos").remove([filePath])
      throw dbError
    }

    console.log("[v0] Photo metadata saved:", photoData)
    return photoData as Photo
  } catch (error) {
    console.error("[v0] Error uploading photo:", error)
    return null
  }
}

export async function getPhotosByCategory(category: string): Promise<Photo[]> {
  try {
    const { data, error } = await supabase
      .from("photos")
      .select("*")
      .eq("category", category)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("[v0] Error fetching photos:", error)
      return []
    }

    return data as Photo[]
  } catch (error) {
    console.error("[v0] Error fetching photos:", error)
    return []
  }
}

export function getPhotoUrl(storagePath: string): string {
  const { data } = supabase.storage.from("photos").getPublicUrl(storagePath)
  return data.publicUrl
}

export async function deletePhoto(photoId: string): Promise<boolean> {
  try {
    // First get the photo to get the storage path
    const { data: photo, error: fetchError } = await supabase
      .from("photos")
      .select("storage_path")
      .eq("id", photoId)
      .single()

    if (fetchError || !photo) {
      console.error("[v0] Error fetching photo for deletion:", fetchError)
      return false
    }

    // Delete from storage
    const { error: storageError } = await supabase.storage.from("photos").remove([photo.storage_path])

    if (storageError) {
      console.error("[v0] Error deleting from storage:", storageError)
    }

    // Delete from database
    const { error: dbError } = await supabase.from("photos").delete().eq("id", photoId)

    if (dbError) {
      console.error("[v0] Error deleting from database:", dbError)
      return false
    }

    console.log("[v0] Photo deleted successfully:", photoId)
    return true
  } catch (error) {
    console.error("[v0] Error deleting photo:", error)
    return false
  }
}

function getImageDimensions(file: File): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => {
      resolve({ width: img.naturalWidth, height: img.naturalHeight })
    }
    img.onerror = reject
    img.src = URL.createObjectURL(file)
  })
}
