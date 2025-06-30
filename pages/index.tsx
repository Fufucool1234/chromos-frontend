import React, { useState } from "react";
import Head from "next/head";

export default function Home() {
  const [prompt, setPrompt] = useState("");
  const [chatInput, setChatInput] = useState("");
  const [responses, setResponses] = useState<any[]>([]);
  const [islaReply, setIslaReply] = useState<string | null>(null);
  const [islaPalette, setIslaPalette] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [paletteLength, setPaletteLength] = useState(5);
  const [strictADA, setStrictADA] = useState(false);
  const [tonePreset, setTonePreset] = useState(""); // e.g., "sacred", "bold"


  const handleGenerate = async () => {
  if (!prompt.trim()) return;
  setLoading(true);
  setError("");
  try {
    const payload = {
      prompt: prompt,
      num_colors: paletteLength,
      strict_ada: strictADA,
      tone_preset: tonePreset,
    };

    const res = await fetch("https://chromosbackendv8.onrender.com/generate-luma", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (Array.isArray(data.palette)) {
      setResponses(data.palette); // ✅ safe array
    } else {
      console.error("Backend returned unexpected format:", data);
      setError("Unexpected response format.");
    }
  } catch (err) {
    setError("An error occurred.");
    console.error(err);
  } finally {
    setLoading(false);
  }
};


  const handleIslaQuery = async () => {
  if (!chatInput.trim()) return;
  setLoading(true);
  setError("");

  const context = {
    label: "",             // Optional – remove or set dynamically if needed
    tags: [],              // Optional – can be passed later
    tone: "resilient"      // Placeholder for now
  };

  try {
    const res = await fetch("https://chromos-backendv8.onrender.com/chat-isla", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: chatInput,
        context
      }),
    });

    const data = await res.json();

    if (!data || data.error) {
      setError(data?.error || "Invalid Isla response.");
      return;
    }

    console.log("Isla colors:", data.colors);

    setIslaReply(data.reply);
    setIslaPalette({
      paletteName: data.paletteName,
      mood: data.mood,
      idealUse: data.idealUse,
      colors: data.colors
    });

  } catch (err) {
    console.error(err);
    setError("Something went wrong.");
  } finally {
    setLoading(false);
  }
};


  return (
    <>
      <Head><title>Chromos</title></Head>
      <main style={{ padding: "48px", maxWidth: "1000px", margin: "0 auto" }}>
        <div style={{ marginBottom: "24px", display: "flex" }}>
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="e.g. A ceremonial tapestry woven in the Andes — sacred, earthy, solar-reverent"
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

        {/* Header + Settings Toggle */}
<div style={{ marginBottom: "24px", display: "flex", justifyContent: "space-between", alignItems: "center" }}>
  <h1 style={{ fontSize: "1.75rem", fontWeight: "bold" }}>Chromos</h1>
  <button onClick={() => setShowSettings(!showSettings)} style={{ fontSize: "0.9rem", padding: "8px 12px", borderRadius: "8px", backgroundColor: "#eee", border: "none" }}>
    {showSettings ? "Close Settings" : "Open Settings"}
  </button>
</div>

{showSettings && (
  <div style={{ marginBottom: "24px", padding: "16px", border: "1px solid #ddd", borderRadius: "12px", backgroundColor: "#fafafa" }}>
    <h3 style={{ fontSize: "1.2rem", fontWeight: 600, marginBottom: "0.75rem" }}>⚙️ Settings</h3>

    {/* ADA Strict Mode Toggle */}
    <div style={{ display: "flex", alignItems: "center", marginBottom: "1rem" }}>
      <input
        type="checkbox"
        id="ada-toggle"
        checked={strictADA}
        onChange={(e) => setStrictADA(e.target.checked)}
        style={{ marginRight: "10px" }}
      />
      <label htmlFor="ada-toggle" style={{ fontSize: "0.95rem" }}>Enable ADA Strict Mode</label>
    </div>

    {/* Palette Length Slider */}
    <div style={{ marginBottom: "1rem" }}>
      <label htmlFor="palette-length" style={{ display: "block", fontSize: "0.95rem", marginBottom: "6px" }}>
        Palette Length: {paletteLength} colors
      </label>
      <input
        type="range"
        id="palette-length"
        min="3"
        max="10"
        value={paletteLength}
        onChange={(e) => setPaletteLength(parseInt(e.target.value))}
        style={{ width: "100%" }}
      />
    </div>

    {/* Tone Preset Input */}
    <div>
      <label htmlFor="tone-preset" style={{ display: "block", fontSize: "0.95rem", marginBottom: "6px" }}>
        Tone Preset (optional)
      </label>
      <input
        id="tone-preset"
        type="text"
        placeholder="e.g. sacred, earthy, bold"
        value={tonePreset}
        onChange={(e) => setTonePreset(e.target.value)}
        style={{ width: "100%", padding: "8px", borderRadius: "8px", border: "1px solid #ccc" }}
      />
    </div>
  </div>
)}


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
                    
{/* ✅ Visual ADA Diff: Show if Color Changed */}
{res.original_palette && res.fixed_palette && res.original_palette[i] && res.fixed_palette[i] && res.original_palette[i].hex !== res.fixed_palette[i].hex && (
  <div style={{ fontSize: "0.8rem", marginTop: "6px", color: "#ff5722", fontWeight: "bold" }}>
    🔄 Changed for ADA Compliance
  </div>
)}
{res.original_palette && res.fixed_palette && res.original_palette[i] && res.fixed_palette[i] && res.original_palette[i].hex === res.fixed_palette[i].hex && (
  <div style={{ fontSize: "0.8rem", marginTop: "6px", color: "#4caf50", fontWeight: "bold" }}>
    ✅ Unchanged (ADA-safe)
  </div>
)}

<p style={{ fontSize: "0.9rem", marginTop: "6px" }}>{color?.reason}</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ backgroundColor: "#fff8f1", padding: "1.5rem", marginTop: "2rem", borderLeft: "6px solid #d17f3f", borderRadius: "12px", fontSize: "1.05rem" }}>
              <h3 style={{ fontWeight: 600, marginBottom: "0.5rem" }}>✨ Interpretive Narrative</h3>
              <p>{res.narrative}</p>
            </div>

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

        {islaReply && (
          <div style={{ marginTop: "2rem", borderTop: "1px solid #ddd", paddingTop: "2rem" }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 600, marginBottom: "1rem" }}>💬 Isla's Reply</h3>
            <p style={{ fontSize: "1.05rem", marginBottom: "1rem" }}>{islaReply}</p>

            {islaPalette && (
              <div>
                {islaPalette.paletteName && (
                  <h4 style={{ fontSize: "1.1rem", fontWeight: "bold", marginBottom: "0.5rem" }}>
                    🎨 Palette: {islaPalette.paletteName}
                  </h4>
                )}
                {islaPalette.mood && (
                  <p><strong>Mood:</strong> {islaPalette.mood}</p>
                )}
                {islaPalette.idealUse?.length > 0 && (
                  <p><strong>Ideal Use:</strong> {islaPalette.idealUse.join(", ")}</p>
                )}
                <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem", marginTop: "1rem" }}>
                  {islaPalette.colors?.map((color: any, i: number) => (
                    <div key={i} style={{ width: "180px", backgroundColor: "#fff", borderRadius: "12px", boxShadow: "0 1px 4px rgba(0,0,0,0.1)", overflow: "hidden" }}>
                      <div style={{ height: "80px", backgroundColor: color.hex || "#ccc" }} />
                      <div style={{ padding: "12px" }}>
                        <div style={{ fontWeight: 700 }}>{color.chromakey || "CK-UNKNOWN"}</div>
                        <div style={{ fontSize: "0.85rem", color: "#777" }}>HEX {color.hex}</div>
                        {color.ada && (
  <div style={{ fontSize: "0.8rem", color: "#444", marginTop: "6px" }}>
    <div><strong>Contrast W:</strong> {color.ada.contrast_white} ({color.ada.grade_white})</div>
    <div><strong>Contrast B:</strong> {color.ada.contrast_black} ({color.ada.grade_black})</div>
    <div><strong>Colorblind:</strong> {color.ada.colorblind_flag ? "⚠️ Risk" : "✓ Safe"}</div>
    <div style={{ fontStyle: "italic", marginTop: "4px" }}>{color.ada.notes}</div>
  </div>
)}

{/* ✅ ADA FIX BUTTON */}
{responses.length > 0 && (
  <div style={{ marginTop: "2rem" }}>
    <button
      onClick={async () => {
        try {
          const res = await fetch("https://chromosbackendv8.onrender.com/make-ada-compliant", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ palette: responses[0]?.palette || [] })
          });
          const data = await res.json();
          if (data && data.fixed_palette) {
            const updated = { ...responses[0], palette: data.fixed_palette };
            setResponses([updated]);
          }
        } catch (err) {
          alert("Error applying ADA fix.");
        }
      }}
      style={{ padding: "12px 20px", backgroundColor: "#4caf50", color: "white", borderRadius: "10px", fontWeight: "bold", fontSize: "1rem" }}
    >
      Apply ADA Fix (One-Click)
    </button>
  </div>
)}

{/* ✅ EXPORT PALETTE AS JSON */}
{responses.length > 0 && (
  <div style={{ marginTop: "1rem" }}>
    <button
      onClick={() => {
        const blob = new Blob([JSON.stringify(responses[0], null, 2)], { type: "application/json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "chromos_palette.json";
        a.click();
      }}
      style={{ marginTop: "1rem", padding: "10px 16px", backgroundColor: "#007bff", color: "white", borderRadius: "10px", fontWeight: "bold", fontSize: "1rem" }}
    >
      Download Palette (JSON)
    </button>
  </div>
)}


{/* ✅ Visual Diff: Toggle Original vs. ADA Fixed */}
{responses.length > 0 && (
  <div style={{ marginTop: "2rem" }}>
    <label style={{ fontWeight: "bold", fontSize: "1rem", marginRight: "12px" }}>
      View:
    </label>
    <button
      onClick={() => {
        const original = responses[0]?.original_palette || responses[0]?.palette;
        const current = responses[0]?.palette;

        const isShowingFixed = JSON.stringify(original) !== JSON.stringify(current);

        const toggled = {
          ...responses[0],
          palette: isShowingFixed ? original : responses[0]?.fixed_palette || original,
        };

        setResponses([toggled]);
      }}
      style={{ padding: "10px 16px", backgroundColor: "#ff9800", color: "white", borderRadius: "10px", fontWeight: "bold", fontSize: "1rem" }}
    >
      Toggle: ADA Fix ↔ Original
    </button>
  </div>
)}


                        <p style={{ fontSize: "0.9rem", marginTop: "6px" }}>{color.reason}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {responses.length > 0 && (
          <div style={{ display: "flex", marginTop: "2rem", borderTop: "1px solid #ddd", paddingTop: "2rem" }}>
            <input
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              placeholder="Ask Isla to evolve this palette, explain color intent, or generate variations..."
              style={{ flex: 1, padding: "12px 16px", fontSize: "1rem", borderRadius: "12px", border: "1px solid #ccc" }}
            />
            <button
              onClick={handleIslaQuery}
              disabled={loading}
              style={{ marginLeft: "12px", padding: "12px 20px", backgroundColor: "#333", color: "white", borderRadius: "12px", fontWeight: "bold", fontSize: "1rem" }}
            >
              {loading ? "..." : "Ask Isla"}
            </button>
          </div>
        )}

        {error && <p style={{ color: "red", marginTop: "1rem" }}>{error}</p>}
      </main>
    </>
  );
}
