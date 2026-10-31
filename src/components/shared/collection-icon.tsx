import * as React from "react";
import { Icon } from "@/components/icons";
import { IconWeight } from "@phosphor-icons/react";
import { Folder, Briefcase, House, Lightbulb, Palette, Books, Target, AirplaneTilt, Barbell, FlowerLotus, Brain, Robot, Code, Rocket, Heart, Star, GraduationCap, ShoppingCart, Camera, MusicNotes, GameController, Leaf, CurrencyCircleDollar, Atom, Flask, Bookmark, Calendar, ChartLineUp, Globe, Wrench, ForkKnife, FilmSlate } from "@phosphor-icons/react";

const ICON_CATALOG: Record<string, React.ComponentType<{ size?: number; weight?: IconWeight; className?: string; [key: string]: unknown }>> = {
  Folder, Briefcase, House, Lightbulb, Palette, Books, Target, AirplaneTilt, Barbell, FlowerLotus,
  Brain, Robot, Code, Rocket, Heart, Star, GraduationCap, ShoppingCart, Camera, MusicNotes,
  GameController, Leaf, CurrencyCircleDollar, Atom, Flask, Bookmark, Calendar, ChartLineUp, Globe, Wrench, ForkKnife, FilmSlate,
};

const EMOJI_MAP: Record<string, string> = {
  "📁": "Folder", "💼": "Briefcase", "🏠": "House", "💡": "Lightbulb", "🎨": "Palette",
  "📚": "Books", "🎯": "Target", "✈️": "AirplaneTilt", "💪": "Barbell", "🧘": "FlowerLotus",
};

function hashHue(str: string): number {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (h << 5) - h + str.charCodeAt(i);
  const hues = [355, 330, 295, 265, 235, 195, 160, 125, 95, 55];
  return hues[Math.abs(h) % hues.length];
}

export function CollectionIcon({ icon, color, size = 28 }: { icon?: string; color?: string; size?: number }) {
  const hue = color ? parseInt(color.replace("#", ""), 16) % 360 : hashHue(icon || "folder");
  const phosphorName = EMOJI_MAP[icon || ""] || icon || "Folder";
  const IconComp = ICON_CATALOG[phosphorName] || Folder;
  const isDark = typeof document !== "undefined" && document.documentElement.classList.contains("dark");
  const bg = isDark ? `oklch(0.30 0.06 ${hue})` : `oklch(0.72 0.17 ${hue})`;
  const bg2 = isDark ? `oklch(0.25 0.05 ${hue})` : `oklch(0.60 0.19 ${hue})`;
  const fg = isDark ? `oklch(0.80 0.12 ${hue})` : "oklch(0.98 0.01 0)";
  const iconSize = Math.round(size * 0.5);
  return (
    <div
      className="flex items-center justify-center rounded-xl shadow-sm"
      style={{
        width: size,
        height: size,
        background: `linear-gradient(135deg, ${bg}, ${bg2})`,
        color: fg,
      }}
    >
      <Icon icon={IconComp} size={iconSize} weight="duotone" />
    </div>
  );
}
