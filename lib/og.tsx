import { ImageResponse } from "next/og";

import { APP_NAME } from "@/lib/constants";

// Same two tones as app/globals.css
const INK = "#161616";
const PAPER = "#f6f5f1";
const MUTED = "#7a7975";

export const ogSize = { width: 1200, height: 630 };

const monogram = APP_NAME.replace(/^the\s+/i, "").charAt(0).toUpperCase();

// Social share card: site name on top, a big title, a line of detail below
export function renderOgImage({ title, detail }: { title: string; detail?: string }) {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          padding: 72,
          background: PAPER,
          color: INK,
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 18, fontSize: 30 }}>
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: 10,
              background: INK,
              color: PAPER,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              fontWeight: 700,
            }}
          >
            {monogram}
          </div>
          {APP_NAME}
        </div>
        <div
          style={{
            display: "flex",
            fontSize: title.length > 60 ? 60 : 76,
            lineHeight: 1.08,
            letterSpacing: -2,
            fontWeight: 600,
            maxWidth: 1000,
          }}
        >
          {title}
        </div>
        <div style={{ display: "flex", fontSize: 28, color: MUTED, maxWidth: 1000 }}>
          {detail ?? ""}
        </div>
      </div>
    ),
    ogSize,
  );
}
