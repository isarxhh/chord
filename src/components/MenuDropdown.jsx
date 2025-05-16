import { useState, useRef, useEffect} from "react";
import { Bars3Icon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";
import { parseBlob } from "music-metadata-browser";

const MenuDropdown = () => {
  const navigate = useNavigate();

  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef(null);
  const [open, setOpen] = useState(false);
  const fileRef = useRef();

  const handleImportClick = () => {
    setOpen(false);
    fileRef.current.click();
  };

  const handleFile = async (e) => {
    const file = e.target.files[0];
    if (!file || !file.type.startsWith("audio/")) return;

    let meta = {
      name: file.name,
      artist: "Unknown",
      album: "Unknown",
      duration: 0,
    };
    let cover = "";

    try {
      const { common, format } = await parseBlob(file);
      meta = {
        name: common.title || file.name,
        artist: common.artist || "Unknown",
        album: common.album || "Unknown",
        duration: format.duration || 0,
      };

      if (common.picture?.[0]) {
        const { data, format: fmt } = common.picture[0];
        cover = URL.createObjectURL(new Blob([data], { type: fmt }));
      }
    } catch (err) {
      console.error(err);
    }
    const url = URL.createObjectURL(file);
    playTrack({ ...meta, albumCover: cover, preview_url: url });
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);
  const handleSearchClick = () => {
    setMenuOpen(false);
    navigate("/search");
  };

  return (
    <div className="relative" ref={menuRef}>
      <Bars3Icon
        className="w-7 h-7 rounded-full object-cover cursor-pointer"
        onClick={() => setMenuOpen((o) => !o)}
      />

      {menuOpen && (
        <div className="absolute left-0 w-50 mt-2 bg-[#19263df7] rounded-lg shadow-lg py-2 z-50">
          <button
            className="block w-full text-left px-4 py-2 text-white hover:bg-[#3a3a4b] cursor-pointer"
            onClick={handleSearchClick}
          >
            Search Online
          </button>
          <button
            className="block w-full text-left px-4 py-2 text-white hover:bg-[#3a3a4b] cursor-pointer"
            onClick={handleImportClick}
          >
            Import Local
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="audio/*"
            className="hidden"
            onChange={handleFile}
          />
          <button
          onClick={()=>navigate("/create-playlist")}
            className="block w-full text-left px-4 py-2 text-white hover:bg-[#3a3a4b] cursor-pointer"
          >
            Create Playlist +
          </button>
          <span className="ml-1 text-gray-400">⸻⸻⸻⸻⸻⸻</span>
          <button
          onClick={()=>navigate("/defaultPlaylists")}
            className="block w-full text-sm text-left px-4 py-2 text-white hover:bg-[#3a3a4b] cursor-pointer"
          >
           Default Playlists
          </button>
          <button
            onClick={() => navigate("/user-playlists")}
            className="block w-full text-sm text-left px-4 py-2 text-white hover:bg-[#3a3a4b] cursor-pointer"
          >
           Your Playlists
          </button>
        </div>
      )}
    </div>
  );
};

export default MenuDropdown;
