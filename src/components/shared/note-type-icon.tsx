import * as React from "react";
import { Icon } from "@/components/icons";

const NOTE_TYPE_ICON: Record<string, typeof require("@phosphor-icons/react").NotePencil> = {
  text: require("@phosphor-icons/react").NotePencil,
  checklist: require("@phosphor-icons/react").CheckSquare,
  markdown: require("@phosphor-icons/react").MarkdownLogo,
  code: require("@phosphor-icons/react").CodeBlock,
  quick: require("@phosphor-icons/react").Lightning,
  journal: require("@phosphor-icons/react").BookOpenText,
  voice: require("@phosphor-icons/react").Microphone,
  drawing: require("@phosphor-icons/react").Scribble,
  bookmark: require("@phosphor-icons/react").Bookmark,
  template: require("@phosphor-icons/react").Layout,
};

const NOTE_TYPE_COLOR: Record<string, string> = {
  text: "oklch(0.55 0.22 265)",
  checklist: "oklch(0.55 0.18 160)",
  markdown: "oklch(0.55 0.22 295)",
  code: "oklch(0.55 0.2 235)",
  quick: "oklch(0.7 0.18 85)",
  journal: "oklch(0.55 0.22 330)",
  voice: "oklch(0.55 0.22 355)",
  drawing: "oklch(0.65 0.2 45)",
  bookmark: "oklch(0.55 0.2 235)",
  template: "oklch(0.55 0.02 265)",
};

export function NoteTypeIcon({ type, size = 20 }: { type: string; size?: number }) {
  const IconComp = NOTE_TYPE_ICON[type] || NOTE_TYPE_ICON.text;
  const color = NOTE_TYPE_COLOR[type] || "var(--text-muted)";
  return <Icon icon={IconComp} size={size} weight="regular" className="shrink-0" style={{ color }} />;
}
