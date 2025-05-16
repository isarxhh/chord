
export default async function handler(req, res) {
  const { q } = req.query;
  const apiKey = process.env.YOUTUBE_API_KEY;

  const apiUrl = `https://www.googleapis.com/youtube/v3/search?part=snippet&type=video&maxResults=1&q=${encodeURIComponent(
    q
  )}&key=${apiKey}`;

  const response = await fetch(apiUrl);
  const data = await response.json();

  if (data.items && data.items.length > 0) {
    res.status(200).json({ videoId: data.items[0].id.videoId });
  } else {
    res.status(404).json({ error: "No video found" });
  }
}
