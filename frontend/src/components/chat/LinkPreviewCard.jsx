"use client";

import { useState } from "react";
import clsx from "clsx";
import { Play, Pause, SkipBack, SkipForward } from "lucide-react";

export default function LinkPreviewCard({ previews, isOwn }) {
  if (!previews?.length) return null;

  // Multiple audio links -> render as a single playlist block
  if (previews.length > 1 && previews.every((p) => p.contentType === "audio")) {
    return <AudioPlaylistCard previews={previews} />;
  }

  const preview = previews[0];

  if (preview.contentType === "audio") {
    return <AudioPreviewCard preview={preview} />;
  }

  return <GenericPreviewCard preview={preview} />;
}

function GenericPreviewCard({ preview }) {
  return (
    <a
      href={preview.url}
      target="_blank"
      rel="noopener noreferrer"
      className="mb-1.5 block overflow-hidden rounded-lg bg-transparent"
    >
      {preview.image && (
        <img src={preview.image} alt="" className="h-36 w-full object-cover sm:h-40" />
      )}
      <div className="px-3 py-2">
        {preview.siteName && (
          <p className="text-xs font-medium text-blue-600">{preview.siteName}</p>
        )}
        {preview.title && (
          <p className="line-clamp-2 text-sm font-semibold text-gray-900">{preview.title}</p>
        )}
        {preview.description && (
          <p className="mt-0.5 line-clamp-2 text-xs text-gray-600">{preview.description}</p>
        )}
      </div>
    </a>
  );
}

function formatDuration(seconds) {
  if (seconds == null) return "";
  const m = Math.floor(seconds / 60);
  const s = Math.floor(seconds % 60);
  return `${m}:${s.toString().padStart(2, "0")}`;
}

// Single track OR album/playlist with a tracklist
function AudioPreviewCard({ preview }) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTrackIndex, setActiveTrackIndex] = useState(0);
  const hasTracklist = preview.tracks?.length > 0;

  // Partial data from the oEmbed fallback — no duration/tracklist,
  // so render a lightweight card instead of a broken player.
  if (preview.isPartialData) {
    return (
      <a
        href={preview.url}
        target="_blank"
        rel="noopener noreferrer"
        className="mb-1.5 flex items-center gap-3 overflow-hidden rounded-lg bg-white p-3"
      >
        {preview.image && (
          <img src={preview.image} alt="" className="h-14 w-14 shrink-0 rounded object-cover" />
        )}
        <div className="min-w-0">
          <p className="text-xs font-medium text-blue-600">{preview.siteName || "Spotify"}</p>
          <p className="truncate text-sm font-semibold text-gray-900">{preview.title}</p>
          <p className="text-xs text-gray-400">Open in Spotify to play</p>
        </div>
      </a>
    );
  }

  return (
    <div className="mb-1.5 overflow-hidden rounded-lg bg-white">
      {preview.image && !hasTracklist && (
        <img src={preview.image} alt="" className="h-40 w-full object-cover" />
      )}

      <div className="px-3 pt-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPlaying((p) => !p)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-200"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-gray-900" />}
          </button>
          <span className="text-xs text-gray-500">
            {formatDuration(hasTracklist ? preview.tracks[activeTrackIndex]?.duration : preview.duration)}
          </span>
          <div className="h-1 flex-1 rounded-full bg-gray-200">
            <div className="h-1 w-1/4 rounded-full bg-blue-500" />
          </div>
          <SkipBack className="h-3.5 w-3.5 text-gray-400" />
          <SkipForward className="h-3.5 w-3.5 text-gray-400" />
        </div>

        <a href={preview.url} target="_blank" rel="noopener noreferrer" className="mt-2 block">
          <p className="text-xs font-medium text-blue-600">{preview.siteName || "Spotify"}</p>
          <p className="text-sm font-semibold text-gray-900">{preview.album || preview.title}</p>
          {preview.artist && <p className="text-xs text-gray-600">{preview.artist}</p>}
        </a>
      </div>

      {hasTracklist && (
        <div className="mt-2 max-h-64 overflow-y-auto px-3 pb-3">
          {preview.tracks.map((track, i) => (
            <button
              key={i}
              onClick={() => { setActiveTrackIndex(i); setIsPlaying(true); }}
              className={clsx(
                "flex w-full items-center justify-between rounded px-1.5 py-1.5 text-left text-sm hover:bg-gray-50",
                i === activeTrackIndex ? "text-blue-600 font-medium" : "text-gray-800"
              )}
            >
              <span className="flex items-center gap-2 truncate">
                <span className="w-4 shrink-0 text-xs text-gray-400">{track.trackNumber ?? i + 1}</span>
                <span className="truncate">{track.title}</span>
              </span>
              <span className="shrink-0 text-xs text-gray-400">{formatDuration(track.duration)}</span>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

// Multiple single-track links collapsed into one playlist UI
function AudioPlaylistCard({ previews }) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const active = previews[activeIndex];

  return (
    <div className="mb-1.5 overflow-hidden rounded-lg bg-white">
      {active.image && <img src={active.image} alt="" className="h-40 w-full object-cover" />}

      <div className="px-3 pt-3">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsPlaying((p) => !p)}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-gray-200"
          >
            {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4 fill-gray-900" />}
          </button>
          <span className="text-xs text-gray-500">{formatDuration(active.duration)}</span>
          <div className="h-1 flex-1 rounded-full bg-gray-200">
            <div className="h-1 w-1/4 rounded-full bg-blue-500" />
          </div>
        </div>

        <a href={active.url} target="_blank" rel="noopener noreferrer" className="mt-2 block">
          <p className="text-xs font-medium text-blue-600">{active.siteName || "Spotify"}</p>
          <p className="text-sm font-semibold text-gray-900">{active.title}</p>
          {active.artist && <p className="text-xs text-gray-600">{active.artist}</p>}
        </a>
      </div>

      <div className="mt-2 px-3 pb-3">
        {previews.map((p, i) => (
          <button
            key={p.url}
            onClick={() => { setActiveIndex(i); setIsPlaying(true); }}
            className={clsx(
              "flex w-full items-center justify-between rounded px-1.5 py-1.5 text-left text-sm hover:bg-gray-50",
              i === activeIndex ? "text-blue-600 font-medium" : "text-gray-800"
            )}
          >
            <span className="truncate">{p.title}</span>
            <span className="shrink-0 text-xs text-gray-400">
              {p.duration != null ? formatDuration(p.duration) : ""}
            </span>
          </button>
        ))}
      </div>
    </div>
  );
}