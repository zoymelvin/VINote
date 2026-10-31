import * as React from "react";
import { Icon, IconTile } from "@/components/icons";

const ICON_MAP: Record<string, string> = {
  "📁": "Folder",
  "💼": "Briefcase",
  "🏠": "House",
  "💡": "Lightbulb",
  "🎨": "Palette",
  "📚": "Books",
  "🎯": "Target",
  "✈️": "AirplaneTilt",
  "💪": "Barbell",
  "🧘": "FlowerLotus",
};

const COLLECTION_HUES = [355, 330, 295, 265, 235, 195, 160, 125] as const;

function hashHue(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h << 5) - h + str.charCodeAt(i);
  return COLLECTION_HUES[Math.abs(h) % COLLECTION_HUES.length];
}

export function CollectionIcon({ icon, color, size = 28 }: { icon?: string; color?: string; size?: number }) {
  const hue = color ? parseInt(color.replace("#", ""), 16) % 360 : hashHue(icon || "folder");
  const phosphorName = ICON_MAP[icon || ""] || "Folder";
  const IconComp = require("@phosphor-icons/react")[phosphorName] || require("@phosphor-icons/react").Folder;
  const isDark = typeof document !== "undefined" && document.documentElement.classList.contains("dark");
  const bg = isDark ? `oklch(0.30 0.06 ${hue})` : `oklch(0.94 0.04 ${hue})`;
  const fg = isDark ? `oklch(0.80 0.12 ${hue})` : `oklch(0.45 0.14 ${hue})`;
  return (
    <div
      className="flex items-center justify-center rounded-xl"
      style={{ width: size, height: size, background: bg, color: fg }}
    >
      <Icon icon={IconComp} size={size * 0.6} weight="duotone" />
    </div>
  );
}
