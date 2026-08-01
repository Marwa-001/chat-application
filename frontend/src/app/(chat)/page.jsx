"use client";

import { useState } from "react";
import ChannelList from "@/components/chat/ChannelList";
import ChatWindow from "@/components/chat/ChatWindow";
import EmptyChatState from "@/components/chat/EmptyChatState";
import clsx from "clsx";

export default function ChatPage() {
  const [activeChannelId, setActiveChannelId] = useState(null);
  const [highlightMessageId, setHighlightMessageId] = useState(null);

  const handleSelectChannel = (id) => {
    setActiveChannelId(id);
    setHighlightMessageId(null);
  };

  const handleSelectMention = (mention) => {
    const channelId = mention.channelId?._id || mention.channelId;
    setActiveChannelId(channelId);
    setHighlightMessageId(mention._id);
  };

  const handleBack = () => setActiveChannelId(null);

  return (
    <div className="flex h-[100dvh] w-full overflow-hidden bg-white">
      <div
        className={clsx(
          "w-full flex-col border-r border-gray-200 md:flex md:w-80 lg:w-96",
          activeChannelId ? "hidden md:flex" : "flex"
        )}
      >
        <ChannelList
          activeChannelId={activeChannelId}
          onSelectChannel={handleSelectChannel}
          onSelectMention={handleSelectMention}
        />
      </div>

      <div
        className={clsx(
          "w-full flex-col md:flex md:flex-1",
          activeChannelId ? "flex" : "hidden md:flex"
        )}
      >
        {activeChannelId ? (
          <ChatWindow
            channelId={activeChannelId}
            onBack={handleBack}
            highlightMessageId={highlightMessageId}
            onHighlighted={() => setHighlightMessageId(null)}
          />
        ) : (
          <EmptyChatState message="No chats here yet…" />
        )}
      </div>
    </div>
  );
}