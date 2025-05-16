import { createContext, useContext, useState, useRef } from "react";

const QueueContext = createContext({
  queue: [],
  setQueue: () => {},
  currentIndex: 0,
  setCurrentIndex: () => {},
  playNext: () => {},
});
export const useQueue = () => useContext(QueueContext);

export function QueueProvider({ children }) {
  const [queue, setQueue] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const audioRef = useRef(null);
  console.log("Playing from queue:", queue[currentIndex]);

  function addToQueue(track) {
    setQueue((prevQueue) => [...prevQueue, track]);
  }

  const playPlaylist = (playlist) => {
    setQueue(playlist);
    setCurrentIndex(0);
  };

  const playNext = () => {
    if (currentIndex + 1 < queue.length) {
      setCurrentIndex(currentIndex + 1);
    }
  };

  const playPrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    } else {
      setCurrentIndex(queue.length - 1);
    }
  };
  return (
    <QueueContext.Provider
      value={{
        queue,
        currentIndex,
        audioRef,
        setQueue,
        setCurrentIndex,
        playPlaylist,
        playNext,
        playPrev,
        addToQueue,
      }}
    >
      {children}
    </QueueContext.Provider>
  );
}
