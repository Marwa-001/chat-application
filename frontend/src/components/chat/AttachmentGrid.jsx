"use client";

import clsx from "clsx";

export default function AttachmentGrid({ attachments, onImageClick }) {
  if (!attachments?.length) return null;

  const visible = attachments.slice(0, 4);
  const extraCount = attachments.length - 4;

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
        return (
          <button
            key={att.url}
            type="button"
            onClick={() => onImageClick?.(attachments, i)}
            className={clsx(
              "relative block h-28 w-full overflow-hidden bg-gray-100 sm:h-32",
              visible.length === 1 && "h-48 sm:h-56"
            )}
          >
            <img src={att.url} alt={att.name || ""} className="h-full w-full object-cover" />
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