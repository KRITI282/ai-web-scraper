# AI Web Scraper & Summarizer

A simple full-stack app: paste a web page URL, the backend scrapes the page text, and Groq (free tier) writes a short summary that is shown on screen.

## How it works

```
Browser (React)  --URL-->  Express API  --scrape-->  Website
                                |
                                +--text--> Groq API --summary--> back to the browser
```

1. **Frontend** (React + Vite): input field, "Summarize" button, and a "Loading..." state.
2. **Backend** (Node.js + Express): `POST /api/summarize` receives the URL.
3. **Scraping** (axios + cheerio): downloads the HTML and extracts headings, paragraphs and list items.
4. **AI** (Groq free API, Llama 3.3 70B): turns the text into a short summary.
5. **Display**: the summary is shown as an intro sentence plus bullet points.

## Project structure

```
ai-web-scraper/
├── backend/
│   ├── server.js       # Express server and the /api/summarize endpoint
│   ├── scraper.js      # URL validation + page scraping
│   ├── summarizer.js   # Groq API call
│   └── .env.example    # Copy to .env and add your key
└── frontend/
    └── src/
        ├── App.jsx     # UI and logic
        └── App.css     # Styling
```

## Setup

You need [Node.js](https://nodejs.org) 18 or newer.

### 1. Get a free Groq API key
Go to https://console.groq.com/keys, sign up with your email, and click **Create API Key**. No credit card is needed.

### 2. Start the backend
```bash
cd backend
npm install
cp .env.example .env      # on Windows: copy .env.example .env
# open .env and paste your key after GROQ_API_KEY=
npm start
```
It runs on http://localhost:5000.

### 3. Start the frontend (in a second terminal)
```bash
cd frontend
npm install
npm run dev
```
Open http://localhost:5173, paste a URL and click **Summarize**.

## Notes and limitations

- Only basic HTML is scraped. Pages that need JavaScript to show content, or that block bots, may fail with a friendly error message.
- Only the first ~12,000 characters of a page are sent to the AI.
- The free Groq tier has rate limits. If you see a rate-limit message, wait a minute.
- The API key stays on the server in `.env` and is never sent to the browser. `.env` is listed in `.gitignore`.

## Tech stack

React, Vite, Node.js, Express, axios, cheerio, Groq API
