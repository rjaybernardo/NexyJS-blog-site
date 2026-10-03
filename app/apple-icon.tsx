import { ImageResponse } from "next/og";

import { APP_NAME } from "@/lib/constants";

export const size = { width: 180, height: 180 };
export const contentType = "image/png";

// The header's monogram for iOS home screens
export default function AppleIcon() {
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
          borderRadius: 0,
          fontSize: 110,
          fontWeight: 700,
        }}
      >
        {APP_NAME.replace(/^the\s+/i, "").charAt(0).toUpperCase()}
      </div>
    ),
    size,
  );
}
