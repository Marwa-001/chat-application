"use client";

import { useEffect } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { getSocket, disconnectSocket } from "@/lib/socket";
import { useAuth } from "./useAuth";

// --- helpers defined OUTSIDE the component/hook ---
function appendToFirstPage(old, message) {
  if (!old?.pages?.length) return old;
  const alreadyExists = old.pages.some((page) => page.some((m) => m._id === message._id));
  if (alreadyExists) return old;

  const pages = [...old.pages];
  pages[0] = [...pages[0], message]; // pages[0] is always the newest-fetched page
  return { ...old, pages };
}

function mapInPages(old, predicate, mapper) {
  if (!old?.pages?.length) return old;
  return {
    ...old,
    pages: old.pages.map((page) => page.map((m) => (predicate(m) ? mapper(m) : m))),
  };
}

function filterInPages(old, predicate) {
  if (!old?.pages?.length) return old;
  return { ...old, pages: old.pages.map((page) => page.filter(predicate)) };
}
// --- end helpers ---

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
          (old) => appendToFirstPage(old, message)
        );
        queryClient.setQueryData(["messages", message.channelId, "main"], (old) =>
          mapInPages(
            old,
            (m) => m._id === message.parentMessageId,
            (m) => ({ ...m, threadReplyCount: (m.threadReplyCount || 0) + 1, threadLastReplyAt: message.createdAt })
          )
        );
      } else {
        queryClient.setQueryData(["messages", message.channelId, "main"], (old) =>
          appendToFirstPage(old, message)
        );
      }
      queryClient.invalidateQueries({ queryKey: ["channels"] });
    };

    const handleMessageUpdated = (message) => {
      queryClient.setQueriesData({ queryKey: ["messages", message.channelId] }, (old) =>
        mapInPages(old, (m) => m._id === message._id, () => message)
      );
    };

    const handleMessageDeleted = ({ messageId }) => {
      queryClient.setQueriesData({ queryKey: ["messages"] }, (old) =>
        filterInPages(old, (m) => m._id !== messageId)
      );
    };

    const handleReactionUpdated = ({ messageId, reactions }) => {
      queryClient.setQueriesData({ queryKey: ["messages"] }, (old) =>
        mapInPages(old, (m) => m._id === messageId, (m) => ({ ...m, reactions }))
      );
    };

    const handleMessageLinkUpdated = ({ messageId, alsoSentToMainId }) => {
      queryClient.setQueriesData({ queryKey: ["messages"] }, (old) =>
        mapInPages(old, (m) => m._id === messageId, (m) => ({ ...m, alsoSentToMainId }))
      );
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
    socket.on("message:link-updated", handleMessageLinkUpdated);

    return () => {
      socket.off("message:new", handleNewMessage);
      socket.off("message:updated", handleMessageUpdated);
      socket.off("message:deleted", handleMessageDeleted);
      socket.off("reaction:updated", handleReactionUpdated);
      socket.off("presence:update", handlePresenceUpdate);
      socket.off("channel:new", handleChannelNew);
      socket.off("channel:updated", handleChannelUpdated);
      socket.off("read:updated", handleReadUpdated);
      socket.off("message:link-updated", handleMessageLinkUpdated);
    };
  }, [isHydrated, token, queryClient]);
}