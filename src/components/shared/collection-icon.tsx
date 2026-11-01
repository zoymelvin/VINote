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

export function CollectionIcon({ icon, size = 28 }: { icon?: string; color?: string; size?: number }) {
  const phosphorName = EMOJI_MAP[icon || ""] || icon || "Folder";
  const IconComp = ICON_CATALOG[phosphorName] || Folder;
  const radius = size <= 24 ? 8 : size <= 40 ? 12 : 16;
  const iconSize = Math.round(size * 0.5);
  return (
    <div
      className="flex items-center justify-center"
      style={{
        width: size,
        height: size,
        borderRadius: radius,
        background: "color-mix(in oklch, var(--accent) 18%, var(--surface))",
        border: "1px solid color-mix(in oklch, var(--accent) 25%, transparent)",
        color: "var(--accent)",
      }}
    >
      <Icon icon={IconComp} size={iconSize} weight="duotone" />
    </div>
  );
}