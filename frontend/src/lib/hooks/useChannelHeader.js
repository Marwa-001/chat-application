"use client";

import { useChannels } from "./useChannels";
import { useAuth } from "./useAuth";
import { getChannelDisplayName, getChannelAvatar } from "@/lib/utils/ChannelDisplay";

export function useChannelHeader(channelId) {
  const { data: channels } = useChannels();
  const { user } = useAuth();

  const channel = channels?.find((c) => c._id === channelId);
  if (!channel) return { channel: null, displayName: "", avatar: { src: null, name: "?" } };

  return {
    channel,
    displayName: getChannelDisplayName(channel, user?.id),
    avatar: getChannelAvatar(channel, user?.id),
  };
}