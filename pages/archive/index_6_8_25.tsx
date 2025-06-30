import React, { useState } from "react";
import Head from "next/head";

interface LumaResponse {
  id: string;
  parentId: string | null;
  prompt: string;
  label: string;
  palette: {
    hex: string;
    reason: string;
    chromakey?: string;
    tags?: string[];
  }[];
  tags: string[];
  narrative: string;
}

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [responses, setResponses] = useState<LumaResponse[]>([]);
  const [loading, setLoading] = useState(false);

  const decodeHTML = (str: string) => {
    try {
      return decodeURIComponent(escape(str));
    } catch {
      return str;
    }
  };

  const handleGenerate = async (promptText: string, parentId: string | null = null) => {
    setLoading(true);
    try {
      const res = await fetch("https://chromos-backendv3.onrender.com/generate-luma", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt: promptText }),
      });

      const data = await res.json();

      const newBlock: LumaResponse = {
        id: Math.random().toString(36).substr(2, 9),
        parentId,
        prompt: promptText,
        label: data.label ?? promptText,
        palette: Array.isArray(data.palette) ? data.palette : [],
        tags: Array.isArray(data.tags) ? data.tags : [],
        narrative: data.narrative ?? "",
      };

      if (parentId === null) {
        setResponses([newBlock]); // clear all previous on main prompt change
      } else {
        setResponses((prev) => [...prev, newBlock]);
      }
    } catch (err) {
      alert("Something went wrong. Try again later.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head><title>Chromos</title></Head>
      <main style={{ minHeight: "100vh", padding: "48px", backgroundColor: "#f9f9f9" }}>
        <div style={{ maxWidth: "900px", margin: "0 auto" }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: "36px" }}>
            <input
              id="prompt"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="e.g. A ceremonial tapestry woven in the highlands of Peru — sacred, earthy, celebratory"
              style={{ flex: 1, padding: "12px 16px", fontSize: "1rem", borderRadius: "12px", border: "1px solid #ccc" }}
            />
            <button
              onClick={() => handleGenerate(prompt)}
              disabled={loading}
              style={{ marginLeft: "12px", padding: "12px 20px", backgroundColor: "black", color: "white", borderRadius: "12px", fontWeight: "bold", fontSize: "1rem" }}
            >
              {loading ? "..." : "➤"}
            </button>
          </div>

          {responses.map((block) => (
            <div key={block.id} style={{ marginBottom: "64px" }}>
              <h2 style={{ fontSize: "2rem", fontWeight: 700, marginBottom: "1.5rem" }}>{decodeHTML(block.label)}</h2>

              <h3 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1rem" }}>Your Palette</h3>
              <div style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))",
                gap: "1.5rem"
              }}>
                {block.palette.map((color, i) => (
                  <div key={i} style={{
                    backgroundColor: "white",
                    borderRadius: "16px",
                    overflow: "hidden",
                    boxShadow: "0 2px 6px rgba(0,0,0,0.12)"
                  }}>
                    <div style={{ height: "100px", backgroundColor: color.hex }} />
                    <div style={{ padding: "1rem" }}>
                      <div style={{
                        fontSize: "0.85rem",
                        fontWeight: 700,
                        marginBottom: "0.4rem",
                        color: "#000"
                      }}>
                        {color.chromakey ?? "CK-UNKNOWN"}
                      </div>
                      <div style={{
                        fontSize: "0.8rem",
                        fontFamily: "monospace",
                        color: "#555",
                        marginBottom: "0.4rem"
                      }}>
                        HEX: {color.hex}
                      </div>
                      <p style={{ fontSize: "0.95rem", lineHeight: 1.4 }}>{color.reason}</p>
                      {(color.tags ?? []).length > 0 && (
                        <div style={{
                          fontSize: "0.75rem",
                          color: "#888",
                          marginTop: "0.6rem"
                        }}>
                          {color.tags!.join(" • ")}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>

              {block.tags.length > 0 && (
                <div style={{ marginTop: "2rem" }}>
                  <h3 style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>Tags</h3>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
                    {block.tags.map((tag, i) => (
                      <span key={i} style={{
                        backgroundColor: "#eee",
                        padding: "6px 12px",
                        borderRadius: "999px",
                        fontSize: "0.85rem"
                      }}>{tag}</span>
                    ))}
                  </div>
                </div>
              )}

              {block.narrative && (
                <div style={{ marginTop: "2rem" }}>
                  <h3 style={{ fontWeight: "bold", marginBottom: "0.5rem" }}>Narrative</h3>
                  <p style={{ lineHeight: 1.6 }}>{block.narrative}</p>
                </div>
              )}

              <div style={{ marginTop: "2rem" }}>
                <input
                  placeholder="Evolve this direction..."
                  onKeyDown={(e) => {
                    if (e.key === "Enter") {
                      handleGenerate((e.target as HTMLInputElement).value, block.id);
                      setPrompt((e.target as HTMLInputElement).value);
                    }
                  }}
                  style={{
                    padding: "12px 16px",
                    width: "70%",
                    fontSize: "1rem",
                    borderRadius: "12px",
                    border: "1px solid #ccc"
                  }}
                />
                <span style={{ marginLeft: "0.75rem", color: "#666" }}>Press Enter to evolve</span>
              </div>
            </div>
          ))}
        </div>
      </main>
    </>
  );
}