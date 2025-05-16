import { useState } from "react";
import {
  PlayIcon,
  XMarkIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { usePlayer } from "../context/PlayerContext";
import { defaultPlaylists } from "../functions/defaultPlaylists";
import { useQueue } from "../context/QueueContext";
import axios from "axios";

export default function PlaylistPage({ playlist }) {
  const { playPlaylist } = useQueue();
  const { setCurrentTrack, playSong } = usePlayer();
  const navigate = useNavigate();

  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const handlePlay = async (selectedSong) => {
    try {
      const enrichedSongs = await Promise.all(
        selectedPlaylist.songs.map(async (song) => {
          const { data } = await axios.get(
            "http://localhost:5000/api/youtube/search",
            {
              params: { query: `${song.name} ${song.artist}` },
            }
          );
          return {
            ...song,
            videoId: data.videoId,
            playlistName: selectedPlaylist.name,
            currentTime: 0,
            duration: song.duration || 0,
            playlistName: selectedPlaylist?.name || "Unknown Playlist",
            previewUrl: song.previewUrl || "",
            spotifyUrl: song.spotifyUrl || "",
            albumName: song.album,
          };
        })
      );

      const startIndex = enrichedSongs.findIndex(
        (s) => s.id === selectedSong.id
      );
      if (startIndex === -1) {
        return alert("Selected song not found in playlist.");
      }

      const orderedQueue = [
        ...enrichedSongs.slice(startIndex),
        ...enrichedSongs.slice(0, startIndex),
      ];

      playPlaylist(orderedQueue);
      navigate("/player");
    } catch (err) {
      console.error("Error fetching YouTube ID:", err);
      alert("Could not get video for this song.");
    }
  };
  return (
    <div className="p-6 text-white bg-gradient-to-br from-black to-gray-900 min-h-screen">
      <XMarkIcon
        onClick={() => navigate(-1)}
        className="w-7 h-7 rounded-full cursor-pointer absolute right-4 top-7"
      />

      {!selectedPlaylist ? (
        <>
          <h1 className="text-3xl font-bold mb-6">Your Playlists</h1>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {defaultPlaylists.map((pl) => (
              <div
                key={pl.id}
                onClick={() => setSelectedPlaylist(pl)}
                className="bg-gray-800 p-4 rounded-xl hover:bg-gray-700 cursor-pointer"
              >
                <img
                  src={pl.image}
                  alt={pl.name}
                  className="w-full h-40 object-cover rounded-lg mb-4"
                />
                <h2 className="text-xl font-semibold">{pl.name}</h2>
                <p className="text-sm text-gray-400">{pl.description}</p>
              </div>
            ))}
          </div>
        </>
      ) : (
        <div>
          <button
            onClick={() => navigate(-1)}
            className="mb-4 flex items-center gap-2 text-sm text-white hover:text-white"
          >
            <ArrowLeftIcon className="w-5 h-5" />
            Back to playlists
          </button>

          <div className="flex items-center gap-6 mb-6">
            <img
              src={selectedPlaylist.image}
              alt={selectedPlaylist.name}
              className="w-32 h-32 object-cover rounded-lg"
            />
            <div>
              <h2 className="text-2xl font-bold">{selectedPlaylist.name}</h2>
              <p className="text-sm text-gray-300 mb-2 mt-1">
                Enjoy the vibes of “{selectedPlaylist.name}”!
              </p>
              <p className="text-sm text-gray-400">
                {selectedPlaylist.songs.length} songs
              </p>
              <button
                onClick={async () => {
                  const enrichedSongs = await Promise.all(
                    selectedPlaylist.songs.map(async (song) => {
                      const { data } = await axios.get(
                        "http://localhost:5000/api/youtube/search",
                        {
                          params: { query: `${song.name} ${song.artist}` },
                        }
                      );
                      return {
                        ...song,
                        videoId: data.videoId,
                        playlistName: selectedPlaylist.name,
                        currentTime: 0,
                        duration: song.duration || 0,
                        albumName: song.album,
                      };
                    })
                  );
                  playPlaylist(enrichedSongs);
                  navigate("/player");
                }}
                className="flex items-center justify-between mt-2 cursor-pointer text-md text-green-400 rounded-xl"
              >
                Play {selectedPlaylist.name}
                <PlayIcon className="w-5 h-5 mt-1 text-green-400 ml-2" />
              </button>
            </div>
          </div>

          <div className="space-y-4">
            {selectedPlaylist.songs.map((song) => (
              <div
                key={song.id}
                className="flex items-center cursor-pointer justify-between bg-gray-800 p-3 rounded-md hover:bg-gray-700"
              >
                <div className="flex items-center gap-4">
                  <img
                    src={song.albumCover}
                    alt={song.name}
                    className="w-12 h-12 object-cover rounded-lg"
                  />
                  <div>
                    <p className="font-medium">{song.name}</p>
                    <p className="text-sm text-gray-400">{song.artist}</p>
                    <p className="mt-1 text-xs text-gray-300">{song.album}</p>
                  </div>
                </div>
                <button onClick={() => handlePlay(song)}>
                  <PlayIcon className="w-6 h-6 text-green-400" />
                </button>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
