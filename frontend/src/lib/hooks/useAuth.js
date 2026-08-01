"use client";

import { useSyncExternalStore } from "react";
import { getAuthState, subscribe } from "@/store/authStore";

const SERVER_SNAPSHOT = { user: null, token: null, isHydrated: false };

function getServerSnapshot() {
  return SERVER_SNAPSHOT;
}

export function useAuth() {
  return useSyncExternalStore(subscribe, getAuthState, getServerSnapshot);
}