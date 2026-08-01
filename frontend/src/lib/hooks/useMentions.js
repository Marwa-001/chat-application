"use client";

import { useQuery } from "@tanstack/react-query";
import { getMyMentions } from "@/lib/api/messages";

export function useMentions() {
  return useQuery({
    queryKey: ["mentions"],
    queryFn: () => getMyMentions(),
  });
}