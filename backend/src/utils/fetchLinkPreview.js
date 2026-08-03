const ogs = require("open-graph-scraper");

const URL_REGEX = /(https?:\/\/[^\s]+)/;

module.exports = async function fetchLinkPreview(content = "") {
  const match = content.match(URL_REGEX);
  if (!match) return null;
  const url = match[0];

  try {
    const { result } = await ogs({ url, timeout: 5000 });
    if (!result.success) return null;

    return {
      url,
      title: result.ogTitle || result.twitterTitle || "",
      description: result.ogDescription || result.twitterDescription || "",
      image: result.ogImage?.[0]?.url || result.twitterImage?.[0]?.url || "",
      siteName: result.ogSiteName || new URL(url).hostname.replace("www.", ""),
    };
  } catch (err) {
    console.error("Link preview fetch failed:", err.message);
    return null; // fail silently -> message still sends, just without a card
  }
};