import React, { useState } from "react";
import Head from "next/head";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [responses, setResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleKeyPress = (
    e: React.KeyboardEvent<HTMLTextAreaElement>,
    type: "main" | "chat",
    idx?: number
  ) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      type === "main" ? handleMainGenerate() : handleIslaQuery();
    }
  };

  const handleMainGenerate = async () => {
    if (!prompt.trim()) return;
    setLoading(true);
    setError("");
    try {
      const res = await fetch("https://chromos-backendv3.onrender.com/generate-luma", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt })
      });
      const data = await res.json();
      if (!data || data.error) {
        setError(data?.error || "Invalid backend response.");
        return;
      }
      setResponses([{ prompt, ...data }]);
    } catch {
      setError("Failed to generate palette.");
    } finally {
      setLoading(false);
    }
  };

  const handleIslaQuery = async () => {
    if (!chatInput.trim()) return;
    setLoading(true);
    setError("");

    const context = {
      label: responses[0]?.label || "",
      tags: responses[0]?.tags || [],
      tone: "resilient"
    };

    try {
      const res = await fetch("https://chromos-backendv3.onrender.com/chat-isla", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          prompt: chatInput,
          context,
          thread: responses.map((r) => ({
            user: r.user,
            isla: r.reply
          }))
        })
      });
      const data = await res.json();
      if (!data || data.error) {
        setError(data?.error || "Invalid Isla response.");
        return;
      }
      setResponses((prev) => [
        ...prev,
        {
          user: chatInput,
          reply: data.reply,
          label: "Isla Response",
          narrative: data.narrative || "",
          tags: data.tags || [],
          paletteName: data.paletteName,
          mood: data.mood,
          idealUse: data.idealUse,
          palette: data.colors
        }
      ]);
    } catch {
      setError("Isla failed to respond.");
    } finally {
      setChatInput("");
      setLoading(false);
    }
  };

  return (
    <>
      <Head><title>Chromos</title></Head>
      <main style={{ padding: "48px", maxWidth: "1000px", margin: "0 auto" }}>
        <div style={{ marginBottom: "48px", display: "flex", flexDirection: "column", alignItems: "center" }}>
          <h1 style={{ fontSize: "2rem", fontWeight: "bold", marginBottom: "12px" }}>Chromos</h1>
          <div style={{ width: "100%", display: "flex" }}>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              onKeyDown={(e) => handleKeyPress(e, "main")}
              placeholder="Describe a feeling. I’ll translate it to color."
              rows={2}
              style={{
                flex: 1,
                padding: "12px 16px",
                fontSize: "1rem",
                borderRadius: "12px",
                border: "1px solid #ccc"
              }}
            />
            <button
              onClick={handleMainGenerate}
              disabled={loading}
              style={{ marginLeft: "12px", padding: "12px 20px", backgroundColor: "black", color: "white", borderRadius: "12px", fontWeight: "bold", fontSize: "1rem" }}
            >
              {loading ? "..." : "➤"}
            </button>
          </div>
        </div>

        {responses.map((res, idx) => (
          <div key={idx} style={{ marginBottom: "4rem" }}>
            <h2 style={{ fontSize: "2rem", fontWeight: 700 }}>{decodeURIComponent(res.label)}</h2>
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: "1rem", marginTop: "1.5rem" }}>
              {res.palette?.map((color: any, i: number) => (
                <div key={i} style={{ backgroundColor: "#fff", borderRadius: "12px", boxShadow: "0 1px 4px rgba(0,0,0,0.1)", overflow: "hidden" }}>
                  <div style={{ height: "80px", backgroundColor: color?.hex || "#ccc" }} />
                  <div style={{ padding: "12px" }}>
                    <div style={{ fontWeight: 700 }}>{color?.chromakey || "CK-UNKNOWN"}</div>
                    <div style={{ fontSize: "0.85rem", color: "#777" }}>HEX {color?.hex}</div>
                    <p style={{ fontSize: "0.9rem", marginTop: "6px" }}>{color?.reason}</p>
                  </div>
                </div>
              ))}
            </div>
            {res.narrative && (
              <div style={{ backgroundColor: "#fff8f1", padding: "1.5rem", marginTop: "2rem", borderLeft: "6px solid #d17f3f", borderRadius: "12px", fontSize: "1.05rem" }}>
                <h3 style={{ fontWeight: 600, marginBottom: "0.5rem" }}>✨ Interpretive Narrative</h3>
                <p>{res.narrative}</p>
              </div>
            )}
            {Array.isArray(res.tags) && res.tags.length > 0 && (
              <div style={{ marginTop: "1rem" }}>
                <h4 style={{ fontWeight: "bold" }}>Tags</h4>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem", marginTop: "0.5rem" }}>
                  {res.tags.map((tag: string, i: number) => (
                    <span key={i} style={{ backgroundColor: "#eee", padding: "6px 12px", borderRadius: "999px", fontSize: "0.85rem" }}>{tag}</span>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}

        {responses.length > 0 && (
          <div style={{ display: "flex", marginTop: "2rem", borderTop: "1px solid #ddd", paddingTop: "2rem" }}>
            <textarea
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => handleKeyPress(e, "chat")}
              placeholder="Ask Isla to evolve this palette, explain color intent, or generate variations..."
              rows={2}
              style={{ flex: 1, padding: "12px 16px", fontSize: "1rem", borderRadius: "12px", border: "1px solid #ccc" }}
            />
            <button
              onClick={handleIslaQuery}
              disabled={loading}
              style={{ marginLeft: "12px", padding: "12px 20px", backgroundColor: "#333", color: "white", borderRadius: "12px", fontWeight: "bold", fontSize: "1rem" }}
            >
              {loading ? "..." : "➤"}
            </button>
          </div>
        )}

        {error && <p style={{ color: "red", marginTop: "1rem" }}>{error}</p>}
      </main>
    </>
  );
}
