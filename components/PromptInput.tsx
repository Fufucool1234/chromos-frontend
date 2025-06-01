import React, { useState } from "react";

interface PromptInputProps {
  onGenerate: (prompt: string) => void;
}

export const PromptInput: React.FC<PromptInputProps> = ({ onGenerate }) => {
  const [prompt, setPrompt] = useState("");

  return (
    <div>
      <input
        value={prompt}
        onChange={(e) => setPrompt(e.target.value)}
        placeholder="Enter your color prompt..."
        style={{ width: 300, padding: 8 }}
      />
      <button onClick={() => onGenerate(prompt)} style={{ marginLeft: 12 }}>
        Generate
      </button>
    </div>
  );
};
