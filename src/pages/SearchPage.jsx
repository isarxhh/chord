import { useState, useEffect } from "react";
import { MagnifyingGlassIcon } from "@heroicons/react/24/outline";
import axios from "axios";
import { useNavigate } from "react-router-dom";
import { usePlayer } from "../context/PlayerContext";
import AddToPlaylistButton from "../components/AddToPlaylistButton";
import Toast from "../utils/Toast";
import { useQueue } from "../context/QueueContext";

function filterDuplicatesByAudio(tracks) {
  const map = new Map();

  tracks.forEach((track) => {
    const key = `${track.name}-${track.artist}`;
    const hasValidAudio = track.url && track.url.trim() !== "";

    if (!map.has(key)) {
      map.set(key, track);
    } else {
      const existingTrack = map.get(key);
      const existingHasValidAudio =
        existingTrack.url && existingTrack.url.trim() !== "";
      if (!existingHasValidAudio && hasValidAudio) {
        map.set(key, track);
      }
    }
  });

  return Array.from(map.values());
}

const SearchPage = () => {
  const navigate = useNavigate();
  const { setCurrentTrack, playSong } = usePlayer();
  const { addToQueue } = useQueue();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [debounceTimeout, setDebounceTimeout] = useState(null);
  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "success",
  });

  const handleAddToQueue = async (track) => {
    try {
      const ytResponse = await axios.get(
        "http://localhost:5000/api/youtube/search",
        {
          params: { query: `${track.name} ${track.artist}` },
        }
      );
      const videoId = ytResponse.data.videoId;

      if (!videoId) {
        setToast({
          show: true,
          message: `No video found for "${track.name}". Added without playback.`,
          type: "warning",
        });
        addToQueue(track);
        return;
      }

      const fullTrack = { ...track, videoId };
      addToQueue(fullTrack);
      setToast({
        show: true,
        message: `"${track.name}" added to queue!`,
        type: "success",
      });
    } catch (error) {
      console.error("Error fetching YouTube video for queue:", error);
      setToast({
        show: true,
        message: `Failed to add "${track.name}" to queue.`,
        type: "error",
      });
    }
  };

  const formatDuration = (durationMs) => {
    const minutes = Math.floor(durationMs / 60000);
    const seconds = ((durationMs % 60000) / 1000).toFixed(0);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  const fetchDefaultTracks = async (track) => {
    setLoading(true);
    try {
      const response = await axios.get(
        "http://localhost:5000/api/spotify/playlist-tracks"
      );
      const defaultTracks = response.data.tracks;

      let formattedTracks = defaultTracks.map((track) => ({
        name: track.name,
        artist: track.artists.join(", "),
        albumName: track.album.name,
        albumCover: track.album.image,
        duration: "",
        url: track.spotify_url,
      }));

      formattedTracks = filterDuplicatesByAudio(formattedTracks);
      setResults(formattedTracks);
    } catch (error) {
      console.error("Error fetching default playlist tracks:", error);
    } finally {
      setLoading(false);
    }
  };
  const handleSearch = async () => {
    if (!query) {
      fetchDefaultTracks();
      return;
    }
    setLoading(true);
    try {
      const response = await axios.get(
        "http://localhost:5000/api/spotify/search",
        {
          params: { query },
        }
      );

      const trackItems = response.data.tracks.items;

      let formattedTracks = trackItems.map((track) => ({
        name: track.name,
        artist: track.artists.map((artist) => artist.name).join(", "),
        albumName: track.album.name,
        albumCover: track.album.images[0]?.url,
        duration: formatDuration(track.duration_ms),
        url: track.external_urls.spotify,
      }));

      formattedTracks = filterDuplicatesByAudio(formattedTracks);

      setResults(formattedTracks);
    } catch (error) {
      console.error("Error searching for track:", error);
      setResults([]);
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    if (debounceTimeout) clearTimeout(debounceTimeout);
    const timeout = setTimeout(() => {
      handleSearch();
    }, 500);
    setDebounceTimeout(timeout);
    return () => clearTimeout(timeout);
  }, [query]);

  const handleSongClick = async (track) => {
    try {
      const ytResponse = await axios.get(
        "http://localhost:5000/api/youtube/search",
        {
          params: { query: `${track.name} ${track.artist}` },
        }
      );

      console.log("YouTube search result:", ytResponse.data);
      const videoId = ytResponse.data.videoId;
      if (!videoId) {
        if (track.previewUrl) {
          setCurrentTrack({
            ...track,
            videoId: null,
          });
          navigate("/player");
        } else {
          alert("No video or preview found for this track.");
        }
        return;
      }

      const fullTrack = {
        ...track,
        videoId,
      };
      setCurrentTrack(fullTrack);
      playSong(videoId);
      navigate("/player");
    } catch (error) {
      console.error("Error fetching YouTube video:", error);
    }
  };

  return (
    <div className="bg-[#1a1a2b] overflow-x-hidden min-h-screen text-white p-6">
      <form
        onSubmit={(e) => e.preventDefault()}
        className="flex items-center bg-[#2a2a3b] rounded-full px-4 py-2 mb-6"
      >
        <MagnifyingGlassIcon className="w-6 h-6 text-gray-400" />
        <input
          type="text"
          placeholder="Search for songs, artists, albums..."
          className="w-full outline-none border-none focus:ring-0 bg-transparent text-white pl-2"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
        <button type="submit" className="ml-2 text-green-400 hover:text-white">
          Go
        </button>
      </form>

      {loading && <p className="text-white">Loading...</p>}

      <div className="results">
        {results.length > 0 && (
          <div>
            <h2 className="text-xl font-semibold mb-4">
              {query.trim() ? `Search Results For: ${query}` : "For You"}
            </h2>
            <div className="space-y-4">
              {results.map((track) => (
                <div
                  key={`${track.name}-${track.artist}-${track.albumName}`}
                  onClick={() => handleSongClick(track)}
                  className="flex hover:bg-gray-600 items-center justify-between bg-[#2a2a3b] p-4 rounded-lg cursor-pointer"
                >
                  <div className="flex items-center">
                    <img
                      src={track.albumCover}
                      alt={track.name}
                      className="w-12 h-12 rounded-md mr-4"
                    />
                    <div>
                      <p className="text-lg">{track.name}</p>
                      <p className="text-sm text-gray-400">{track.artist}</p>
                      <p className="text-sm text-gray-300">{track.albumName}</p>
                      <p className="text-sm text-gray-300">{track.duration}</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <AddToPlaylistButton
                      className=""
                      song={track}
                      onAddToQueue={() => handleAddToQueue(track)}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {results.length === 0 && !loading && (
          <div>
            <p className="text-white">No results found</p>
          </div>
        )}
        <div className="fixed top-4 right-4 z-50">
          <Toast
            type={toast.type}
            message={toast.message}
            show={toast.show}
            onClose={() => setToast({ ...toast, show: false })}
          />
        </div>
      </div>
    </div>
  );
};

export default SearchPage;
