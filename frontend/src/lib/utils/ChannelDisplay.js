export function getChannelDisplayName(channel, currentUserId) {
  if (!channel) return "Unknown";
  if (channel.type === "group") {
    return channel.name || "Unnamed Group";
  }
  const other = channel.members?.find(
    (m) => (m.userId?._id || m.userId) !== currentUserId
  );
  return other?.userId?.username || "Unknown User";
}

export function getChannelAvatar(channel, currentUserId) {
  if (!channel) return { src: null, name: "?" };
  if (channel.type === "group") {
    return { src: null, name: channel.name || "Group" };
  }
  const other = channel.members?.find(
    (m) => (m.userId?._id || m.userId) !== currentUserId
  );
  return {
    src: other?.userId?.avatarUrl || null,
    name: other?.userId?.username || "?",
    status: other?.userId?.status,
  };
}