"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import api from "@/lib/api/axios";

async function editMessageRequest({ messageId, content }) {
  const res = await api.patch(`/messages/${messageId}`, { content });
  return res.data;
}

async function deleteMessageRequest(messageId) {
  const res = await api.delete(`/messages/${messageId}`);
  return res.data;
}

async function togglePinRequest(messageId) {
  const res = await api.post(`/messages/${messageId}/pin`);
  return res.data;
}

async function addReactionRequest({ messageId, emoji }) {
  const res = await api.post(`/messages/${messageId}/reactions`, { emoji });
  return res.data;
}

async function removeReactionRequest({ messageId, emoji }) {
  const res = await api.delete(`/messages/${messageId}/reactions`, { data: { emoji } });
  return res.data;
}

export function useEditMessage(channelId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: editMessageRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["messages", channelId] }),
  });
}

export function useDeleteMessage(channelId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteMessageRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["messages", channelId] }),
  });
}

export function useTogglePin(channelId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: togglePinRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["messages", channelId] }),
  });
}

export function useAddReaction(channelId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: addReactionRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["messages", channelId] }),
  });
}

export function useRemoveReaction(channelId) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: removeReactionRequest,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["messages", channelId] }),
  });
}