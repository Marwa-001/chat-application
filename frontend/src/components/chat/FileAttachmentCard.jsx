"use client";

import { Download } from "lucide-react";
import { formatFileSize, getFileStyle } from "@/lib/utils/FileHelpers";

export default function FileAttachmentCard({ attachment }) {
  const { bg, text, label } = getFileStyle(attachment.name);

  return (
    <a
      href={attachment.url}
      target="_blank"
      rel="noopener noreferrer"
      download={attachment.name}
      className="flex items-center gap-3 rounded-lg border border-gray-200 bg-white px-3 py-2.5 hover:bg-gray-50"
    >
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-md text-[10px] font-bold uppercase ${bg} ${text}`}>
        {label}
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-medium text-gray-800">{attachment.name}</p>
        <p className="text-xs text-gray-400">{formatFileSize(attachment.size)}</p>
      </div>
      <Download className="h-4 w-4 shrink-0 text-gray-400" />
    </a>
  );
}