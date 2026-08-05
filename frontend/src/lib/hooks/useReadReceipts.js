// frontend/src/lib/hooks/useReadReceipts.js
import { useQuery } from "@tanstack/react-query";
import { getChannelReads } from "@/lib/api/channels";

export function useReadReceipts(channelId) {
  return useQuery({
    queryKey: ["readReceipts", channelId],
    queryFn: () => getChannelReads(channelId),
    enabled: !!channelId,
    staleTime: Infinity,
  });
}