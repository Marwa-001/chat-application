"use client";

import { useEffect } from "react";
import { hydrateAuth } from "@/store/authStore";

export function useHydrateAuth() {
  useEffect(() => {
    hydrateAuth();
  }, []);
}