"use client";

import { AtSign, Loader2 } from "lucide-react";
import { useMentions } from "@/lib/hooks/useMentions";
import Avatar from "@/components/ui/Avatar";
import { formatChannelTimestamp } from "@/lib/utils/FormatTime";

function highlightMention(text = "") {
  const parts = text.split(/(@\w+)/g);
  return parts.map((part, i) =>
    part.startsWith("@")
      ? <span key={i} className="font-medium text-gray-900">{part}</span>
      : part
  );
}

export default function MentionsView({ onSelect }) {
  const { data: mentions, isLoading, isError } = useMentions();

  if (isLoading) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-gray-300" />
      </div>
    );
  }

  if (isError) {
    return <p className="px-3 py-8 text-center text-sm text-red-500">Couldn&apos;t load mentions.</p>;
  }

  if (!mentions?.length) {
    return (
      <div className="flex flex-col items-center gap-2 py-10 text-gray-400">
        <AtSign className="h-8 w-8" strokeWidth={1.5} />
        <p className="text-sm">No mentions yet</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {mentions.map((m) => (
        <button
          key={m._id}
          onClick={() => onSelect(m)}
          className="flex w-full items-start gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-gray-50"
        >
          <Avatar src={m.senderId?.avatarUrl} name={m.senderId?.username} size="sm" />
          <div className="min-w-0 flex-1">
            <div className="flex items-center justify-between gap-2">
              <p className="truncate text-sm font-medium text-gray-800">
                {m.senderId?.username}
                <span className="ml-1.5 font-normal text-gray-400">
                  in {m.channelId?.type === "group" ? m.channelId?.name : "Direct Message"}
                </span>
              </p>
            </div>
            <p className="truncate text-xs text-gray-500">{highlightMention(m.content)}</p>
          </div>

          <div className="flex shrink-0 flex-col items-end gap-1">
            {!m.isRead && (
              <span className="flex h-4 min-w-4 items-center justify-center rounded-full bg-[#FF3742] px-1 text-[10px] font-semibold text-white">
                1
              </span>
            )}
            <span className="text-xs text-gray-400">
              {formatChannelTimestamp(m.createdAt)}
            </span>
          </div>
        </button>
      ))}
    </div>
  );
}