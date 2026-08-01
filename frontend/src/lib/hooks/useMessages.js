"use client";

import { useQuery } from "@tanstack/react-query";
import { getMessages } from "@/lib/api/messages";

export function useMessages(channelId) {
  return useQuery({
    queryKey: ["messages", channelId, "main"],
    queryFn: () => getMessages(channelId),
    enabled: !!channelId,
  });
}