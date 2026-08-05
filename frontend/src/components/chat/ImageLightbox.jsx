"use client";

import { useEffect, useState } from "react";
import { X, Download, ChevronLeft, ChevronRight } from "lucide-react";
import Avatar from "@/components/ui/Avatar";

export default function ImageLightbox({ images, startIndex = 0, onClose, sender, subtitle }) {
  const [index, setIndex] = useState(startIndex);

  useEffect(() => {
    setIndex(startIndex);
  }, [startIndex]);

  useEffect(() => {
    function handleKey(e) {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowRight") setIndex((i) => Math.min(i + 1, images.length - 1));
      if (e.key === "ArrowLeft") setIndex((i) => Math.max(i - 1, 0));
    }
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [images.length, onClose]);

  if (!images?.length) return null;
  const current = images[index];

  return (
    <div className="fixed inset-0 z-[100] flex flex-col bg-black/90">
      {/* Top bar */}
      <div className="flex items-center gap-3 px-4 py-3">
        {sender && (
          <>
            <Avatar src={sender.avatarUrl} name={sender.username} size="sm" />
            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-white">{sender.username}</p>
              {subtitle && <p className="truncate text-xs text-gray-300">{subtitle}</p>}
            </div>
          </>
        )}
        <div className="ml-auto flex items-center gap-2">
          <a
            href={current.url}
            download={current.name}
       m     target="_blank"
            rel="noopener noreferrer"
            title="Download"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <Download className="h-4 w-4" />
          </a>
          <button
            onClick={onClose}
            title="Close"
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Image area */}
      <div
        className="relative flex flex-1 items-center justify-center px-4 pb-4"
        onClick={onClose}
      >
        {images.length > 1 && index > 0 && (
          <button
            onClick={(e) => { e.stopPropagation(); setIndex((i) => i - 1); }}
            className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}

        <img
          src={current.url}
          alt={current.name || ""}
          onClick={(e) => e.stopPropagation()}
          className="max-h-full max-w-full rounded-md object-contain"
        />

        {images.length > 1 && index < images.length - 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); setIndex((i) => i + 1); }}
            className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}