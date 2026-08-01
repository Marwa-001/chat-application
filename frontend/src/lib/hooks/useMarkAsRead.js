"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { markAsRead } from "@/lib/api/channels";

export function useMarkAsRead() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ channelId, lastReadMessageId }) => markAsRead(channelId, lastReadMessageId),
    onSuccess: (_, { channelId }) => {
      // optimistically zero the unread badge instead of waiting for a refetch
      queryClient.setQueryData(["channels"], (old) => {
        if (!old) return old;
        return old.map((c) => (c._id === channelId ? { ...c, unreadCount: 0 } : c));
      });
    },
  });
}