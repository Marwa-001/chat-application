"use client";

import { X, FileIcon } from "lucide-react";
import { formatFileSize, getFileStyle } from "@/lib/utils/FileHelpers";

export default function PendingAttachments({ files, onRemove }) {
  if (!files?.length) return null;

  return (
    <div className="flex flex-wrap gap-2 border-b border-gray-100 bg-gray-50 px-3 py-2 sm:px-4">
      {files.map((f, i) => {
        const isImage = f.file.type.startsWith("image/");
        const { bg, text, label } = getFileStyle(f.file.name);
        return (
          <div key={i} className="relative">
            {isImage ? (
              <img
                src={f.previewUrl}
                alt={f.file.name}
                className="h-16 w-16 rounded-lg object-cover"
              />
            ) : (
              <div className="flex h-16 w-40 items-center gap-2 rounded-lg border border-gray-200 bg-white px-2.5">
                <div className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-[9px] font-bold uppercase ${bg} ${text}`}>
                  {label}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-xs font-medium text-gray-700">{f.file.name}</p>
                  <p className="text-[10px] text-gray-400">{formatFileSize(f.file.size)}</p>
                </div>
              </div>
            )}
            <button
              type="button"
              onClick={() => onRemove(i)}
              className="absolute -right-1.5 -top-1.5 flex h-5 w-5 items-center justify-center rounded-full bg-gray-700 text-white hover:bg-gray-900"
            >
              <X className="h-3 w-3" />
            </button>
          </div>
        );
      })}
    </div>
  );
}