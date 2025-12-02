// pages/api/families.js

const apiBase = process.env.NEXT_PUBLIC_API_BASE || "http://localhost:3001";

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.status(405).end("Method Not Allowed");
    return;
  }

  try {
    const backendRes = await fetch(`${apiBase}/api/families`, {
      cache: "no-store",
    });

    const data = await backendRes.json();
    res.status(backendRes.status).json(data);
  } catch (err) {
    console.error("Error proxy /api/families:", err);
    res.status(500).json({ error: "Error fetching families" });
  }
}
