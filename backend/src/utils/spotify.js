const CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

let cachedToken = null;
let tokenExpiresAt = 0;

async function getAccessToken() {
    if (!CLIENT_ID || !CLIENT_SECRET) {
        console.error("SPOTIFY: missing CLIENT_ID or CLIENT_SECRET env vars");
        return null;
    }
    if (cachedToken && Date.now() < tokenExpiresAt) return cachedToken;

    const res = await fetch("https://accounts.spotify.com/api/token", {
        method: "POST",
        headers: {
            "Content-Type": "application/x-www-form-urlencoded",
            Authorization: "Basic " + Buffer.from(`${CLIENT_ID}:${CLIENT_SECRET}`).toString("base64"),
        },
        body: "grant_type=client_credentials",
    });

    if (!res.ok) {
        const text = await res.text();
        console.error(`SPOTIFY: token request failed (${res.status}):`, text);
        return null;
    }
    const data = await res.json();
    cachedToken = data.access_token;
    tokenExpiresAt = Date.now() + (data.expires_in - 60) * 1000;
    console.log("SPOTIFY: got access token OK");
    return cachedToken;
}

function extractSpotifyIdAndType(url) {
    const match = url.match(/open\.spotify\.com\/(track|album|playlist)\/([a-zA-Z0-9]+)/);
    if (!match) return null;
    return { type: match[1], id: match[2] };
}

async function spotifyFetch(path) {
    const token = await getAccessToken();
    if (!token) return null;

    const res = await fetch(`https://api.spotify.com/v1${path}`, {
        headers: { Authorization: `Bearer ${token}` },
    });

    if (res.status === 403) {
        const text = await res.text();
        if (text.includes("Premium subscription required")) {
            console.warn("SPOTIFY: Premium-gated endpoint, will fall back to oEmbed");
        }
        return null;
    }

    if (!res.ok) {
        const text = await res.text();
        console.error(`SPOTIFY: API call failed (${res.status}) for ${path}:`, text);
        return null;
    }

    return res.json();
}

function msToSeconds(ms) {
    return Math.round(ms / 1000);
}

async function getTrackPreview(id, url) {
    const track = await spotifyFetch(`/tracks/${id}`);
    if (!track) return null;

    return {
        url,
        contentType: "audio",
        title: track.name,
        artist: track.artists?.map((a) => a.name).join(", "),
        album: track.album?.name,
        releaseYear: track.album?.release_date?.slice(0, 4),
        duration: msToSeconds(track.duration_ms),
        image: track.album?.images?.[0]?.url || "",
        siteName: "Spotify",
    };
}

async function getAlbumPreview(id, url) {
    const album = await spotifyFetch(`/albums/${id}`);
    if (!album) return null;

    return {
        url,
        contentType: "audio",
        title: album.name,
        artist: album.artists?.map((a) => a.name).join(", "),
        album: album.name,
        releaseYear: album.release_date?.slice(0, 4),
        image: album.images?.[0]?.url || "",
        siteName: "Spotify",
        tracks: (album.tracks?.items || []).map((t) => ({
            title: t.name,
            artist: t.artists?.map((a) => a.name).join(", "),
            duration: msToSeconds(t.duration_ms),
            trackNumber: t.track_number,
        })),
    };
}

async function getPlaylistPreview(id, url) {
    const playlist = await spotifyFetch(`/playlists/${id}?fields=name,images,owner,tracks.items(track(name,artists,duration_ms,track_number))`);
    if (!playlist) return null;

    return {
        url,
        contentType: "audio",
        title: playlist.name,
        artist: playlist.owner?.display_name || "",
        image: playlist.images?.[0]?.url || "",
        siteName: "Spotify",
        tracks: (playlist.tracks?.items || [])
            .filter((item) => item.track)
            .map((item, i) => ({
                title: item.track.name,
                artist: item.track.artists?.map((a) => a.name).join(", "),
                duration: msToSeconds(item.track.duration_ms),
                trackNumber: i + 1,
            })),
    };
}

// Main entry point: given a Spotify URL, return a full preview object or null
async function fetchSpotifyDetails(url) {
    const parsed = extractSpotifyIdAndType(url);
    console.log("SPOTIFY: parsed URL ->", parsed);
    if (!parsed) return null;

    try {
        if (parsed.type === "track") return await getTrackPreview(parsed.id, url);
        if (parsed.type === "album") return await getAlbumPreview(parsed.id, url);
        if (parsed.type === "playlist") return await getPlaylistPreview(parsed.id, url);
    } catch (err) {
        console.error("SPOTIFY: fetch failed:", err.message);
    }
    return null;
}

module.exports = { fetchSpotifyDetails };