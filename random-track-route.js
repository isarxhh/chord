import express from "express";
import axios from "axios";
import SpotifyWebApi from "spotify-web-api-node";
import dotenv from "dotenv";

dotenv.config();

const router = express.Router();

const spotifyApi = new SpotifyWebApi({
  clientId: process.env.SPOTIFY_CLIENT_ID,
  clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
});
const YOUTUBE_API_KEY = process.env.YOUTUBE_API_KEY;

const initSpotifyToken = async () => {
  try {
    const data = await spotifyApi.clientCredentialsGrant();
    const accessToken = data.body.access_token;
    spotifyApi.setAccessToken(accessToken);
  } catch (err) {
    console.error("Failed to get Spotify access token", err);
  }
};

initSpotifyToken();
setInterval(initSpotifyToken, 55 * 60 * 1000);

router.get("/random-track", async (req, res) => {
  console.log("HIT /api/random-track route");
  try {
    console.log("Fetching trending YouTube videos...");
    const ytResp = await axios.get("https://www.googleapis.com/youtube/v3/videos", {
      params: {
        part: "snippet",
        chart: "mostPopular",
        q: "trending reels music", 
        regionCode: "IN",          
        videoCategoryId: "10",      
        maxResults: 50,
        key: YOUTUBE_API_KEY,
      },
    });

    console.log("YouTube response received.");
    const items = ytResp.data.items;
    if (!items || !items.length) {
      console.log("No items in response.");
      return res.status(404).json({ error: "No trending videos found" });
    }

    const randomVideo = items[Math.floor(Math.random() * items.length)];

    const videoId = randomVideo.id; 
    const { title, channelTitle, thumbnails } = randomVideo.snippet;

    const query = `${title} ${channelTitle}`;

    const spotifyData = await spotifyApi.searchTracks(query, { limit: 1 });
    const spotifyTrack = spotifyData.body.tracks.items[0];

    if (!spotifyTrack) {
      return res.json({
        videoId,
        name: title,
        artist: channelTitle,
        album: "N/A",
        albumCover: thumbnails.high.url,
        youtubeThumbnail: thumbnails.high.url,
      });
    }

    res.json({
      videoId,
      name: spotifyTrack.name,
      artist: spotifyTrack.artists.map((a) => a.name).join(", "),
      album: spotifyTrack.album.name,
      albumCover: spotifyTrack.album.images[0]?.url,
      youtubeThumbnail: thumbnails.high.url,
    });
  } catch (error) {
    console.error("Error in /api/random-track:", error);
    res.status(500).json({ error: "Failed to fetch random track" });
  }
});

export default router;
