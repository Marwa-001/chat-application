"use client";

import clsx from "clsx";
import Avatar from "@/components/ui/Avatar";
import { formatChannelTimestamp } from "@/lib/utils/FormatTime";
import { getChannelDisplayName, getChannelAvatar } from "@/lib/utils/ChannelDisplay";
import { useAuth } from "@/lib/hooks/useAuth";
import { Bell, BellOff } from "lucide-react";
import { useToggleMute } from "@/lib/hooks/useToggleMute";

function highlightMention(text = "") {
  const parts = text.split(/(@\w+)/g);
  return parts.map((part, i) =>
    part.startsWith("@")
      ? <span key={i} className="font-medium text-blue-600">{part}</span>
      : part
  );
}

export default function ChannelListItem({ channel, isActive, onClick }) {
  const { user } = useAuth();
  const currentUserId = user?.id;
  const toggleMute = useToggleMute(); 

  const myMembership = channel.members?.find(m => (m.userId?._id || m.userId) === currentUserId);
const isMuted = myMembership?.muted;

  if (!channel) return null;

  const displayName = getChannelDisplayName(channel, currentUserId);
  const avatar = getChannelAvatar(channel, currentUserId);
  const hasUnread = channel.unreadCount > 0;

  return (
  <div
    role="button"
    tabIndex={0}
    onClick={onClick}
    onKeyDown={(e) => { if (e.key === "Enter") onClick(); }}
    className={clsx(
      "group flex w-full cursor-pointer items-center gap-2 px-3 py-2.5 text-left transition-colors",
       isActive ? "bg-[#DBDDE1]" : "hover:bg-gray-50"
    )}
  >
    <Avatar
      src={avatar.src}
      name={avatar.name}
      status={channel.type === "dm" ? avatar.status : undefined}
    />

    <div className="min-w-0 flex-1">
      <div className="flex items-center justify-between gap-2">
        <p className={clsx("truncate text-sm", hasUnread ? "font-semibold text-gray-900" : "font-medium text-gray-800")}>
          {displayName}
        </p>
        <span className="shrink-0 text-xs text-gray-400">
          {formatChannelTimestamp(channel.lastMessageAt)}
        </span>
      </div>
      <div className="mt-0.5 flex items-center justify-between gap-2">
        <p className="truncate text-xs text-gray-500">
          {channel.lastMessage?.content
            ? highlightMention(channel.lastMessage.content)
            : channel.type === "group"
              ? `Group · ${channel.members?.length ?? 0} members`
              : "Say hi 👋"}
        </p>
        {hasUnread && (
          <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-[#FF3742] px-1.5 text-[11px] font-semibold text-white">
            {channel?.unreadCount}
          </span>
        )}
      </div>
    </div>

    {/* NEW — mute toggle, revealed on row hover */}
    <button
      onClick={(e) => { e.stopPropagation(); toggleMute.mutate(channel._id); }}
      className="ml-1 hidden shrink-0 text-gray-400 hover:text-gray-600 group-hover:block"
      title={isMuted ? "Unmute" : "Mute"}
    >
      {isMuted ? <BellOff className="h-4 w-4" /> : <Bell className="h-4 w-4" />}
    </button>
  </div>

);
}