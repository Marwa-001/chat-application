"use client";

import { useEffect } from "react";
import { useChannels } from "./useChannels";
import { getSocket } from "@/lib/socket";
import { useAuth } from "./useAuth";

export function useJoinAllChannels() {
  const { data: channels } = useChannels();
  const { token, isHydrated } = useAuth();

  useEffect(() => {
    if (!isHydrated || !token || !channels?.length) return;

    const socket = getSocket();
    if (!socket) return;

    const joinAll = () => {
      channels.forEach((channel) => {
        socket.emit("channel:join", { channelId: channel._id });
      });
    };

    // join immediately if already connected, and again on every (re)connect
    if (socket.connected) joinAll();
    socket.on("connect", joinAll);

    return () => {
      socket.off("connect", joinAll);
    };
  }, [channels, token, isHydrated]);
}