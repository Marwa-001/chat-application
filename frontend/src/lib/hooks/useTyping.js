"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { getSocket } from "@/lib/socket";
import { useAuth } from "./useAuth";

export function useTyping(channelId) {
  const [typingUsers, setTypingUsers] = useState([]);
  const { user } = useAuth();
  const stopTimeoutRef = useRef(null);

  // listen for others typing
  useEffect(() => {
    if (!channelId) return;
    const socket = getSocket();
    if (!socket) return;

    const handleTypingUpdate = ({ userId, channelId: eventChannelId, isTyping }) => {
      if (eventChannelId !== channelId) return;
      if (userId === user?.id) return; // ignore our own echo, if any

      setTypingUsers((prev) => {
        if (isTyping) {
          return prev.includes(userId) ? prev : [...prev, userId];
        }
        return prev.filter((id) => id !== userId);
      });
    };

    socket.on("typing:update", handleTypingUpdate);
    return () => socket.off("typing:update", handleTypingUpdate);
  }, [channelId, user?.id]);

  // reset typing users when channel changes
  useEffect(() => {
    setTypingUsers([]);
  }, [channelId]);

  const emitTyping = useCallback(() => {
    if (!channelId) return;
    const socket = getSocket();
    if (!socket) return;

    socket.emit("typing:start", { channelId });

    if (stopTimeoutRef.current) clearTimeout(stopTimeoutRef.current);
    stopTimeoutRef.current = setTimeout(() => {
      socket.emit("typing:stop", { channelId });
    }, 2000);
  }, [channelId]);

  const emitStopTyping = useCallback(() => {
    if (!channelId) return;
    const socket = getSocket();
    if (!socket) return;
    if (stopTimeoutRef.current) clearTimeout(stopTimeoutRef.current);
    socket.emit("typing:stop", { channelId });
  }, [channelId]);

  useEffect(() => {
    return () => {
      if (stopTimeoutRef.current) clearTimeout(stopTimeoutRef.current);
    };
  }, []);

  return { typingUsers, emitTyping, emitStopTyping };
}