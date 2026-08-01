"use client";

export default function TypingIndicator({ typingUsers, channel }) {
  if (!typingUsers.length) return null;

  const names = typingUsers
    .map((userId) => {
      const member = channel?.members?.find(
        (m) => (m.userId?._id || m.userId) === userId
      );
      return member?.userId?.username;
    })
    .filter(Boolean);

  const label =
    names.length === 0
      ? "Someone is typing…"
      : names.length === 1
      ? `${names[0]} is typing…`
      : `${names.join(", ")} are typing…`;

  return (
    <div className="flex items-center gap-1.5 px-4 pb-1 text-xs text-gray-400">
      <span className="flex gap-0.5">
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.3s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400 [animation-delay:-0.15s]" />
        <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-gray-400" />
      </span>
      {label}
    </div>
  );
}