import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import {
  PlayIcon,
  PauseIcon,
  ForwardIcon,
  BackwardIcon,
  XMarkIcon,
  ArrowPathIcon,
  ArrowsRightLeftIcon,
  ArrowDownTrayIcon,
  ArrowsPointingInIcon,
  ArrowsPointingOutIcon,
  ListBulletIcon,
} from "@heroicons/react/24/outline";
import MenuDropdown from "./MenuDropdown";
import SearchPage from "../pages/SearchPage";
import { HeartIcon } from "../utils/HeartIcon";
import { usePlayer } from "../context/PlayerContext";
import { useQueue } from "../context/QueueContext";
import ReactPlayer from "react-player/youtube";

function truncate(text, maxLength = 20) {
  return text.length > maxLength ? text.slice(0, maxLength) + "…" : text;
}

export default function MusicPlayer() {
  const {
    queue = [],
    currentIndex = 0,
    audioRef,
    playNext,
    playPrev,
  } = useQueue() || {};
  const currentSong = queue[currentIndex];
  const {
    currentVideoId,
    isPlaying,
    playSong,
    pauseSong,
    currentTrack,
    setCurrentTrack,
    handleFetchRandomFromYouTube,
  } = usePlayer();
  const player = usePlayer();
  console.log("player context:", player);

  const navigate = useNavigate();
  const playerRef = useRef();

  const [showSearch, setShowSearch] = useState(false);
  const [showMiniplayer, setShowMiniplayer] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [isRepeat, setIsRepeat] = useState(false);
  const [isShuffle, setIsShuffle] = useState(false);
  const [showQueue, setShowQueue] = useState(false);

  const toggleShuffle = () => {
    setIsShuffle((prevState) => !prevState);
  };

  const toggleSearch = () => setShowSearch((s) => !s);

  const togglePlayPause = () => {
    console.log("Toggling play/pause. Current state:", isPlaying);
    if (isPlaying) {
      pauseSong();
    } else {
      playSong(currentTrack?.videoId);
    }
  };

  const toggleMiniplayer = () => {
    setShowMiniplayer((prevState) => !prevState);
  };

  const handleDownload = async () => {
    if (!currentTrack?.videoId) {
      alert("No track selected");
      return;
    }
    try {
      const res = await fetch(
        `/api/yt-dlp/download?url=${encodeURIComponent(
          `https://www.youtube.com/watch?v=${currentTrack.videoId}`
        )}`
      );
      const data = await res.json();
      if (data.url) {
        const link = document.createElement("a");
        link.href = data.url;
        link.download = "";
        document.body.appendChild(link);
        link.click();
        link.remove();
      } else {
        alert("Download failed");
      }
    } catch (err) {
      console.error("Download error:", err);
      alert("Something went wrong.");
    }
  };

  const handleRepeat = () => {
    setIsRepeat((prev) => !prev);
  };

  const fmt = (t = 0) => {
    const m = Math.floor(t / 60),
      s = Math.floor(t % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  useEffect(() => {
    if (queue.length > 0 && queue[currentIndex]) {
      setCurrentTrack(queue[currentIndex]);
      playSong(queue[currentIndex]?.videoId);
    }
  }, [queue, currentIndex]);

  const percent =
    currentTrack?.duration > 0
      ? (currentTrack?.currentTime / currentTrack?.duration) * 100
      : 0;

  return (
    <div className="bg-gradient-to-br from-[#1e1e2f] to-[#12121a] flex items-center justify-center p-4 w-full overflow-x-hidden">
      <div className="bg-[#1a1a2b] text-white max-w-sm w-full rounded-2xl shadow-2xl p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="relative group">
            <MenuDropdown onSearchClick={toggleSearch} />
            <div className="absolute -top-9 left-1/2 -translate-x-1/2 w-28 text-center invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity duration-300 bg-black text-white text-sm px-3 py-2 rounded shadow-md">
              Menu
            </div>
          </div>
          {currentTrack?.playlistName && (
            <p className="text-xs tracking-normal text-gray-300 text-center">
              PLAYING FROM <br />
              <span className="font-medium">{currentTrack.playlistName}</span>
            </p>
          )}

          <div className="relative group">
            <XMarkIcon
              onClick={() => navigate(-1)}
              className="w-7 h-7 rounded-full cursor-pointer text-white hover:text-gray-300"
            />
            <div className="absolute -top-9 right-1/2 translate-x-1/2 w-20 text-center invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity duration-300 bg-black text-white text-sm px-3 py-2 rounded shadow-md">
              Close
            </div>
          </div>
        </div>

        <div
          className="rounded-xl overflow-hidden mb-4 group relative"
          data-tooltip-target="tooltip-album"
        >
          <img
            src={
              currentTrack?.albumCover ||
              "https://songdewnetwork.com/sgmedia/assets/images/default-album-art.png"
            }
            alt="Album Art"
            className="w-full max-h-96 object-cover cursor-pointer"
          />
          <div
            id="tooltip-album"
            role="tooltip"
            className="absolute top-2 left-2 z-10 invisible opacity-0 group-hover:visible group-hover:opacity-100 inline-block px-3 py-2 text-sm font-medium text-white transition-opacity duration-300 bg-black rounded-lg shadow-xs dark:bg-gray-700"
          >
            Album Art
            <div className="tooltip-arrow" data-popper-arrow></div>
          </div>
        </div>

        <div className="relative w-full h-full">
          <div className="absolute right-2 top-2 group z-10">
            <button onClick={() => setShowQueue(true)}>
              <ListBulletIcon className="w-6 h-6 text-white hover:text-gray-300" />
            </button>
            <div className="w-34 text-center absolute -top-10 right-0 z-20 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity duration-300 bg-black text-white text-sm px-3 py-2 rounded shadow-md">
              Show Queue
              <div className="tooltip-arrow" data-popper-arrow></div>
            </div>
          </div>
          <div className="absolute left-2 top-2 group z-10">
            <button onClick={toggleMiniplayer}>
              {showMiniplayer ? (
                <ArrowsPointingInIcon className="w-5 h-5 text-white hover:text-gray-300" />
              ) : (
                <ArrowsPointingOutIcon className="w-5 h-5 text-white hover:text-gray-300" />
              )}
            </button>
            <div className="w-34 text-center absolute -top-10 left-0 z-20 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity duration-300 bg-black text-white text-sm px-3 py-2 rounded shadow-md">
              {showMiniplayer ? "Exit Miniplayer" : "Enter Miniplayer"}
              <div className="tooltip-arrow" data-popper-arrow></div>
            </div>
          </div>

          <div className="text-center pt-6">
            <h2 className="text-lg font-semibold mb-2">
              {currentTrack?.name || "No Track"}
            </h2>
            <p className="text-sm text-gray-400">
              {currentTrack?.artist || "Unknown Artist"}{" "}
              <span className="mx-2 font-extrabold text-xl">·</span>{" "}
              {truncate(currentTrack?.album ||
                currentTrack?.albumName ||
                "Unknown Album")}
            </p>
          </div>
        </div>

        <div className="flex justify-between text-xs text-gray-400 mb-1">
          <span>{fmt(currentTrack?.currentTime)}</span>
          <span>{fmt(currentTrack?.duration)}</span>
        </div>

        <div className="mb-4 mt-3">
          <div className="relative w-full flex items-center">
            <input
              type="range"
              min="0"
              max={currentTrack?.duration}
              step="0.1"
              value={currentTrack?.currentTime || 0}
              onChange={(e) => {
                const seekTo = parseFloat(e.target.value);
                playerRef.current?.seekTo(seekTo, "seconds");
                setProgress(seekTo);
              }}
              className="w-full h-1 appearance-none rounded-full cursor-pointer"
              style={{
                background: `linear-gradient(to right, 
                #22c55e 0%, 
                #22c55e ${percent}%,
                 #ffffff ${percent}%, 
                 #ffffff 100%)`,
              }}
            />
          </div>
        </div>

        <div className="flex items-center justify-center space-x-8">
          <BackwardIcon
            onClick={playPrev}
            className="w-6 h-6 text-gray-300 hover:text-white cursor-pointer"
          />
          {isPlaying ? (
            <PauseIcon
              onClick={togglePlayPause}
              className="w-12 h-12 text-white cursor-pointer"
            />
          ) : (
            <PlayIcon
              onClick={togglePlayPause}
              className="w-12 h-12 text-white cursor-pointer"
            />
          )}
          <ForwardIcon
            onClick={playNext}
            className="w-6 h-6 text-gray-300 hover:text-white cursor-pointer"
          />
        </div>

        <div className="flex justify-between items-end text-gray-300 px-1 mt-4">
          <div className="flex flex-col space-y-6 -translate-y-6">
            <HeartIcon />
            <div className="relative group">
              <ArrowsRightLeftIcon
                onClick={handleRepeat}
                className={`w-6 h-6 cursor-pointer transition-colors ${
                  isRepeat ? "text-green-500" : "text-gray-300 hover:text-white"
                }`}
              />
              <div className="absolute -top-9 left-1/2 -translate-x-1/2 w-28 text-center invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity duration-300 bg-black text-white text-sm px-3 py-2 rounded shadow-md">
                Repeat
              </div>
            </div>
          </div>
          <div className="flex flex-col space-y-6 -translate-y-6">
            <div className="relative group">
              <ArrowPathIcon
                onClick={() => {
                  toggleShuffle();
                  handleFetchRandomFromYouTube();
                }}
                className={`w-6 h-6 cursor-pointer transition-colors ${
                  isShuffle
                    ? "text-green-500"
                    : "text-gray-300 hover:text-white"
                }`}
              />
              <div className="absolute -top-9 left-1/2 -translate-x-1/2 w-32 text-center invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity duration-300 bg-black text-white text-sm px-3 py-3 rounded shadow-md">
                Shuffle & Fetch
              </div>
            </div>
            <div className="relative group">
              <ArrowDownTrayIcon
                onClick={handleDownload}
                className="w-6 h-6 hover:text-white cursor-pointer"
              />
              <div className="absolute -top-9 left-1/2 -translate-x-1/2 w-24 text-center invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-opacity duration-300 bg-black text-white text-sm px-3 py-2 rounded shadow-md">
                Download
              </div>
            </div>
          </div>
        </div>
      </div>

      {showSearch && (
        <div className="bg-[#1a1a2b] text-white p-6 mt-6">
          <SearchPage />
        </div>
      )}

      {currentVideoId && (
        <div
          className={`fixed bottom-4 right-4 z-50 ${
            showMiniplayer ? "block" : "hidden"
          } rounded-xl overflow-hidden`}
        >
          <ReactPlayer
            ref={playerRef}
            url={`https://www.youtube.com/watch?v=${currentVideoId}`}
            playing={isPlaying}
            controls={true}
            loop={isRepeat}
            width="25pc"
            height="14pc"
            onPause={pauseSong}
            onEnded={() => {
              if (!isRepeat) pauseSong();
            }}
            onProgress={({ playedSeconds }) => {
              setProgress(playedSeconds);
              setCurrentTrack((prev) => ({
                ...prev,
                currentTime: playedSeconds,
              }));
            }}
            onDuration={(d) => {
              setDuration(d);
              setCurrentTrack((prev) => ({
                ...prev,
                duration: d,
              }));
            }}
          />
        </div>
      )}

      {showQueue && (
        <div className="fixed inset-0 bg-black bg-opacity-70 z-50 flex justify-center items-center">
          <div className="bg-[#1a1a2b] w-full max-w-md p-6 rounded-lg shadow-lg text-white relative overflow-y-auto max-h-[90vh]">
            <h2 className="text-xl font-bold mb-4">Queue</h2>
            <button
              className="absolute top-3 right-3"
              onClick={() => setShowQueue(false)}
            >
              <XMarkIcon className="w-6 h-6" />
            </button>
            {queue.length === 0 ? (
              <p className="text-gray-400">No songs in queue.</p>
            ) : (
              <ul className="space-y-4">
                {queue.map((song, index) => (
                  <li
                    key={song.id || index}
                    className={`flex items-center gap-4 p-2 ${
                      index === currentIndex ? "bg-green-700/30 rounded-md" : ""
                    }`}
                  >
                    <img
                      src={song.albumCover}
                      alt={song.name}
                      className="w-12 h-12 rounded-md"
                    />
                    <div>
                      <p className="font-semibold">{song.name}</p>
                      <p className="text-sm text-gray-400">{song.artist}</p>
                    </div>
                    {index === currentIndex && (
                      <div className="flex gap-1 items-end h-4 mt-4 absolute right-10">
                        <span className="w-0.5 bg-green-400 animate-eq-bar rounded-full [animation-delay:0s]" />
                        <span className="w-0.5 bg-green-400 animate-eq-bar rounded-full [animation-delay:0.1s]" />
                        <span className="w-0.5 bg-green-400 animate-eq-bar rounded-full [animation-delay:0.2s]" />
                      </div>
                    )}
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
