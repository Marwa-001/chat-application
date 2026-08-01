"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createDM } from "@/lib/api/channels";

export function useCreateDM() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createDM,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["channels"] });
    },
  });
}