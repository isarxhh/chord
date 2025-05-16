import "./App.css";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import MusicPlayer from "./components/MusicPlayer";
import SearchPage from "./pages/SearchPage";
import HomePage from "./pages/HomePage";
import UserPlaylistPage from "./pages/UserPlaylistPage";
import PlaylistPage from "./components/defaultPlaylists";
import CreatePlaylistPage from "./pages/CreatePlaylistPage";
import UserPlaylistDetailPage from "./pages/UserPlaylistDetailPage";

function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/player" element={<MusicPlayer />} />
      <Route path="/search" element={<SearchPage />} />
      <Route path="/defaultPlaylists" element={<PlaylistPage />} />
      <Route path="/user-playlists" element={<UserPlaylistPage />} />
      <Route path='/create-playlist' element={<CreatePlaylistPage/>}/>
      <Route path="/user-playlists/:id" element={<UserPlaylistDetailPage />} />
    </Routes>
  );
}

export default App;
