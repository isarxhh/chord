import express from "express";
import axios from "axios";
import SpotifyWebApi from "spotify-web-api-node";
import cors from "cors";
import path from "path";
import fs from "fs";
import dotenv from "dotenv";
import { fileURLToPath } from "url";

import pkg from "yt-dlp-wrap";
const YtdlpWrap = pkg.default;
import randomTrackRoute from "./random-track-route.js";


dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: "http://localhost:5173", 
    methods: ["GET", "POST"],
  })
);

app.use("/downloads", express.static(path.join(__dirname, "downloads")));

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
});
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

const getAccessToken = async () => {
  try {
    const data = await spotifyApi.clientCredentialsGrant();
    const accessToken = data.body['access_token'];

    if (accessToken) {
      spotifyApi.setAccessToken(accessToken);
      console.log('Spotify access token set');
    } else {
      console.error("Failed to retrieve access token");
    }
  } catch (error) {
    console.error('Error getting Spotify access token', error);
  }
};

getAccessToken();
setInterval(getAccessToken, 60 * 60 * 1000); 

const ytdlp = new YtdlpWrap();
const DOWNLOAD_DIR = path.join(__dirname, "downloads");

if (!fs.existsSync(DOWNLOAD_DIR)) {
  fs.mkdirSync(DOWNLOAD_DIR);
}

app.use(express.json());

app.get("/", (req, res) => {
  res.send("Backend server is running!");
});

app.use("/api", randomTrackRoute);

app.get("/api/spotify/search", async (req, res) => {
  const { query } = req.query;
  try {
    const data = await spotifyApi.searchTracks(query);
    res.json(data.body);
  } catch (error) {
    console.error("Error searching for tracks", error);
    res.status(500).json({ error: "Failed to search tracks" });
  }
});

app.get("/api/spotify/playlist-tracks", async (req, res) => {
  const playlistId = "0EN2gQhhn0rCYUR5BY1UJy";

  try {
    const data = await spotifyApi.getPlaylistTracks(playlistId, {
      limit: 50,
    });

    const simplifiedTracks = data.body.items.map(item => {
      const track = item.track;
      return {
        id: track.id,
        name: track.name,
        artists: track.artists.map(artist => artist.name),
        album: {
          name: track.album.name,
          image: track.album.images[0]?.url,
        },
        preview_url: track.preview_url,
        spotify_url: track.external_urls.spotify,
      };
    });

    res.json({ tracks: simplifiedTracks });
  } catch (error) {
    console.error("Error fetching playlist tracks:", error);
    res.status(500).json({ error: "Failed to fetch playlist tracks" });
  }
});

const isValidStreamUrl = (url) => {
  return url && url.startsWith('http');
};

app.get("/api/youtube/search", async (req, res) => {
  const { query } = req.query;
  if (!query) return res.status(400).json({ error: "query is required" });

  try {
    const response = await axios.get(
      "https://www.googleapis.com/youtube/v3/search",
      {
        params: {
          part: "snippet",
          q: query,
          key: YOUTUBE_API_KEY,
          maxResults: 1,
          type: "video",
          videoEmbeddable: "true", 
          safeSearch: "strict",     
        },
      }
    );

    const videoId = response.data.items[0]?.id?.videoId;

    if (videoId) {
      res.json({ videoId });
    } else {
      res.status(404).json({ error: "No video found" });
    }
  } catch (error) {
    console.error("YouTube search error:", error?.response?.data || error.message);
    res.status(500).json({ error: "YouTube search failed" });
  }
});

app.use('/downloads', express.static(DOWNLOAD_DIR));

app.get("/api/yt-dlp/download", async (req, res) => {
  const { url } = req.query;
  if (!url) return res.status(400).json({ error: "URL is required" });

  const outputTemplate = path.join(DOWNLOAD_DIR, "%(title)s.%(ext)s");

  try {
    const ytProcess = ytdlp.exec([
      url,
      "-x",
      "--audio-format", "mp3",
      "-o", outputTemplate,
    ]);

    ytProcess.on("close", () => {
      const files = fs.readdirSync(DOWNLOAD_DIR);
      const latest = files
        .map(f => ({
          file: f,
          time: fs.statSync(path.join(DOWNLOAD_DIR, f)).mtime.getTime()
        }))
        .sort((a, b) => b.time - a.time)[0];

      if (latest) {
        const fileUrl = `/downloads/${latest.file}`;
        res.json({ message: "Download ready", url: fileUrl });
      } else {
        res.status(500).json({ error: "Download failed" });
      }
    });
  } catch (err) {
    console.error("yt-dlp download error", err);
    res.status(500).json({ error: "Failed to download file" });
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
