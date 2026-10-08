import { useState } from "react";

export default function App() {
  const [url, setUrl] = useState("");        // what the user typed
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null); // { title, url, summary }
  const [error, setError] = useState("");

  async function handleSubmit(event) {
    event.preventDefault();
    if (!url.trim()) {
      setError("Paste a link first.");
      return;
    }

    setLoading(true);
    setError("");
    setResult(null);

    try {
      const API_URL = import.meta.env.VITE_API_URL || "";

const response = await fetch(`${API_URL}/api/summarize`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url }),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.error || "Request failed.");
      setResult(data);
    } catch (err) {
      setError(err.message || "Could not reach the server. Is the backend running?");
    } finally {
      setLoading(false); // always stop the loading state
    }
  }

  // Turn "- point" lines from the AI into a real list
  function renderSummary(text) {
    const lines = text.split("\n").map((l) => l.trim()).filter(Boolean);
    const intro = lines.filter((l) => !l.startsWith("-") && !l.startsWith("*"));
    const bullets = lines
      .filter((l) => l.startsWith("-") || l.startsWith("*"))
      .map((l) => l.replace(/^[-*]\s*/, "").replace(/\*\*/g, ""));

    return (
      <>
        {intro.map((line, i) => (
          <p key={i} className="summary-intro">{line.replace(/\*\*/g, "")}</p>
        ))}
        {bullets.length > 0 && (
          <ul>
            {bullets.map((b, i) => <li key={i}>{b}</li>)}
          </ul>
        )}
      </>
    );
  }

  return (
    <main className="page">
      <header>
        <h1>Summarize any web page</h1>
        <p className="lead">Paste a link and get the key points in a few seconds.</p>
      </header>

      <form onSubmit={handleSubmit} className="search">
        <label htmlFor="url" className="visually-hidden">Web page URL</label>
        <input
          id="url"
          type="url"
          placeholder="https://en.wikipedia.org/wiki/Web_scraping"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Loading..." : "Summarize"}
        </button>
      </form>

      {loading && (
        <div className="status" role="status">
          <span className="spinner" aria-hidden="true" />
          Loading... reading the page and writing your summary
        </div>
      )}

      {error && <div className="error" role="alert">{error}</div>}

      {result && (
        <article className="result">
          <h2>{result.title}</h2>
          <a href={result.url} target="_blank" rel="noreferrer">{result.url}</a>
          <div className="summary">{renderSummary(result.summary)}</div>
        </article>
      )}
    </main>
  );
}
