import { createContext, useContext, useState } from "react";
const PlayerContext = createContext();

export function PlayerProvider({ children }) {
  const YT_API_KEY = import.meta.env.VITE_YT_API_KEY;
  const PLAYLIST_ID = import.meta.env.VITE_YT_PLAYLIST_ID;
  const SPOTIFY_CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
  const SPOTIFY_CLIENT_SECRET = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;

  const [currentVideoId, setCurrentVideoId] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTrack, setCurrentTrack] = useState(null);
  const [playlist, setPlaylist] = useState([]);
  const [trackHistory, setTrackHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);

  function playSong(videoId, trackData = null) {
    setIsPlaying(true);
    setCurrentVideoId(videoId);
    if (trackData) {
      setTrackHistory((prev) => [
        ...prev.slice(0, historyIndex + 1),
        trackData,
      ]);
      setHistoryIndex(historyIndex + 1);

      setCurrentTrack(trackData);
    }
  }

  function playPrev() {
    if (historyIndex > 0) {
      const prevIndex = historyIndex - 1;
      const prevTrack = trackHistory[prevIndex];
      if (prevTrack) {
        setHistoryIndex(prevIndex);
        setCurrentTrack(prevTrack);
        setCurrentVideoId(prevTrack.videoId);
        setIsPlaying(true);
      }
    } else {
      console.log("No previous track.");
    }
  }
  function playNext() {
    if (historyIndex < trackHistory.length - 1) {
      const nextIndex = historyIndex + 1;
      const nextTrack = trackHistory[nextIndex];
      setHistoryIndex(nextIndex);
      setCurrentTrack(nextTrack);
      setCurrentVideoId(nextTrack.videoId);
      setIsPlaying(true);
    } else {
      console.log("No next track.");
    }
  }

  const pauseSong = () => setIsPlaying(false);
  const resumeSong = () => setIsPlaying(true);

  const getSpotifyAccessToken = async () => {
    const SPOTIFY_API_URL = "https://accounts.spotify.com/api/token";

    const headers = {
      "Content-Type": "application/x-www-form-urlencoded",
      Authorization: `Basic ${btoa(
        SPOTIFY_CLIENT_ID + ":" + SPOTIFY_CLIENT_SECRET
      )}`,
    };

    const body = new URLSearchParams({
      grant_type: "client_credentials",
    });

    try {
      const res = await fetch(SPOTIFY_API_URL, {
        method: "POST",
        headers: headers,
        body: body,
      });
      const data = await res.json();
      return data.access_token;
    } catch (error) {
      console.error("Failed to get Spotify access token:", error);
      throw new Error("Unable to fetch Spotify access token.");
    }
  };

  const fetchSpotifyMetadata = async (trackTitle) => {
    const accessToken = await getSpotifyAccessToken();

    const searchUrl = `https://api.spotify.com/v1/search?q=${encodeURIComponent(
      trackTitle
    )}&type=track&limit=1`;

    const res = await fetch(searchUrl, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
    });

    const data = await res.json();

    if (data.tracks.items.length === 0) {
      console.warn("No matching Spotify track found for", trackTitle);
      return null;
    }

    const track = data.tracks.items[0];
    return {
      name: track.name,
      artist: track.artists.map((artist) => artist.name).join(", "),
      albumCover: track.album.images[0]?.url || "",
      duration: track.duration_ms / 1000,
      albumName: track.album.name,
    };
  };

  const handleFetchRandomFromYouTube = async () => {
    try {
      const res = await fetch(
        `https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&maxResults=50&playlistId=${PLAYLIST_ID}&key=${YT_API_KEY}`
      );
      const data = await res.json();

      if (!data.items || data.items.length === 0) {
        alert("No songs found in the playlist.");
        return;
      }
      const randomIndex = Math.floor(Math.random() * data.items.length);
      const randomItem = data.items[randomIndex];

      const videoId = randomItem.snippet.resourceId.videoId;
      const title = randomItem.snippet.title;
      const artist = randomItem.snippet.videoOwnerChannelTitle;
      const albumCover = randomItem.snippet.thumbnails.high.url;
      const spotifyMetadata = await fetchSpotifyMetadata(title);
      const trackData = {
        name: spotifyMetadata?.name || title,
        artist: spotifyMetadata?.artist || artist || "Unknown",
        album: spotifyMetadata?.albumName || "Unknown Album",
        albumCover: spotifyMetadata?.albumCover || albumCover,
        videoId,
        currentTime: 0,
        duration: spotifyMetadata?.duration || 0,
      };
      console.log("Final Track Data:", trackData);
      setCurrentTrack(trackData);
      playSong(videoId);
    } catch (error) {
      console.error("Failed to fetch playlist:", error);
      alert("Error fetching playlist from YouTube.");
    }
  };

  return (
    <PlayerContext.Provider
      value={{
        currentVideoId,
        isPlaying,
        playSong,
        pauseSong,
        resumeSong,
        currentTrack,
        setCurrentTrack,
        handleFetchRandomFromYouTube,
        playPrev,
        playNext,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer() {
  return useContext(PlayerContext);
}
