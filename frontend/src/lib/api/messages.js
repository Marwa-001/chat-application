import api from "./axios";

export async function getMessages(channelId, { before, parentMessageId } = {}) {
  const res = await api.get(`/messages/${channelId}`, {
    params: { before, parentMessageId },
  });
  return res.data;
}

export async function sendMessage({ channelId, content, parentMessageId, attachments }) {
  const res = await api.post("/messages", {
    channelId,
    content,
    parentMessageId,
    attachments,
  });
  return res.data;
}

export async function editMessage(messageId, content) {
  const res = await api.patch(`/messages/${messageId}`, { content });
  return res.data;
}

export async function deleteMessage(messageId) {
  const res = await api.delete(`/messages/${messageId}`);
  return res.data;
}

export async function getMyMentions({ before } = {}) {
  const res = await api.get("/messages/mentions/me", { params: { before } });
  return res.data;
}