"use client";

import { useInfiniteQuery } from "@tanstack/react-query";
import { getMessages } from "@/lib/api/messages";

export function useMessages(channelId) {
  return useInfiniteQuery({
    queryKey: ["messages", channelId, "main"],
    queryFn: ({ pageParam }) => getMessages(channelId, { before: pageParam }),
    initialPageParam: undefined,
    getNextPageParam: (lastPage) => {
      // lastPage is oldest-first-reversed (see getMessages: .reverse())
      if (lastPage.length < 30) return undefined; // fewer than limit = no more pages
      return lastPage[0]._id; // oldest message id in that page = next "before" cursor
    },
    enabled: !!channelId,
  });
}