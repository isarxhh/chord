import { createRoot } from "react-dom/client";
import "./index.css";
import "flowbite";
import App from "./App";
import { BrowserRouter } from "react-router-dom";
import { Buffer } from "buffer";
import { UserPlaylistsProvider } from "./context/UserPlaylistsContext";
import { PlayerProvider } from "./context/PlayerContext";
import { QueueProvider } from "./context/QueueContext";
window.Buffer = Buffer;
createRoot(document.getElementById("root")).render(
  
  <UserPlaylistsProvider>
    <QueueProvider>
    <PlayerProvider>
      <BrowserRouter>
        <App />
      </BrowserRouter>
    </PlayerProvider>
    </QueueProvider>
  </UserPlaylistsProvider>
);
