'use client';
import React, { useState } from 'react';

interface LumaColor {
  hex: string;
  reason: string;
}

interface LumaResponse {
  label: string;
  palette: LumaColor[];
  tags: string[];
  narrative: string;
}

export default function LumaGenerator() {
  const [prompt, setPrompt] = useState('');
  const [result, setResult] = useState<LumaResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    setLoading(true);
    setError(null);
    setResult(null);
    try {
      const res = await fetch("http://localhost:10000/generate-luma", {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      if (!res.ok) throw new Error(`Server error: ${res.statusText}`);
      const data = await res.json();
      setResult(data);
    } catch (err: any) {
      setError(err.message || 'Something went wrong.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold text-center">Chromos LUMA Generator</h1>

      <textarea
        className="w-full p-4 border border-gray-300 rounded-lg text-base"
        rows={4}
        placeholder="Describe your emotional or cultural prompt here..."
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
      />

      <button
        onClick={handleSubmit}
        disabled={loading || !prompt}
        className="bg-black text-white px-6 py-3 rounded-xl font-medium hover:bg-gray-800 transition"
      >
        {loading ? 'Generating...' : 'Generate Palette'}
      </button>

      {error && <p className="text-red-500">{error}</p>}

      {result && (
        <div className="space-y-6 mt-8">
          <h2 className="text-xl font-semibold">{result.label}</h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {result.palette.map((color, idx) => (
              <div key={idx} className="rounded-xl overflow-hidden border border-gray-200 shadow-sm">
                <div className="h-24" style={{ backgroundColor: color.hex }} />
                <div className="p-3 space-y-1">
                  <p className="font-medium">{color.hex}</p>
                  <p className="text-sm text-gray-600">{color.reason}</p>
                </div>
              </div>
            ))}
          </div>

          <div>
            <h3 className="text-md font-semibold mb-1">Tags</h3>
            <div className="flex flex-wrap gap-2">
              {result.tags.map((tag, idx) => (
                <span key={idx} className="bg-gray-200 text-sm px-3 py-1 rounded-full">{tag}</span>
              ))}
            </div>
          </div>

          <div>
            <h3 className="text-md font-semibold mb-1">Narrative</h3>
            <p className="text-gray-700 text-base">{result.narrative}</p>
          </div>
        </div>
      )}
    </div>
  );
}
