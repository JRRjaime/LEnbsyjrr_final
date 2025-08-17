// components/lightbox.tsx
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import Image from "next/image";

type LightboxImage = { src: string; alt?: string };

interface LightboxProps {
  open: boolean;
  onClose: () => void;
  images?: LightboxImage[] | null;
  startIndex?: number;
}

export default function Lightbox({ open, onClose, images, startIndex = 0 }: LightboxProps) {
  // Si no está abierto o no hay imágenes, no renderizamos nada
  if (!open || !images || images.length === 0) return null;

  // Asegura índice dentro de rango
  const clampedIndex = Math.max(0, Math.min(startIndex, images.length - 1));
  const [index, setIndex] = useState<number>(clampedIndex);

  useEffect(() => {
    setIndex(clampedIndex);
  }, [clampedIndex, images?.length, open]);

  const prev = useCallback(() => {
    if (!images || images.length === 0) return;
    setIndex((i) => (i - 1 + images.length) % images.length);
  }, [images]);

  const next = useCallback(() => {
    if (!images || images.length === 0) return;
    setIndex((i) => (i + 1) % images.length);
  }, [images]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!open) return;
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") next();
      if (e.key === "ArrowLeft") prev();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose, next, prev]);

  const current = images[index];

  return (
    <div
      className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Visor de imagen"
    >
      <div
        className="relative max-w-5xl w-full h-[70vh]"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          className="absolute top-3 right-3 bg-black/60 text-white px-3 py-1 rounded"
          onClick={onClose}
          aria-label="Cerrar"
        >
          ✕
        </button>

        <button
          className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/50 text-white px-3 py-2 rounded"
          onClick={prev}
          aria-label="Anterior"
        >
          ‹
        </button>
        <button
          className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/50 text-white px-3 py-2 rounded"
          onClick={next}
          aria-label="Siguiente"
        >
          ›
        </button>

        {current?.src ? (
          <Image
            src={current.src}
            alt={current.alt ?? ""}
            fill
            className="object-contain rounded"
            sizes="100vw"
            priority
          />
        ) : null}

        {current?.alt ? (
          <div className="absolute bottom-3 left-0 right-0 text-center text-white/90 text-sm">
            {current.alt}
          </div>
        ) : null}
      </div>
    </div>
  );
}
