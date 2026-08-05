// Free, no-auth fallback for when the Web API is unavailable (e.g. 403
// "Premium subscription required" on non-Premium-owned apps).
// Gives us title/thumbnail only — no duration, artist breakdown, or tracklist.

const SPOTIFY_REGEX = /open\.spotify\.com\/(track|album|playlist)\//;

function isSpotifyUrl(url) {
  return SPOTIFY_REGEX.test(url);
}

async function fetchSpotifyOEmbed(url) {
  if (!isSpotifyUrl(url)) return null;

  try {
    const res = await fetch(`https://open.spotify.com/oembed?url=${encodeURIComponent(url)}`);
    if (!res.ok) {
      console.error(`SPOTIFY OEMBED: request failed (${res.status}) for ${url}`);
      return null;
    }
    const data = await res.json();

    // oEmbed title is usually "Track Name" or "Track Name - Artist Name"
    // depending on content type; we can't reliably split it further.
    return {
      url,
      contentType: "audio",
      title: data.title || "",
      artist: "",           // not available via oEmbed
      album: "",             // not available via oEmbed
      releaseYear: "",       // not available via oEmbed
      duration: null,        // not available via oEmbed
      image: data.thumbnail_url || "",
      siteName: "Spotify",
      tracks: [],             // no tracklist available via oEmbed
      isPartialData: true,   // NEW flag so the frontend can show a lighter UI
    };
  } catch (err) {
    console.error("SPOTIFY OEMBED: fetch failed:", err.message);
    return null;
  }
}

module.exports = { fetchSpotifyOEmbed };