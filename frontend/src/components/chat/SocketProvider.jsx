"use client";

import { useSocket } from "@/lib/hooks/useSocket";
import { useJoinAllChannels } from "@/lib/hooks/useJoinAllChannels";

export default function SocketProvider({ children }) {
  useSocket();
  useJoinAllChannels();
  return children;
}