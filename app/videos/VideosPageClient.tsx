"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Container } from "@/components/container"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Plus, Youtube, Play, Trash2, ExternalLink, Upload, Link } from "lucide-react"
import { addVideo, getVideos, deleteVideo, uploadVideoFile, type Video } from "@/lib/video-upload"

export default function VideosPageClient() {
  const [videos, setVideos] = useState<Video[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [title, setTitle] = useState("")
  const [url, setUrl] = useState("")
  const [uploadMode, setUploadMode] = useState<"url" | "file">("url")
  const [selectedFile, setSelectedFile] = useState<File | null>(null)

  useEffect(() => {
    loadVideos()
  }, [])

  const loadVideos = async () => {
    const fetchedVideos = await getVideos()
    setVideos(fetchedVideos)
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      if (!title.trim()) {
        setTitle(file.name.replace(/\.[^/.]+$/, ""))
      }
    }
  }

  const handleAddVideo = async () => {
    if (uploadMode === "url" && !url.trim()) return
    if (uploadMode === "file" && !selectedFile) return

    setIsLoading(true)
    const videoTitle = title.trim() || "Video sin título"

    let newVideo: Video | null = null

    if (uploadMode === "file" && selectedFile) {
      newVideo = await uploadVideoFile(selectedFile, videoTitle)
    } else if (uploadMode === "url" && url.trim()) {
      newVideo = await addVideo(videoTitle, url.trim())
    }

    if (newVideo) {
      setVideos((prev) => [newVideo, ...prev])
      setTitle("")
      setUrl("")
      setSelectedFile(null)
      const fileInput = document.getElementById("video-file") as HTMLInputElement
      if (fileInput) fileInput.value = ""
    }
    setIsLoading(false)
  }

  const handleDeleteVideo = async (id: string) => {
    if (confirm("¿Estás seguro de que quieres eliminar este video?")) {
      const success = await deleteVideo(id)
      if (success) {
        setVideos((prev) => prev.filter((v) => v.id !== id))
      }
    }
  }

  const getEmbedUrl = (video: Video) => {
    if (video.video_type === "upload") {
      return video.url
    }
    if (video.video_type === "youtube") {
      const videoId = extractYouTubeId(video.url)
      return videoId ? `https://www.youtube.com/embed/${videoId}` : video.url
    } else if (video.video_type === "vimeo") {
      const videoId = video.url.split("/").pop()
      return `https://player.vimeo.com/video/${videoId}`
    }
    return video.url
  }

  const extractYouTubeId = (url: string): string | null => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/
    const match = url.match(regExp)
    return match && match[2].length === 11 ? match[2] : null
  }

  return (
    <div className="min-h-screen bg-black text-white pt-24 pb-16">
      <Container>
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2 text-white">Mis Videos</h1>
            <p className="text-gray-400">Agrega enlaces de YouTube, Vimeo o sube videos desde tu ordenador</p>
          </div>
          <Button
            size="sm"
            className="bg-gray-800 hover:bg-gray-700 text-white border-gray-700"
            onClick={() => document.getElementById("video-form")?.scrollIntoView({ behavior: "smooth" })}
          >
            <Plus className="w-4 h-4 mr-2" />
            Subir
          </Button>
        </div>

        {videos.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {videos.map((video) => (
              <Card key={video.id} className="bg-gray-900 border-gray-800 overflow-hidden group">
                <div className="aspect-video bg-gray-800 relative">
                  {video.video_type === "upload" ? (
                    <video src={video.url} className="w-full h-full object-cover" controls preload="metadata" />
                  ) : video.video_type === "youtube" || video.video_type === "vimeo" ? (
                    <iframe
                      src={getEmbedUrl(video)}
                      className="w-full h-full"
                      frameBorder="0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <Play className="w-12 h-12 text-gray-500" />
                    </div>
                  )}
                  <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => handleDeleteVideo(video.id)}
                      className="bg-red-600 hover:bg-red-700"
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
                <div className="p-4">
                  <h3 className="font-semibold text-white mb-2 line-clamp-2">{video.title}</h3>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-400 capitalize">
                      {video.video_type === "upload" ? "archivo" : video.video_type}
                    </span>
                    {video.video_type !== "upload" && (
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => window.open(video.url, "_blank")}
                        className="text-gray-400 hover:text-white"
                      >
                        <ExternalLink className="w-3 h-3" />
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <Play className="w-16 h-16 mx-auto mb-4 text-gray-600" />
            <h3 className="text-xl font-semibold mb-2 text-white">Aún no hay videos</h3>
            <p className="text-gray-400 max-w-md mx-auto">
              Agrega enlaces de YouTube, Vimeo o sube videos desde tu ordenador.
            </p>
          </div>
        )}

        <Card id="video-form" className="p-4 bg-gray-900 border-gray-800">
          <div className="space-y-4">
            <div className="flex gap-2">
              <Button
                variant={uploadMode === "url" ? "default" : "outline"}
                size="sm"
                onClick={() => setUploadMode("url")}
                className={
                  uploadMode === "url"
                    ? "bg-gray-700 text-white"
                    : "bg-transparent border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800"
                }
              >
                <Link className="w-4 h-4 mr-2" />
                URL
              </Button>
              <Button
                variant={uploadMode === "file" ? "default" : "outline"}
                size="sm"
                onClick={() => setUploadMode("file")}
                className={
                  uploadMode === "file"
                    ? "bg-gray-700 text-white"
                    : "bg-transparent border-gray-700 text-gray-400 hover:text-white hover:bg-gray-800"
                }
              >
                <Upload className="w-4 h-4 mr-2" />
                Archivo
              </Button>
            </div>

            {uploadMode === "url" ? (
              <div>
                <Input
                  placeholder="https://youtube.com/watch?v=... o https://vimeo.com/..."
                  className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                  value={url}
                  onChange={(e) => setUrl(e.target.value)}
                />
              </div>
            ) : (
              <div>
                <input
                  id="video-file"
                  type="file"
                  accept="video/*"
                  onChange={handleFileSelect}
                  className="block w-full text-sm text-gray-400 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-gray-800 file:text-white hover:file:bg-gray-700 bg-gray-800 border border-gray-700 rounded-md"
                />
                {selectedFile && (
                  <p className="text-xs text-gray-400 mt-1">Archivo seleccionado: {selectedFile.name}</p>
                )}
              </div>
            )}

            <div>
              <Input
                placeholder="Título del video (opcional)"
                className="bg-gray-800 border-gray-700 text-white placeholder:text-gray-500"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            <Button
              onClick={handleAddVideo}
              disabled={isLoading || (uploadMode === "url" && !url.trim()) || (uploadMode === "file" && !selectedFile)}
              className="w-full bg-gray-800 hover:bg-gray-700 text-white"
            >
              {uploadMode === "file" ? <Upload className="w-4 h-4 mr-2" /> : <Youtube className="w-4 h-4 mr-2" />}
              {isLoading ? "Subiendo..." : uploadMode === "file" ? "Subir Video" : "Agregar Video"}
            </Button>
          </div>
        </Card>
      </Container>
    </div>
  )
}
