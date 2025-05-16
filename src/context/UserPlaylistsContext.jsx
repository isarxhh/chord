import { createContext, useState, useContext, useEffect, useRef } from "react";

const UserPlaylistsContext = createContext();

export function UserPlaylistsProvider({ children }) {
  const [userPlaylists, setUserPlaylists] = useState(() => {
    const stored = localStorage.getItem("userPlaylists");
    return stored ? JSON.parse(stored) : [];
  });

  const [playedHistory, setPlayedHistory] = useState([]);
  const [trackQueue, setTrackQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  
  const addPlaylist = (newPlaylist) => {
    const updated = [...userPlaylists, newPlaylist];
    setUserPlaylists(updated);
    localStorage.setItem("userPlaylists", JSON.stringify(updated));
  };

  return (
    <UserPlaylistsContext.Provider
      value={{
        userPlaylists,
        setUserPlaylists,
        playedHistory,
        setPlayedHistory,
        trackQueue,
        setTrackQueue,
        currentIndex,
        setCurrentIndex,
        addPlaylist,
      }}
    >
      {children}
    </UserPlaylistsContext.Provider>
  );
}

export function useUserPlaylists() {
  return useContext(UserPlaylistsContext);
}
