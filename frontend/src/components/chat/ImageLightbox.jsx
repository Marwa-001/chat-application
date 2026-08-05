"use client";

import { useEffect, useState } from "react";
import { X, Download, ChevronLeft, ChevronRight, Menu, Search } from "lucide-react";
import Avatar from "@/components/ui/Avatar";

function formatOnlineDuration(lastSeen) {
  if (!lastSeen) return "Online";
  const mins = Math.max(1, Math.round((Date.now() - new Date(lastSeen).getTime()) / 60000));
  if (mins < 60) return `Online for ${mins} min${mins === 1 ? "" : "s"}`;
  const hrs = Math.round(mins / 60);
  return `Online for ${hrs} hr${hrs === 1 ? "" : "s"}`;
}

export default function ImageLightbox({ images, startIndex = 0, onClose, sender, subtitle, caption }) {
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
    <div className="fixed inset-0 z-[100] flex flex-col bg-black/40 backdrop-blur-[2px]">
      {/* Header bar - styled like the chat UI, sits above the dimmed content */}
      <div className="flex items-center gap-3 bg-white/95 px-4 py-2.5 shadow-sm">
        <button className="text-gray-600 hover:text-gray-900">
          <Menu className="h-5 w-5" />
        </button>

        <div className="relative hidden max-w-xs flex-1 sm:block">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            disabled
            placeholder="Search"
            className="w-full rounded-full border border-gray-200 bg-gray-50 py-1.5 pl-9 pr-3 text-sm text-gray-500 placeholder:text-gray-400"
          />
        </div>

        <div className="ml-auto flex items-center gap-2">
          {sender && (
            <>
              <Avatar src={sender.avatarUrl} name={sender.username} size="sm" status="online" />
              <div className="min-w-0 text-right sm:text-left">
                <p className="truncate text-sm font-semibold text-gray-900">{sender.username}</p>
                <p className="truncate text-xs text-gray-400">
                  {subtitle || formatOnlineDuration(sender.lastSeen)}
                </p>
              </div>
            </>
          )}

          <div className="group relative ml-1">
            <a
              href={current.url}
              download={current.name}
              target="_blank"
              rel="noopener noreferrer"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-gray-700 shadow ring-1 ring-gray-200 hover:bg-gray-50"
            >
              <Download className="h-4 w-4" />
            </a>
            <span className="pointer-events-none absolute right-1/2 top-full mt-1 translate-x-1/2 whitespace-nowrap rounded bg-gray-900 px-2 py-1 text-[11px] text-white opacity-0 transition-opacity group-hover:opacity-100">
              Download
            </span>
          </div>

          <button
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-white text-gray-700 shadow ring-1 ring-gray-200 hover:bg-gray-50"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Image area */}
      <div className="relative flex flex-1 items-center justify-center overflow-hidden px-4 py-3" onClick={onClose}>
        {images.length > 1 && index > 0 && (
          <button
            onClick={(e) => { e.stopPropagation(); setIndex((i) => i - 1); }}
            className="absolute left-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow hover:bg-white"
          >
            <ChevronLeft className="h-5 w-5" />
          </button>
        )}

        <img
          src={current.url}
          alt={current.name || ""}
          onClick={(e) => e.stopPropagation()}
          className="max-h-full max-w-full rounded-lg object-contain shadow-lg"
        />

        {caption && (
          <div
            onClick={(e) => e.stopPropagation()}
            className="pointer-events-none absolute bottom-6 left-1/2 max-w-[80%] -translate-x-1/2 rounded-full bg-black/60 px-4 py-1.5 text-center text-sm text-white"
          >
            {caption}
          </div>
        )}

        {images.length > 1 && index < images.length - 1 && (
          <button
            onClick={(e) => { e.stopPropagation(); setIndex((i) => i + 1); }}
            className="absolute right-3 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-gray-700 shadow hover:bg-white"
          >
            <ChevronRight className="h-5 w-5" />
          </button>
        )}
      </div>
    </div>
  );
}