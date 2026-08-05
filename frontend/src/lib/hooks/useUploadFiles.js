"use client";

import { useMutation } from "@tanstack/react-query";
import { uploadFiles } from "@/lib/api/uploads";

export function useUploadFiles() {
  return useMutation({
    mutationFn: uploadFiles,
  });
}