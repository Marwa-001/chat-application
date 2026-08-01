import { ArrowLeft } from "lucide-react";
import Avatar from "@/components/ui/Avatar";

export default function ChatHeader({ displayName, avatar, channelType, onBack }) {
  return (
    <div className="flex items-center gap-2 border-b border-gray-200 px-3 py-3 sm:gap-3 sm:px-4">
      <button
        onClick={onBack}
        className="shrink-0 text-gray-500 hover:text-gray-700 md:hidden"
      >
        <ArrowLeft className="h-5 w-5" />
      </button>

      <Avatar
        src={avatar.src}
        name={avatar.name}
        status={channelType === "dm" ? avatar.status : undefined}
      />

      <div className="min-w-0">
        <p className="truncate text-sm font-semibold text-gray-900">{displayName}</p>
        <p className="truncate text-xs text-gray-400">
          {channelType === "dm" ? (avatar.status === "online" ? "Online" : "Offline") : "Group"}
        </p>
      </div>
    </div>
  );
}