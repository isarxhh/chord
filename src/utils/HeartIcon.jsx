import React, { useState } from "react";

export const HeartIcon = ({ songId, initiallyLiked = false, onLikeChange }) => {
  const [isLiked, setIsLiked] = useState(initiallyLiked);

  const handleClick = () => {
    const newLikedState = !isLiked;
    setIsLiked(newLikedState);
    if (onLikeChange) {
      onLikeChange(songId, newLikedState);
    }
  };

  return (
    <div className="relative group w-fit">
      <button
        onClick={handleClick}
        aria-pressed={isLiked}
        aria-label={isLiked ? "Unlike song" : "Like song"}
        className="focus:outline-none cursor-pointer "
      >
        <svg
          width="24"
          height="24"
          fill={isLiked ? "pink" : "none"}
          stroke={isLiked ? "pink" : "currentColor"}
          className={`w-6 h-6 transition-all duration-300 ${
            isLiked ? "scale-110" : "scale-100"
          }`}
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
          strokeWidth="1.5"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M7 3C4.23858 3 2 5.21619 2 7.95C2 10.157 2.87466 15.3947 11.4875 20.6903C11.7994 20.8821 12.2006 20.8821 12.5125 20.6903C21.1253 15.3947 22 10.157 22 7.95C22 5.21619 19.7614 3 17 3C14.2386 3 12 6 12 6C12 6 9.76142 3 7 3Z"
          />
        </svg>
      </button>
     
      <span className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black text-white text-sm rounded px-3 py-2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10 whitespace-nowrap">
        {isLiked ? "Unlike song" : "Like song"}
      </span>
    </div>
    
  );
};
