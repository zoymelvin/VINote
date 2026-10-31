import * as React from "react";
import { Icon } from "@/components/icons";
import { IconWeight } from "@phosphor-icons/react";
import { NotePencil, CheckSquare, MarkdownLogo, CodeBlock, Lightning, BookOpenText, Microphone, Scribble, Bookmark, Layout } from "@phosphor-icons/react";

const NOTE_TYPE_ICON: Record<string, React.ComponentType<{ size?: number; weight?: IconWeight; className?: string; [key: string]: unknown }>> = {
  text: NotePencil,
  checklist: CheckSquare,
  markdown: MarkdownLogo,
  code: CodeBlock,
  quick: Lightning,
  journal: BookOpenText,
  voice: Microphone,
  drawing: Scribble,
  bookmark: Bookmark,
  template: Layout,
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
