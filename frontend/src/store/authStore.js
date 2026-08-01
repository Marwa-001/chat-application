"use client";

import { disconnectSocket } from "@/lib/socket";

let listeners = [];
let state = {
  user: null,
  token: null,
  isHydrated: false,
};

function emitChange() {
  listeners.forEach((listener) => listener());
}

export function getAuthState() {
  return state;
}

export function subscribe(listener) {
  listeners.push(listener);
  return () => {
    listeners = listeners.filter((l) => l !== listener);
  };
}

export function hydrateAuth() {
  if (typeof window === "undefined") return;
  try {
    const token = localStorage.getItem("token");
    const userRaw = localStorage.getItem("user");
    state = {
      user: userRaw ? JSON.parse(userRaw) : null,
      token: token || null,
      isHydrated: true,
    };
  } catch {
    state = { user: null, token: null, isHydrated: true };
  }
  emitChange();
}

export function setAuth({ user, token }) {
  localStorage.setItem("token", token);
  localStorage.setItem("user", JSON.stringify(user));
  state = { user, token, isHydrated: true };
  emitChange();
}

export function clearAuth() {
  localStorage.removeItem("token");
  localStorage.removeItem("user");
  state = { user: null, token: null, isHydrated: true };
  disconnectSocket();
  emitChange();
}