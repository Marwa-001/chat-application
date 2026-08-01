"use client";

import { useQuery } from "@tanstack/react-query";
import { getMyChannels } from "@/lib/api/channels";

export function useChannels() {
  return useQuery({
    queryKey: ["channels"],
    queryFn: getMyChannels,
  });
}