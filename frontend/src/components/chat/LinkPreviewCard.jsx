"use client";

import clsx from "clsx";

export default function LinkPreviewCard({ preview, isOwn }) {
  if (!preview) return null;

  return (
    <a
      href={preview.url}
      target="_blank"
      rel="noopener noreferrer"
      className={clsx(
        "mt-1.5 block overflow-hidden rounded-lg border",
        isOwn ? "border-blue-400/50 bg-blue-500/20" : "border-gray-200 bg-white"
      )}
    >
      {preview.image && (
        <img src={preview.image} alt="" className="h-36 w-full object-cover sm:h-40" />
      )}
      <div className="px-3 py-2">
        {preview.siteName && (
          <p className={clsx("text-xs font-medium", isOwn ? "text-blue-100" : "text-blue-600")}>
            {preview.siteName}
          </p>
        )}
        {preview.title && (
          <p className={clsx("line-clamp-2 text-sm font-semibold", isOwn ? "text-white" : "text-gray-900")}>
            {preview.title}
          </p>
        )}
        {preview.description && (
          <p className={clsx("mt-0.5 line-clamp-2 text-xs", isOwn ? "text-blue-100" : "text-gray-500")}>
            {preview.description}
          </p>
        )}
      </div>
    </a>
  );
}