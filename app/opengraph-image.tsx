import { APP_DESCRIPTION, APP_NAME } from "@/lib/constants";
import { ogSize, renderOgImage } from "@/lib/og";

export const alt = APP_NAME;
export const size = ogSize;
export const contentType = "image/png";

export default function Image() {
  return renderOgImage({ title: APP_DESCRIPTION, detail: "Blog" });
}
