import api from "./axios";

export async function getMyChannels() {
  const res = await api.get("/channels");
  return res.data;
}

export async function createDM(otherUserId) {
  const res = await api.post("/channels/dm", { otherUserId });
  return res.data;
}

export async function createGroup({ name, memberIds }) {
  const res = await api.post("/channels/group", { name, memberIds });
  return res.data;
}

export async function markAsRead(channelId, lastReadMessageId) {
  const res = await api.post(`/channels/${channelId}/read`, { lastReadMessageId });
  return res.data;
}