"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/hooks/useAuth";
import { useHydrateAuth } from "@/lib/hooks/useHydrateAuth";
import { Loader2 } from "lucide-react";

export default function RequireAuth({ children }) {
  useHydrateAuth();
  const { token, isHydrated } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (isHydrated && !token) {
      router.replace("/login");
    }
  }, [isHydrated, token, router]);

  if (!isHydrated || !token) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
      </div>
    );
  }

  return children;
}