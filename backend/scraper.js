// scraper.js
// Job: take a URL, download the page, and return its main readable text.

import axios from "axios";
import * as cheerio from "cheerio";

// The AI can read a lot, but we don't need the whole page for a short summary.
const MAX_CHARACTERS = 12000;

/** Check that the text is a real http(s) link. Throws a friendly error if not. */
export function validateUrl(input) {
  let parsed;
  try {
    parsed = new URL(input);
  } catch {
    throw new UserError("That doesn't look like a valid URL. Try something like https://example.com");
  }
  if (!["http:", "https:"].includes(parsed.protocol)) {
    throw new UserError("Only http:// and https:// links are supported.");
  }
  return parsed.href;
}

/** Download the page and pull out the main text. */
export async function scrapePage(url) {
  let html;
  try {
    const response = await axios.get(url, {
      timeout: 10000,
      maxContentLength: 5 * 1024 * 1024, // refuse pages bigger than 5 MB
      headers: {
        // Some sites block requests that have no browser-like User-Agent
        "User-Agent": "Mozilla/5.0 (compatible; AI-Summarizer-Bot/1.0)",
      },
    });
    html = response.data;
  } catch (err) {
    if (err.code === "ECONNABORTED") {
      throw new UserError("The website took too long to respond.");
    }
    if (err.response) {
      throw new UserError(`The website replied with an error (status ${err.response.status}).`);
    }
    throw new UserError("Couldn't reach that website. Check the link and try again.");
  }

  if (typeof html !== "string") {
    throw new UserError("That link doesn't point to a normal web page.");
  }

  const $ = cheerio.load(html);

  // Remove parts of the page that are not the main content
  $("script, style, noscript, nav, header, footer, aside, form, iframe, svg").remove();

  const title = $("title").first().text().trim() || "Untitled page";

  // Prefer <article> or <main> if the page has them, otherwise use <body>
  const container = $("article").first().length
    ? $("article").first()
    : $("main").first().length
    ? $("main").first()
    : $("body");

  // Collect headings, paragraphs and list items
  const pieces = [];
  container.find("h1, h2, h3, p, li").each((_, el) => {
    const text = $(el).text().replace(/\s+/g, " ").trim();
    if (text.length > 20) pieces.push(text);
  });

  const text = pieces.join("\n").slice(0, MAX_CHARACTERS);

  if (text.length < 100) {
    throw new UserError(
      "Not enough readable text found. The page may need JavaScript to load its content."
    );
  }

  return { title, text };
}

/** An error whose message is safe to show to the user. */
export class UserError extends Error {}
