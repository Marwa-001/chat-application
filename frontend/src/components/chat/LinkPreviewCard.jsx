"use client";

import clsx from "clsx";

export default function LinkPreviewCard({ preview, isOwn }) {
  if (!preview) return null;

  return (
    <a
      href={preview.url}
      target="_blank"
      rel="noopener noreferrer"
      className="mb-1.5 block overflow-hidden rounded-lg bg-transparent"
    >
      {preview.image && (
        <img src={preview.image} alt="" className="h-36 w-full object-cover sm:h-40" />
      )}
      <div className="px-3 py-2">
        {preview.siteName && (
          <p className="text-xs font-medium text-blue-600">{preview.siteName}</p>
        )}
        {preview.title && (
          <p className="line-clamp-2 text-sm font-semibold text-gray-900">{preview.title}</p>
        )}
        {preview.description && (
          <p className="mt-0.5 line-clamp-2 text-xs text-gray-600">{preview.description}</p>
        )}
      </div>
    </a>
  );
}