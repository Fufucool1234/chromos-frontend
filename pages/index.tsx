import React, { useState } from "react";
import { PromptInput } from "../components/PromptInput";
import { SwatchGrid } from "../components/SwatchGrid";

interface Swatch {
  hex: string;
  name?: string;
  reason?: string;
}

export default function Home() {
  const [palette, setPalette] = useState<Swatch[]>([]);
  const [loading, setLoading] = useState(false);

  const handleGenerate = async (prompt: string) => {
    try {
      setLoading(true);
      const response = await fetch("https://chromos-backendv2.onrender.com/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ prompt }),
      });

      const data = await response.json();
      if (data && data.palette) {
        setPalette(data.palette);
      } else {
        console.error("Unexpected response format:", data);
      }
    } catch (error) {
      console.error("Error fetching from backend:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 48 }}>
      <h1 style={{ fontSize: 32, marginBottom: 24 }}>Chromos Prototype</h1>
      <PromptInput onGenerate={handleGenerate} />
      {loading ? (
        <p style={{ marginTop: 32 }}>Generating palette...</p>
      ) : (
        <div style={{ marginTop: 48 }}>
          <SwatchGrid swatches={palette} />
        </div>
      )}
    </div>
  );

