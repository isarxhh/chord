import { useState } from "react";
import { useUserPlaylists } from "../context/UserPlaylistsContext";
import { useNavigate } from "react-router-dom";
import { XMarkIcon } from "@heroicons/react/24/outline";
import Toast from "../utils/Toast";

export default function CreatePlaylistPage() {
  const { addPlaylist } = useUserPlaylists();
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");

  const [toast, setToast] = useState({
    show: false,
    message: "",
    type: "danger",
  });

  const navigate = useNavigate();

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!name.trim() || !description.trim()) {
      setToast({
        show: true,
        message: "Please fill in all required fields",
        type: "warning",
      });
      return;
    }

    const newPlaylist = {
      id: Date.now().toString(),
      name,
      description,
      image:
        image ||
        "https://songdewnetwork.com/sgmedia/assets/images/default-album-art.png",
      songs: [],
    };

    addPlaylist(newPlaylist);

    setToast({
      show: true,
      message: "Playlist created successfully!",
      type: "success",
    });

    setTimeout(() => {
      navigate("/user-playlists");
    }, 1500);
  };

  return (
    <>
      <div className="min-h-screen bg-gradient-to-br from-black to-gray-900 text-white p-8">
        <div className="max-w-xl mx-auto bg-gray-800 p-8 rounded-2xl shadow-xl">
          <XMarkIcon
            onClick={() => navigate(-1)}
            className="absolute right-14 top-8 w-7 h-7 rounded-full cursor-pointer text-white hover:text-gray-300"
          />
          <h1 className="text-3xl font-bold mb-6 text-center">
            Create New Playlist
          </h1>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm mb-2 font-semibold text-gray-300">
                Playlist Name
              </label>
              <input
                type="text"
                placeholder="My Playlist"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-3 rounded-md bg-gray-700 border border-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm mb-2 font-semibold text-gray-300">
                Description
              </label>
              <textarea
                placeholder="Add a short description..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full p-3 rounded-md bg-gray-700 border border-gray-600 placeholder-gray-400 resize-none h-24 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <div>
              <label className="block text-sm mb-2 font-semibold text-gray-300">
                Cover Image URL
              </label>
              <input
                type="text"
                placeholder="https://example.com/image.jpg"
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="w-full p-3 rounded-md bg-gray-700 border border-gray-600 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>

            <button
              type="submit"
              className="focus:outline-2 focus:outline-offset-2 focus:outline-green-500 cursor-pointer active:bg-green-700 w-full bg-green-500 hover:bg-green-600 transition-all text-white font-semibold text-xl py-3 rounded-md shadow-md"
            >
              Create Playlist
            </button>
          </form>
        </div>
      </div>
      <div className="fixed top-4 right-4 z-50">
        <Toast
          type={toast.type}
          message={toast.message}
          show={toast.show}
          onClose={() => setToast({ ...toast, show: false })}
        />
      </div>
    </>
  );
}
