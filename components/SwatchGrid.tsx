import React from "react";

interface Swatch {
  hex: string;
  name?: string;
  reason?: string;
}

interface SwatchGridProps {
  swatches: Swatch[];
}

export const SwatchGrid: React.FC<SwatchGridProps> = ({ swatches }) => {
  return (
    <div style={{ display: "flex", gap: 12 }}>
      {swatches.map((swatch, index) => (
        <div key={index} style={{ textAlign: "center" }}>
          <div
            style={{
              backgroundColor: swatch.hex,
              width: 64,
              height: 64,
              borderRadius: 8,
            }}
          ></div>
          <div style={{ marginTop: 6 }}>{swatch.hex}</div>
          <div style={{ fontSize: 12 }}>{swatch.reason}</div>
        </div>
      ))}
    </div>
  );
};
