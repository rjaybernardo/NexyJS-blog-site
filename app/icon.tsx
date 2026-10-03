import { ImageResponse } from "next/og";

import { APP_NAME } from "@/lib/constants";

export const size = { width: 64, height: 64 };
export const contentType = "image/png";

// The header's monogram as the browser tab icon
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#161616",
          color: "#f6f5f1",
          borderRadius: 12,
          fontSize: 40,
          fontWeight: 700,
        }}
      >
        {APP_NAME.replace(/^the\s+/i, "").charAt(0).toUpperCase()}
      </div>
    ),
    size,
  );
}
