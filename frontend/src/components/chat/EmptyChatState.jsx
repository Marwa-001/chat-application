import { MessageSquare } from "lucide-react";

export default function EmptyChatState({ message = "No chats here yet…" }) {
  return (
    <div className="flex h-full w-full flex-col items-center justify-center gap-3 px-4 text-gray-400">
      <MessageSquare className="h-8 w-8 sm:h-10 sm:w-10" strokeWidth={1.5} />
      <p className="text-center text-sm">{message}</p>
    </div>
  );
}