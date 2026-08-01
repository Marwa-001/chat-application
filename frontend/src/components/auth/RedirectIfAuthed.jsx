"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { useHydrateAuth } from "@/lib/hooks/useHydrateAuth";

export default function RedirectIfAuthed({ children }) {
  useHydrateAuth();
  const { token, isHydrated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isHydrated && token) {
      router.replace("/");
    }
  }, [isHydrated, token, router]);

  if (isHydrated && token) return null;

  return children;
}