import React, { useState } from "react";

const EditPlaylistModal = ({ playlist, onClose, onSubmit }) => {
  const [newName, setNewName] = useState(playlist.name);
  const [newDescription, setNewDescription] = useState(playlist.description);
  const [newImage, setNewImage] = useState(playlist.image || "");

  const handleSave = () => {
    const updatedPlaylist = { ...playlist, name: newName, description: newDescription, image: newImage };
    onSubmit(updatedPlaylist); 
  };

  return (
    <div className="modal-overlay fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center">
      <div className="modal-content bg-[#2a2a3b] p-6 rounded shadow-lg w-80">
        <h2 className="text-xl font-semibold mb-4">Edit Playlist</h2>

        <div className="mb-4">
          <label className="block text-sm text-white mb-2">Playlist Name</label>
          <input
            type="text"
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            className="w-full focus:outline-none focus:ring-2 focus:ring-green-500 p-2 bg-[#1a1a2b] text-white rounded"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm text-white mb-2">Description</label>
          <textarea
            value={newDescription}
            onChange={(e) => setNewDescription(e.target.value)}
            className="w-full p-2 bg-[#1a1a2b] text-white rounded resize-none h-24 focus:outline-none focus:ring-2 focus:ring-green-500"
            rows="3"
          />
        </div>

        <div className="mb-4">
          <label className="block text-sm text-white mb-2">Image URL</label>
          <input
            type="text"
            value={newImage}
            onChange={(e) => setNewImage(e.target.value)}
            className="w-full focus:outline-none focus:ring-2 focus:ring-green-500 p-2 bg-[#1a1a2b] text-white rounded"
          />
        </div>

        <div className="flex justify-between">
          <button onClick={onClose} className="text-gray-400 hover:text-white">Cancel</button>
          <button onClick={handleSave} className="text-green-400 hover:text-white">Save</button>
        </div>
      </div>
    </div>
  );
};

export default EditPlaylistModal;
