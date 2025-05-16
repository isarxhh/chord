import { ArrowRightIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const navigate = useNavigate();

  return (
    <div className="relative min-h-screen bg-gradient-to-br from-[#1e1e2f] via-[#002d3a] to-[#12121a] text-white flex items-center justify-center px-4 overflow-hidden">
      <div className="absolute top-1/3 left-1/4 w-72 h-72 bg-green-400/20 rounded-full blur-3xl animate-pulse z-0" />
      <div className="relative z-10 text-center max-w-xl p-15 rounded-3xl shadow-2xl bg-black/30 backdrop-blur-lg border border-white/10 animate-fade-in animate-slide-in-from-bottom">
        <h1 className="text-5xl font-extrabold mb-6 text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-teal-300 drop-shadow-lg">
          Welcome to Chord
        </h1>
        <p className="text-lg text-blue-100 mb-8">
          Immerse yourself in music like never before. <br /> Curated. Clean.
          Yours.
        </p>
        <button
          onClick={() => navigate("/player")}
          className="hover:bg-green-600 
          focus:outline-2 
          focus:outline-offset-2
           focus:outline-green-500
            active:bg-green-700 
            cursor-pointer group inline-flex items-center gap-2 px-6 py-3 text-lg font-semibold bg-green-400 text-black rounded-full shadow-lg transition-transform transform hover:scale-105"
        >
          Launch Music Player
          <ArrowRightIcon className="w-5 h-5 transition-transform group-hover:translate-x-1" />
        </button>
      </div>
    </div>
  );
}
