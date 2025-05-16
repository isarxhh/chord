import { useParams, useNavigate, useLocation } from "react-router-dom";
import { useUserPlaylists } from "../context/UserPlaylistsContext";
import { ArrowLeftIcon, PlayIcon, PlusIcon } from "@heroicons/react/24/outline";
import axios from "axios";

import { useQueue } from "../context/QueueContext";
export default function UserPlaylistDetailPage() {
  const { playPlaylist } = useQueue();
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const { userPlaylists } = useUserPlaylists();

  const playlist = userPlaylists.find((pl) => pl.id === id);

  const handlePlay = async (selectedSong) => {
  try {
    const enrichedSongs = await Promise.all(
      playlist.songs.map(async (song) => {
        const { data } = await axios.get(
          "http://localhost:5000/api/youtube/search",
          {
            params: { query: `${song.name} ${song.artist}` },
          }
        );
        return {
          ...song,
          videoId: data.videoId,
          playlistName: playlist.name,
          currentTime: 0,
          duration: song.duration || 0,
        };
      })
    );

    const startIndex = enrichedSongs.findIndex((s) => s.id === selectedSong.id);
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


  if (!playlist) {
    return <div className="text-white p-6">Playlist not found.</div>;
  }

  return (
    <div className="p-6 text-white bg-gradient-to-br from-black to-gray-900 min-h-screen">
      <button
        onClick={() => navigate(-1)}
        className="mb-4 cursor-pointer flex items-center text-sm text-gray-400 hover:text-white"
      >
        <ArrowLeftIcon className="w-5 h-5 mr-2" />
        Back to playlists
      </button>

      <div className="flex items-center gap-6 mb-6">
        <img
          src={playlist.image}
          alt={playlist.name}
          className="w-32 h-32 object-cover rounded-lg"
        />
        <div>
          <h2 className="text-2xl font-bold">{playlist.name}</h2>
          <p className="text-sm text-gray-400">{playlist.songs.length} songs</p>
          {playlist.description && (
            <p className="text-gray-300 mt-2 text-sm italic">
              {playlist.description}
            </p>
          )}
          <button
            className="flex items-center justify-between mt-2 cursor-pointer text-md text-green-400 rounded-xl"
            onClick={async () => {
              const enrichedSongs = await Promise.all(
                playlist.songs.map(async (song) => {
                  const { data } = await axios.get(
                    "http://localhost:5000/api/youtube/search",
                    {
                      params: { query: `${song.name} ${song.artist}` },
                    }
                  );
                  return {
                    ...song,
                    videoId: data.videoId,
                    playlistName: playlist.name,
                    currentTime: 0,
                    duration: song.duration || 0,
                    albumName: song.album,
                  };
                })
              );
              playPlaylist(enrichedSongs);
              navigate("/player");
            }}
          >
            Play {playlist.name}
            <PlayIcon className="w-5 h-5 mt-1 text-green-400 ml-2" />
          </button>
        </div>
      </div>

      <button
        onClick={() =>
          navigate("/search", { state: { returnTo: location.pathname } })
        }
        className="mb-4 flex items-center cursor-pointer bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg"
      >
        <PlusIcon className="w-5 h-5 mr-2" /> Add Songs
      </button>

      {playlist.songs.length === 0 ? (
        <p className="text-gray-500">No songs added yet.</p>
      ) : (
        <div className="space-y-4">
          {playlist.songs.map((song, index) => (
            <div
              key={song.url || `${song.name}-${index}`}
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
                  <p className="mt-1 text-xs text-gray-300">
                    {song.albumName || "Unknown Album"}
                  </p>
                </div>
              </div>
              <button onClick={() => handlePlay(song)}>
                <PlayIcon className="w-6 h-6 text-green-400" />
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
