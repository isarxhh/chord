import { useNavigate } from "react-router-dom";
import { useUserPlaylists } from "../context/UserPlaylistsContext";
import PlaylistOptionsMenu from "../components/PlaylistOptionsMenu";
import EditPlaylistModal from "../utils/EditPlaylistModal";
import { useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";

export default function UserPlaylistPage() {
  const { userPlaylists, setUserPlaylists } = useUserPlaylists();
  const [selectedPlaylist, setSelectedPlaylist] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const navigate = useNavigate();
  const handleEditPlaylist = (playlist) => {
    setSelectedPlaylist(playlist);
    setShowEditModal(true);
  };
  const handleDeletePlaylist = (playlist) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this playlist?"
    );
    if (confirmed) {
      const updated = userPlaylists.filter((p) => p.id !== playlist.id);
      setUserPlaylists(updated);
      localStorage.setItem("userPlaylists", JSON.stringify(updated));
    }
  };
  const handleSubmitEdit = (updatedPlaylist) => {
    const updated = userPlaylists.map((playlist) =>
      playlist.id === updatedPlaylist.id ? updatedPlaylist : playlist
    );
    setUserPlaylists(updated);
    localStorage.setItem("userPlaylists", JSON.stringify(updated));
    setShowEditModal(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black to-gray-900 p-6 text-white">
         <XMarkIcon
            onClick={() => navigate(-1)}
            className="absolute right-8 top-8 w-7 h-7 rounded-full cursor-pointer text-white hover:text-gray-300"
          />
      <h1 className="text-3xl font-bold mb-6">Your Created Playlists</h1>
      <button
        onClick={() => navigate("/create-playlist")}
        className="p-3 rounded-lg text-left mb-6 ml-1 bg-green-500 text-white hover:bg-green-600 cursor-pointer"
      >
        Create Playlist +
      </button>
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {userPlaylists.map((pl) => (
          <div
            key={pl.id}
            className="bg-gray-800 p-4 rounded-xl hover:bg-gray-700 cursor-pointer"
            onClick={() => navigate(`/user-playlists/${pl.id}`)} // Navigate to playlist page
          >
            <img
              src={pl.image}
              alt={pl.name}
              className="w-full h-40 object-cover rounded-lg mb-2"
            />
            <div className="flex items-center justify-between">
              <div className="flex flex-col">
                <h2 className="text-xl font-semibold mb-1">{pl.name}</h2>
                <p className="text-sm text-gray-400">{pl.description}</p>
              </div>
              <div onClick={(e) => e.stopPropagation()}>
                <PlaylistOptionsMenu
                  onEdit={() => handleEditPlaylist(pl)}
                  onDelete={() => handleDeletePlaylist(pl)}
                />
              </div>
            </div>
          </div>
        ))}

        {showEditModal && selectedPlaylist && (
          <EditPlaylistModal
            playlist={selectedPlaylist}
            onClose={() => setShowEditModal(false)}
            onSubmit={handleSubmitEdit}
          />
        )}
      </div>
    </div>
  );
}
