import React, { useState, useEffect } from "react";
import Head from "next/head";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [response, setResponse] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    console.log("Full response from backend:", response);
  }, [response]);

  const handleGenerate = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("https://chromos-backendv3.onrender.com/generate-luma", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      console.log("Full response from backend:", data);

      if (!data || typeof data !== "object" || data.error) {
        setError(data?.error || "Invalid backend response.");
        setResponse(null);
        return;
      }

      setResponse(data);
    } catch (err: any) {
      setError("Failed to generate palette. Try again later.");
      setResponse(null);
    } finally {
      setLoading(false);
    }
  };

  const safeLabel = response?.label ?? "";
  const safePalette = Array.isArray(response?.palette) ? response.palette : [];
  const safeTags = Array.isArray(response?.tags) ? response.tags : [];
  const safeNarrative = response?.narrative ?? "";

  return (
    <>
      <Head>
        <title>Chromos</title>
      </Head>
      <main style={{ minHeight: "100vh", padding: "48px", backgroundColor: "#f9f9f9" }}>
        <div style={{ maxWidth: "1200px", margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "24px" }}>
            <input
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. A ceremonial tapestry woven in the highlands of Peru — sacred, earthy, celebratory"
              style={{ flex: 1, padding: "12px 16px", fontSize: "1rem", borderRadius: "12px", border: "1px solid #ccc" }}
            />
            <button
              onClick={handleGenerate}
              disabled={loading}
              style={{ marginLeft: "12px", padding: "12px 20px", backgroundColor: "black", color: "white", borderRadius: "12px", fontWeight: "bold", fontSize: "1rem" }}
            >
              {loading ? "..." : "➤"}
            </button>
          </div>

          {safeLabel && (
            <h2 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "1.5rem" }}>{safeLabel}</h2>
          )}

          {safePalette.length > 0 && (
            <>
              <h3 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1rem" }}>Your Palette</h3>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(5, 1fr)",
                gap: "1.5rem"
              }}>
                {safePalette.map((color: any, index: number) => (
                  <div
                    key={index}
                    style={{
                      backgroundColor: "white",
                      borderRadius: "16px",
                      overflow: "hidden",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.12)",
                      transition: "all 0.3s ease"
                    }}
                  >
                    <div style={{ height: "100px", backgroundColor: color?.hex ?? "#ccc" }} />
                    <div style={{ padding: "1rem" }}>
                      <div style={{ fontFamily: "monospace", fontSize: "0.85rem", fontWeight: 600, marginBottom: "0.5rem" }}>
                        {color?.chromakey ?? "CK-UNKNOWN"}
                      </div>
                      <p style={{ fontSize: "0.95rem", lineHeight: 1.4, marginBottom: "0.75rem" }}>{color?.reason ?? "No reason provided."}</p>
                      <div style={{ fontSize: "0.75rem", fontFamily: "monospace", color: "#555", marginBottom: "0.25rem" }}>
                        {Array.isArray(color?.chromakeys) && color.chromakeys.length > 0
                          ? color.chromakeys.join(" • ")
                          : "unknown"}
                      </div>
                      <div style={{ fontSize: "0.75rem", fontFamily: "monospace", color: "#999" }}>
                        {color?.hex ?? "#"}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}

          {safeTags.length > 0 && (
            <div style={{ marginTop: "2rem" }}>
              <h3 style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>Tags</h3>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                {safeTags.map((tag: string, i: number) => (
                  <span
                    key={i}
                    style={{ backgroundColor: "#eee", padding: "6px 12px", borderRadius: "999px", fontSize: "0.85rem" }}
                  >
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}

          {safeNarrative && (
            <div style={{ marginTop: "2rem" }}>
              <h3 style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>Narrative</h3>
              <p style={{ lineHeight: 1.6 }}>{safeNarrative}</p>
            </div>
          )}
        </div>
      </main>
    </>
  );
}