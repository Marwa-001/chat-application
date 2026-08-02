"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getSocket, disconnectSocket } from "@/lib/socket";
import { useAuth } from "./useAuth";

export function useSocket() {
  const { token, isHydrated } = useAuth();
  const queryClient = useQueryClient();

  useEffect(() => {
    if (!isHydrated || !token) return;

    const socket = getSocket();
    if (!socket) return;

    const handleNewMessage = (message) => {
      if (message.parentMessageId) {
        queryClient.setQueryData(
          ["messages", message.channelId, "thread", message.parentMessageId],
          (old) => {
            if (!old) return old;
            if (old.some((m) => m._id === message._id)) return old;
            return [...old, message];
          }
        );
        queryClient.setQueryData(["messages", message.channelId, "main"], (old) => {
          if (!old) return old;
          return old.map((m) =>
            m._id === message.parentMessageId
              ? {
                ...m,
                threadReplyCount: (m.threadReplyCount || 0) + 1,
                threadLastReplyAt: message.createdAt,
              }
              : m
          );
        });
      } else {
        queryClient.setQueryData(["messages", message.channelId, "main"], (old) => {
          if (!old) return old;
          if (old.some((m) => m._id === message._id)) return old;
          return [...old, message];
        });
      }
      queryClient.invalidateQueries({ queryKey: ["channels"] });
    };

    const handleMessageUpdated = (message) => {
      queryClient.setQueriesData({ queryKey: ["messages", message.channelId] }, (old) => {
        if (!old) return old;
        return old.map((m) => (m._id === message._id ? message : m));
      });
    };

    const handleMessageDeleted = ({ messageId }) => {
      queryClient.setQueriesData({ queryKey: ["messages"] }, (old) => {
        if (!old) return old;
        return old.filter((m) => m._id !== messageId);
      });
    };

    // NEW: reactions were never wired up before
    const handleReactionUpdated = ({ messageId, reactions }) => {
      queryClient.setQueriesData({ queryKey: ["messages"] }, (old) => {
        if (!old) return old;
        return old.map((m) => (m._id === messageId ? { ...m, reactions } : m));
      });
    };

    const handlePresenceUpdate = ({ userId, status }) => {
      queryClient.setQueryData(["channels"], (old) => {
        if (!old) return old;
        return old.map((channel) => ({
          ...channel,
          members: channel.members?.map((m) =>
            (m.userId?._id || m.userId) === userId
              ? { ...m, userId: { ...m.userId, status } }
              : m
          ),
        }));
      });
    };

    const handleChannelNew = (channel) => {
      queryClient.setQueryData(["channels"], (old) => {
        if (!old) return [channel];
        if (old.some((c) => c._id === channel._id)) return old;
        return [channel, ...old];
      });
      // join this room immediately so subsequent messages arrive live too
      socket.emit("channel:join", { channelId: channel._id });
    };

    const handleReadUpdated = ({ channelId, userId, lastReadMessageId }) => {
      queryClient.setQueryData(["readReceipts", channelId], (old) => ({
        ...(old || {}),
        [userId]: lastReadMessageId,
      }));
    };

    const handleChannelUpdated = ({ channelId }) => {
      queryClient.invalidateQueries({ queryKey: ["channels"] });
    };

    socket.on("message:new", handleNewMessage);
    socket.on("message:updated", handleMessageUpdated);
    socket.on("message:deleted", handleMessageDeleted);
    socket.on("reaction:updated", handleReactionUpdated);
    socket.on("presence:update", handlePresenceUpdate);
    socket.on("channel:new", handleChannelNew);
    socket.on("channel:updated", handleChannelUpdated);
    socket.on("read:updated", handleReadUpdated);

    return () => {
      socket.off("message:new", handleNewMessage);
      socket.off("message:updated", handleMessageUpdated);
      socket.off("message:deleted", handleMessageDeleted);
      socket.off("reaction:updated", handleReactionUpdated);
      socket.off("presence:update", handlePresenceUpdate);
      socket.off("channel:new", handleChannelNew);
      socket.off("channel:updated", handleChannelUpdated);
      socket.off("read:updated", handleReadUpdated);
    };
  }, [isHydrated, token, queryClient]);
}
