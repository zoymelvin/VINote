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

export function NoteTypeIcon({ type, size = 16, accent = false }: { type: string; size?: number; accent?: boolean }) {
  const IconComp = NOTE_TYPE_ICON[type] || NOTE_TYPE_ICON.text;
  return <Icon icon={IconComp} size={size} weight="regular" className={accent ? "text-[var(--accent)]" : "text-[var(--text-muted)]"} />;
}