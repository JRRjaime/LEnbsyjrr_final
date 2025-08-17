import { createClient } from "@/lib/supabase/client"

export interface Video {
  id: string
  title: string
  url: string
  video_type: "youtube" | "vimeo" | "upload"
  thumbnail_url?: string
  created_at: string
}

export async function uploadVideoFile(file: File, title: string): Promise<Video | null> {
  console.log("[v0] Uploading video file:", file.name)
  const supabase = createClient()

  // Generate unique filename
  const fileExt = file.name.split(".").pop()
  const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
  const filePath = `videos/${fileName}`

  const { data, error } = await supabase.storage.from("videos").upload(filePath, file)

  if (error) {
    console.error("[v0] Error uploading video:", error)
    return null
  }

  console.log("[v0] Video file uploaded successfully:", data)

  // Get public URL
  const {
    data: { publicUrl },
  } = supabase.storage.from("videos").getPublicUrl(filePath)

  console.log("[v0] Video public URL:", publicUrl)

  // Save metadata to database
  const { data: videoData, error: dbError } = await supabase
    .from("videos")
    .insert([
      {
        title,
        url: publicUrl,
        video_type: "upload",
        thumbnail_url: "",
      },
    ])
    .select()
    .single()

  if (dbError) {
    console.error("[v0] Error saving video metadata:", dbError)
    return null
  }

  console.log("[v0] Video metadata saved:", videoData)
  return videoData
}

export async function addVideo(title: string, url: string): Promise<Video | null> {
  console.log("[v0] Adding video with URL:", url)
  const supabase = createClient()

  let videoType: "youtube" | "vimeo" | "upload" = "upload"
  let thumbnailUrl = ""

  if (url.includes("youtube.com") || url.includes("youtu.be")) {
    videoType = "youtube"
    const videoId = extractYouTubeId(url)
    if (videoId) {
      thumbnailUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`
    }
  } else if (url.includes("vimeo.com")) {
    videoType = "vimeo"
  }

  const { data, error } = await supabase
    .from("videos")
    .insert([
      {
        title,
        url,
        video_type: videoType,
        thumbnail_url: thumbnailUrl,
      },
    ])
    .select()
    .single()

  if (error) {
    console.error("[v0] Error adding video:", error)
    return null
  }

  console.log("[v0] Video added successfully:", data)
  return data
}

export async function getVideos(): Promise<Video[]> {
  console.log("[v0] Fetching videos from database")
  const supabase = createClient()

  const { data, error } = await supabase.from("videos").select("*").order("created_at", { ascending: false })

  if (error) {
    console.error("[v0] Error fetching videos:", error)
    return []
  }

  console.log("[v0] Videos fetched successfully:", data?.length || 0, "videos")
  return data || []
}

export async function deleteVideo(id: string): Promise<boolean> {
  console.log("[v0] Deleting video with ID:", id)
  const supabase = createClient()

  // First get the video data to check if we need to delete from storage
  const { data: video, error: fetchError } = await supabase.from("videos").select("*").eq("id", id).single()

  if (fetchError) {
    console.error("[v0] Error fetching video for deletion:", fetchError)
    return false
  }

  // Delete from database
  const { error: dbError } = await supabase.from("videos").delete().eq("id", id)

  if (dbError) {
    console.error("[v0] Error deleting video from database:", dbError)
    return false
  }

  // If it's an uploaded file, also delete from storage
  if (video && video.video_type === "upload" && video.url.includes("supabase")) {
    const urlParts = video.url.split("/")
    const fileName = urlParts[urlParts.length - 1]
    const filePath = `videos/${fileName}`

    console.log("[v0] Deleting video file from storage:", filePath)

    const { error: storageError } = await supabase.storage.from("videos").remove([filePath])

    if (storageError) {
      console.error("[v0] Error deleting video file:", storageError)
    } else {
      console.log("[v0] Video file deleted from storage successfully")
    }
  }

  console.log("[v0] Video deleted successfully")
  return true
}

function extractYouTubeId(url: string): string | null {
  const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
  const match = url.match(regExp)
  return match && match[2].length === 11 ? match[2] : null
}
