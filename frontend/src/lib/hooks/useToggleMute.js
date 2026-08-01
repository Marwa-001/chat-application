"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api/axios";

async function toggleMuteRequest(channelId) {
  const res = await api.post(`/channels/${channelId}/mute`);
  return res.data;
}

export function useToggleMute() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: toggleMuteRequest,
    onSuccess: (updatedChannel) => {
      queryClient.setQueryData(["channels"], (old) => {
        if (!old) return old;
        return old.map((c) => (c._id === updatedChannel._id ? updatedChannel : c));
      });
    },
  });
}