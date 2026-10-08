// server.js
// Starts the API. The frontend sends a URL to POST /api/summarize.

import "dotenv/config";
import express from "express";
import cors from "cors";
import { pathToFileURL } from "node:url";
import { validateUrl, scrapePage, UserError } from "./scraper.js";
import { summarize } from "./summarizer.js";

export const app = express();
const PORT = Number(process.env.PORT) || 5000;

app.use(cors());
app.use(express.json());
app.get("/", (req, res) => {
  res.send("AI Web Scraper Backend is running!");
});
// Quick check that the server is alive: open http://localhost:5000/api/health
app.get("/api/health", (req, res) => res.json({ status: "ok" }));

app.post("/api/summarize", async (req, res) => {
  try {
    // 1. Receive and validate the URL
    const url = validateUrl(String(req.body?.url || "").trim());

    // 2. Scrape the page
    const { title, text } = await scrapePage(url);

    // 3. Summarize with AI
    const summary = await summarize(title, text);

    // 4. Send the result back to the frontend
    res.json({ title, url, summary });
  } catch (err) {
    console.error("Error:", err.message);
    // UserError messages are safe to show; others get a generic message
    const isUserError = err instanceof UserError;
    res.status(isUserError ? 400 : 500).json({
      error: isUserError ? err.message : "Something went wrong on the server. Please try again.",
    });
  }
});

const isDirectRun = process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;

if (isDirectRun) {
  const server = app.listen(PORT, () => console.log(`Backend running on http://localhost:${PORT}`));
  server.on("error", (err) => {
    if (err.code === "EADDRINUSE") {
      console.error(`Port ${PORT} is already in use. Stop the other process or set PORT to a different value.`);
      process.exit(1);
    }
    throw err;
  });
}
