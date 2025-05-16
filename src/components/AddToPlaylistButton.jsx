import { useState } from "react";
import { PlusCircleIcon } from "@heroicons/react/24/outline";
import { useUserPlaylists } from "../context/UserPlaylistsContext";
import { useQueue } from "../context/QueueContext";
import { fetchYouTubeVideoId } from "../utils/youtube";

export default function AddToPlaylistButton({ song, onAddToQueue }) {
  const { userPlaylists, setUserPlaylists } = useUserPlaylists();
  const [showDropdown, setShowDropdown] = useState(false);
  const { addToQueue } = useQueue();

  const addSongToPlaylist = (playlistId, song) => {
    const updatedPlaylists = userPlaylists.map((playlist) => {
      if (playlist.id === playlistId) {
        const exists = playlist.songs?.some((s) => s.url === song.url);
        if (exists) return playlist;

        return {
          ...playlist,
          songs: [...(playlist.songs || []), song],
        };
      }
      return playlist;
    });

    setUserPlaylists(updatedPlaylists);
    localStorage.setItem("userPlaylists", JSON.stringify(updatedPlaylists));
  };
  const handleAddToQueue = async (song) => {
    try {
      const videoId = await fetchYouTubeVideoId(song.name, song.artist);
      const enrichedSong = { ...song, videoId };
      addToQueue(enrichedSong);
      setShowDropdown(false);
      
    } catch (err) {
      console.error("Failed to fetch videoId:", err);
    }
  };

  return (
    <div className="relative inline-block text-left">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowDropdown(!showDropdown);
        }}
        className="text-green-400 hover:text-white"
      >
        <PlusCircleIcon className="w-7 h-7" />
      </button>

      {showDropdown && (
        <div className="absolute p-2 right-0 mt-2 w-52 bg-[#1a1a2b] rounded-md shadow-lg z-50">
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleAddToQueue(song);
              setShowDropdown(false);
            }}
            className="w-full text-left px-4 py-2 text-sm text-green-400 hover:bg-gray-700 hover:text-white rounded"
          >
            Add to Queue
          </button>

          <hr className="my-2 border-gray-700" />

          {userPlaylists.length === 0 ? (
            <div className="text-sm text-gray-400 px-4 py-2">No playlists</div>
          ) : (
            userPlaylists.map((playlist) => (
              <button
                key={playlist.id}
                onClick={(e) => {
                  e.stopPropagation();
                  addSongToPlaylist(playlist.id, song);
                  setShowDropdown(false);
                }}
                className="w-full text-left px-4 py-2 text-sm hover:bg-gray-700 text-white"
              >
                {playlist.name}
              </button>
            ))
          )}
        </div>
      )}
    </div>
  );
}
