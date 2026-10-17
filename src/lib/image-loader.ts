"use client";

type LoaderArgs = { src: string; width: number; quality?: number };

export default function imageLoader({ src, width, quality }: LoaderArgs) {
  if (src.startsWith("https://images.unsplash.com/")) {
    const height = Math.round(width * 1.25);
    const params = new URLSearchParams({
      w: String(width),
      h: String(height),
      fit: "crop",
      crop: "faces",
      auto: "format",
      q: String(quality ?? 72),
    });
    return `${src}?${params}`;
  }
  return `${src}${src.includes("?") ? "&" : "?"}w=${width}`;
}
