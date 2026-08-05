const ogs = require("open-graph-scraper");
const { fetchSpotifyDetails } = require("./spotify");
const { fetchSpotifyOEmbed } = require("./spotifyOEmbed");

const URL_REGEX = /(https?:\/\/[^\s]+)/g;
const SPOTIFY_REGEX = /open\.spotify\.com\/(track|album|playlist)\//;

function isAudioLink(url) {
  return SPOTIFY_REGEX.test(url);
}

// Try the rich Web API first (needs Premium-owned app); if that fails
// for any reason (403, network error, missing credentials), gracefully
// fall back to the free oEmbed endpoint so we still show *something*.
async function getAudioPreview(url) {
  const rich = await fetchSpotifyDetails(url);
  if (rich) return rich;

  console.warn(`SPOTIFY: falling back to oEmbed for ${url}`);
  return fetchSpotifyOEmbed(url);
}

async function fetchGenericPreview(url) {
  try {
    const { result } = await ogs({ url, timeout: 5000 });
    if (!result.success) return null;

    return {
      url,
      contentType: "generic",
      title: result.ogTitle || result.twitterTitle || "",
      description: result.ogDescription || result.twitterDescription || "",
      image: result.ogImage?.[0]?.url || result.twitterImage?.[0]?.url || "",
      siteName: result.ogSiteName || new URL(url).hostname.replace("www.", ""),
    };
  } catch (err) {
    console.error("Link preview fetch failed:", err.message);
    return null;
  }
}

// Returns an ARRAY of linkPreview objects following these rules:
// - No links -> []
// - All links are audio -> fetch each (rich API, falling back to oEmbed), return them all
//   (frontend renders as a playlist)
// - Mixed or single generic link -> only fetch/return the FIRST link
module.exports = async function fetchLinkPreview(content = "") {
  const matches = [...content.matchAll(URL_REGEX)].map((m) => m[0]);
  if (!matches.length) return [];

  const allAudio = matches.every(isAudioLink);

  if (allAudio && matches.length > 1) {
    const previews = await Promise.all(matches.map(getAudioPreview));
    return previews.filter(Boolean);
  }

  const firstUrl = matches[0];
  const preview = isAudioLink(firstUrl)
    ? await getAudioPreview(firstUrl)
    : await fetchGenericPreview(firstUrl);

  return preview ? [preview] : [];
};