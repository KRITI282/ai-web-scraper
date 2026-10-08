// summarizer.js
// Job: send text to Groq (free tier) and get a short summary back.
// Groq uses the same request format as OpenAI, but the free tier needs no payment.

import axios from "axios";
import { UserError } from "./scraper.js";

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";

export async function summarize(title, text) {
  const apiKey = process.env.GROQ_API_KEY;
  const model = (process.env.GROQ_MODEL || "openai/gpt-oss-20b")
    .replace(/^GROQ_MODEL=/i, "")
    .trim();

  if (!apiKey) {
    throw new Error("GROQ_API_KEY is missing. Add it to backend/.env");
  }

  const prompt = `Summarize the web page below for a busy reader.

Rules:
- Start with one sentence saying what the page is about.
- Then give 3 to 5 short bullet points with the key ideas (start each with "- ").
- Keep it under 150 words and use plain language.

Page title: ${title}

Page text:
${text}`;

  try {
    const { data } = await axios.post(
      GROQ_URL,
      {
        model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.3,
        max_tokens: 400,
      },
      {
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        timeout: 30000,
      }
    );

    const summary = data?.choices?.[0]?.message?.content;
    if (!summary) throw new Error("The AI returned an empty answer.");
    return summary.trim();
  } catch (err) {
    const status = err.response?.status;
    if (status === 429) {
      throw new UserError("AI rate limit reached (free tier). Wait a minute and try again.");
    }
    if (status === 401) {
      throw new Error("Groq rejected the API key. Check GROQ_API_KEY in backend/.env");
    }
    if (status === 400 || status === 404) {
      throw new Error("Groq rejected the request. The model name in GROQ_MODEL may be outdated.");
    }
    throw err;
  }
}
