// app/photos/[id]/PhotoPageClient.tsx
"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Heart, MessageCircle } from "lucide-react";
import ShareButtons from "@/components/share-buttons";
import CommentTicker from "@/components/comment-ticker";
import ReactionBar from "@/components/reaction-bar";

type DBPhoto = {
  id: string;
  title: string;
  description: string | null;
  category: string | null;
  image_url: string;
  likes: number;
  is_liked?: boolean;
  reactions?: Record<string, number>;
  user_reaction?: string | null;
  comments?: { id: string; text: string }[];
};

export default function PhotoPageClient({ id }: { id: string }) {
  const [photo, setPhoto] = useState<DBPhoto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let alive = true;
    (async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from("photos")
        .select("*")
        .eq("id", id)
        .single();

      if (!alive) return;

      if (!error && data) {
        const normalized: DBPhoto = {
          id: data.id,
          title: data.title ?? "Sin título",
          description: data.description ?? "",
          category: data.category ?? "General",
          image_url: data.image_url,
          likes: data.likes ?? 0,
          is_liked: data.is_liked ?? false,
          reactions: data.reactions ?? {},
          user_reaction: data.user_reaction ?? null,
          comments: data.comments ?? [],
        };
        setPhoto(normalized);
      } else {
        setPhoto(null);
      }
      setLoading(false);
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  if (loading) {
    return <main className="min-h-screen p-8">Cargando…</main>;
  }
  if (!photo) {
    return (
      <main className="min-h-screen p-8">
        <div className="max-w-2xl mx-auto text-center p-8 bg-white rounded-xl shadow">
          <p className="text-lg">No he encontrado esta foto.</p>
          <Button className="mt-4" onClick={() => (window.location.href = "/")}>
            Volver al inicio
          </Button>
        </div>
      </main>
    );
  }

  const handleToggleLike = async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      setPhoto((p) =>
        p
          ? { ...p, likes: p.is_liked ? p.likes - 1 : p.likes + 1, is_liked: !p.is_liked }
          : p
      );
      return;
    }

    const next = {
      likes: photo.is_liked ? photo.likes - 1 : photo.likes + 1,
      is_liked: !photo.is_liked,
    };
    setPhoto({ ...photo, ...next });

    const { error } = await supabase
      .from("photos")
      .update(next)
      .eq("id", photo.id);

    if (error) {
      setPhoto(photo);
      console.error(error);
    }
  };

  const handleReactionChange = async (reactions: Record<string, number>, key?: string) => {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) {
      setPhoto({ ...photo, reactions, user_reaction: key ?? null });
      return;
    }
    setPhoto({ ...photo, reactions, user_reaction: key ?? null });
    const { error } = await supabase
      .from("photos")
      .update({ reactions, user_reaction: key ?? null })
      .eq("id", photo.id);
    if (error) console.error(error);
  };

  return (
    <main className="min-h-screen bg-slate-50">
      <div className="relative w-full h-[52vh] md:h-[68vh] bg-black">
        <Image
          src={photo.image_url || "/placeholder.svg"}
          alt={photo.title}
          fill
          sizes="100vw"
          style={{ objectFit: "cover" }}
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent" />
        <div className="absolute bottom-6 left-6 right-6 md:left-10 md:right-10 text-white">
          <div className="flex items-center gap-3 mb-3">
            <Badge className="bg-white/20 text-white border-white/30">
              #{photo.category}
            </Badge>
          </div>
          <h1 className="text-3xl md:text-5xl font-bold">{photo.title}</h1>
          <p className="mt-2 max-w-3xl text-white/90">{photo.description}</p>
          <div className="mt-4 max-w-2xl">
            <CommentTicker comments={photo.comments ?? []} />
          </div>
        </div>
      </div>

      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            className="text-rose-600 hover:bg-rose-50"
            onClick={handleToggleLike}
          >
            <Heart className="h-5 w-5 mr-2" />
            {photo.likes}
          </Button>

          <Button variant="ghost" className="text-blue-600 hover:bg-blue-50">
            <MessageCircle className="h-5 w-5 mr-2" />
            {(photo.comments ?? []).length}
          </Button>

          <ShareButtons
            title={photo.title}
            shareUrl={`${typeof window !== "undefined" ? window.location.origin : ""}/photos/${photo.id}`}
            className="ml-1"
          />

          <div className="ml-auto">
            <ReactionBar
              initialReactions={photo.reactions ?? {}}
              initialUserReaction={photo.user_reaction ?? undefined}
              onChange={handleReactionChange}
            />
          </div>
        </div>

        <div className="mt-6">
          <Image
            src={photo.image_url || "/placeholder.svg"}
            alt={photo.title}
            width={1600}
            height={1200}
            sizes="(max-width: 1024px) 100vw, 960px"
            className="w-full h-auto rounded-xl shadow-lg"
          />
        </div>
      </section>
    </main>
  );
}
