"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { createGroup } from "@/lib/api/channels";

export function useCreateGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createGroup,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["channels"] });
    },
  });
}