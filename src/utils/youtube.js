const YOUTUBE_API_KEY = import.meta.env.VITE_YT_API_KEY;

export async function fetchYouTubeVideoId(songName, artistName) {
  const query = `${songName} ${artistName}`;
  const url = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=1&q=${encodeURIComponent(
    query
  )}&key=${YOUTUBE_API_KEY}`;

  const response = await fetch(url);
  const data = await response.json();

  if (data.items && data.items.length > 0) {
    return data.items[0].id.videoId;
  } else {
    throw new Error("No video found for query: " + query);
  }
}
