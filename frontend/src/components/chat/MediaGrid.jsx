"use client";

import clsx from "clsx";
import { Play } from "lucide-react";

export default function MediaGrid({ attachments, onImageClick }) {
  if (!attachments?.length) return null;

  const visible = attachments.slice(0, 4);
  const extraCount = attachments.length - 4;

  const imagesOnly = attachments.filter((a) => a.type === "image");

  return (
    <div
      className={clsx(
        "grid gap-0.5 overflow-hidden rounded-lg",
        visible.length === 1 && "grid-cols-1",
        visible.length >= 2 && "grid-cols-2"
      )}
    >
      {visible.map((att, i) => {
        const isLastVisible = i === 3 && extraCount > 0;
        const isVideo = att.type === "video";

        return (
          <button
            key={att.url}
            type="button"
            onClick={() => {
              if (isVideo) return; // videos open inline, not lightbox
              const imgIndex = imagesOnly.findIndex((img) => img.url === att.url);
              onImageClick?.(imagesOnly, imgIndex);
            }}
            className={clsx(
              "relative block h-28 w-full overflow-hidden bg-gray-100 sm:h-32",
              visible.length === 1 && "h-48 sm:h-56"
            )}
          >
            {isVideo ? (
              <video
                src={att.url}
                className="h-full w-full object-cover"
                muted
                playsInline
              />
            ) : (
              <img src={att.url} alt={att.name || ""} className="h-full w-full object-cover" />
            )}

            {isVideo && !isLastVisible && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/80">
                  <Play className="h-5 w-5 fill-gray-900 text-gray-900" />
                </div>
              </div>
            )}

            {isLastVisible && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/40">
                <span className="text-lg font-semibold text-white">+{extraCount}</span>
              </div>
            )}
          </button>
        );
      })}
    </div>
  );
}