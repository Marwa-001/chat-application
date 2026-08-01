"use client";

import { useQuery } from "@tanstack/react-query";
import { getMessages } from "@/lib/api/messages";

export function useThreadMessages(channelId, parentMessageId) {
  return useQuery({
    queryKey: ["messages", channelId, "thread", parentMessageId],
    queryFn: () => getMessages(channelId, { parentMessageId }),
    enabled: !!channelId && !!parentMessageId,
  });
}