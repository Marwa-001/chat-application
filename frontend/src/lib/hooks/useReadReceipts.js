"use client";

import { useQuery } from "@tanstack/react-query";

export function useReadReceipts(channelId) {
  return useQuery({
    queryKey: ["readReceipts", channelId],
    queryFn: () => ({}), // populated only via socket events; no initial fetch
    enabled: false,
    initialData: {},
    staleTime: Infinity,
  });
}