"use client";

import clsx from "clsx";
import Avatar from "@/components/ui/Avatar";
import { formatChannelTimestamp } from "@/lib/utils/FormatTime";
import { getChannelDisplayName, getChannelAvatar } from "@/lib/utils/ChannelDisplay";
import { useAuth } from "@/lib/hooks/useAuth";

export default function ChannelListItem({ channel, isActive, onClick }) {
  const { user } = useAuth();
  const currentUserId = user?.id;

  if(!channel) return null;

  const displayName = getChannelDisplayName(channel, currentUserId);
  const avatar = getChannelAvatar(channel, currentUserId);
  const hasUnread = channel.unreadCount > 0;

  return (
    <button
      onClick={onClick}
      className={clsx(
        "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left transition-colors",
        isActive ? "bg-blue-50" : "hover:bg-gray-50"
      )}
    >
      <Avatar
        src={avatar.src}
        name={avatar.name}
        status={channel.type === "dm" ? avatar.status : undefined}
      />

      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p
            className={clsx(
              "truncate text-sm",
              hasUnread ? "font-semibold text-gray-900" : "font-medium text-gray-800"
            )}
          >
            {displayName}
          </p>
          <span className="shrink-0 text-xs text-gray-400">
            {formatChannelTimestamp(channel.lastMessageAt)}
          </span>
        </div>
        <div className="mt-0.5 flex items-center justify-between gap-2">
          <p className="truncate text-xs text-gray-500">
            {channel.type === "group" ? `Group · ${channel.members?.length ?? 0} members` : "Say hi 👋"}
          </p>
          {hasUnread && (
            <span className="flex h-5 min-w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 px-1.5 text-[11px] font-semibold text-white">
              {channel?.unreadCount}
            </span>
          )}
        </div>
      </div>
    </button>
  );
}