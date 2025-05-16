import { EllipsisVerticalIcon } from "@heroicons/react/24/outline";
import { useState } from "react";

export default function PlaylistOptionsMenu({ onEdit, onDelete }) {
  const [showMenu, setShowMenu] = useState(false);

  return (
    <div className="relative">
      <button
        onClick={(e) => {
          e.stopPropagation();
          setShowMenu(!showMenu);
        }}
        className="p-1 hover:bg-gray-700 rounded-full"
      >
        <EllipsisVerticalIcon className="w-7 h-7 text-gray-300" />
      </button>

      {showMenu && (
        <div className="absolute right-0 mt-2 w-40 bg-[#1a1a2b] p-2 rounded shadow z-50 text-white">
          <button
            onClick={() => {
              setShowMenu(false);
              onEdit();
            }}
            className="block w-full text-left px-4 py-2 hover:bg-gray-600"
          >
            Edit Playlist
          </button>
          <button
            onClick={() => {
              setShowMenu(false);
              onDelete();
            }}
            className="block w-full text-left px-4 py-2 hover:bg-red-600 text-red-400"
          >
            Delete Playlist
          </button>
        </div>
      )}
    </div>
  );
}
