"use client";

import { useState, useRef } from "react";
import { Search, X, Loader2, ArrowLeft } from "lucide-react";
import { useChannels } from "@/lib/hooks/useChannels";
import { useUserSearch } from "@/lib/hooks/useUserSearch";
import { useCreateDM } from "@/lib/hooks/useCreateDM";
import ChannelListItem from "./ChannelListItem";
import EmptyChatState from "./EmptyChatState";
import Avatar from "@/components/ui/Avatar";
import AppMenu from "./AppMenu";
import NewGroupModal from "./NewGroupModal";
import MentionsView from "./MentionsView";

export default function ChannelList({ activeChannelId, onSelectChannel, onSelectMention }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [showNewGroupModal, setShowNewGroupModal] = useState(false);
  const [mode, setMode] = useState("channels"); // "channels" | "mentions"
  const searchInputRef = useRef(null);

  const { data: channels, isLoading, isError } = useChannels();
  const { data: userResults, isFetching: isSearching } = useUserSearch(searchTerm);
  const createDM = useCreateDM();

  const isSearchMode = searchTerm.trim().length > 0;

  const handleUserClick = (userId) => {
    createDM.mutate(userId, {
      onSuccess: (channel) => {
        setSearchTerm("");
        onSelectChannel(channel._id);
      },
    });
  };

  const handleMentionSelect = (mention) => {
    setMode("channels");
    onSelectMention(mention);
  };

  return (
    <div className="flex h-full flex-col">
      {/* Header */}
      <div className="flex items-center gap-2 border-b border-gray-200 p-2 sm:p-3.5">
        {mode === "mentions" ? (
          <>
            <button
              onClick={() => setMode("channels")}
              className="rounded-lg p-2 text-gray-500 hover:bg-gray-100"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <p className="text-sm font-semibold text-gray-900">Mentions</p>
          </>
        ) : (
          <>
            <AppMenu
              onNewDM={() => searchInputRef.current?.focus()}
              onNewGroup={() => setShowNewGroupModal(true)}
              onMentions={() => setMode("mentions")}
            />
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <input
                ref={searchInputRef}
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search"
                className="w-full rounded-full border border-gray-200 bg-gray-50 py-2.5 pl-9 pr-8 text-sm placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100 sm:py-2"
              />
              {searchTerm && (
                <button
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <X className="h-4 w-4" />
                </button>
              )}
            </div>
          </>
        )}
      </div>

      {/* Body */}
      <div className="flex-1 overflow-y-auto">
        {mode === "mentions" ? (
          <MentionsView onSelect={handleMentionSelect} />
        ) : isSearchMode ? (
          <SearchResults
            results={userResults}
            isSearching={isSearching}
            onUserClick={handleUserClick}
            isCreatingDM={createDM.isPending}
          />
        ) : isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-5 w-5 animate-spin text-gray-300" />
          </div>
        ) : isError ? (
          <p className="px-3 py-8 text-center text-sm text-red-500">
            Couldn&apos;t load channels.
          </p>
        ) : channels?.length ? (
          <div className="space-y-1">
            {channels
              .filter((channel) => channel && channel._id)
              .map((channel) => (
                <ChannelListItem
                  key={channel._id}
                  channel={channel}
                  isActive={channel._id === activeChannelId}
                  onClick={() => onSelectChannel(channel._id)}
                />
              ))}
          </div>
        ) : (
          <EmptyChatState message="You currently have no channels" />
        )}
      </div>

      <NewGroupModal
        isOpen={showNewGroupModal}
        onClose={() => setShowNewGroupModal(false)}
        onCreated={(channel) => onSelectChannel(channel._id)}
      />
    </div>
  );
}

function SearchResults({ results, isSearching, onUserClick, isCreatingDM }) {
  if (isSearching) {
    return (
      <div className="flex justify-center py-8">
        <Loader2 className="h-5 w-5 animate-spin text-gray-300" />
      </div>
    );
  }

  if (!results?.length) {
    return <p className="px-3 py-8 text-center text-sm text-gray-400">No users found</p>;
  }

  return (
    <div className="space-y-1">
      <p className="px-3 py-1 text-xs font-medium text-gray-400">{results.length} results</p>
      {results.map((user) => (
        <button
          key={user._id}
          disabled={isCreatingDM}
          onClick={() => onUserClick(user._id)}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left hover:bg-gray-50 disabled:opacity-50"
        >
          <Avatar src={user.avatarUrl} name={user.username} status={user.status} />
          <p className="text-sm font-medium text-gray-800">{user.username}</p>
        </button>
      ))}
    </div>
  );
}