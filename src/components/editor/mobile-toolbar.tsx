"use client";
import * as React from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/icons";
import { TextHOne, TextHTwo, TextHThree, TextB, TextItalic, TextUnderline, TextStrikethrough, CodeBlock, ListBullets, ListNumbers, CheckSquare, Quotes, BracketsSquare, AlignLeft, TextAlignCenter, AlignRight, TextAlignJustify, ImageSquare, CaretDown } from "@phosphor-icons/react";
import type { Editor } from "@tiptap/core";

const TOOLS = [
  { icon: TextHOne, label: "Judul 1", action: "heading-1" },
  { icon: TextB, label: "Tebal", action: "bold" },
  { icon: TextItalic, label: "Miring", action: "italic" },
  { icon: TextUnderline, label: "Garis bawah", action: "underline" },
  { icon: ListBullets, label: "Bullet", action: "bullet" },
  { icon: ListNumbers, label: "Bernomor", action: "ordered" },
  { icon: CheckSquare, label: "Checklist", action: "task" },
  { icon: ImageSquare, label: "Gambar", action: "image" },
];

export function MobileEditorToolbar({ editor, onTogglePanel, panelOpen }: { editor: Editor | null; onTogglePanel: () => void; panelOpen: boolean }) {
  if (!editor) return null;
  const ed = editor;

  const toggle = (action: string) => {
    if (action.startsWith("heading-")) {
      ed.chain().focus().toggleHeading({ level: parseInt(action.split("-")[1]) as 1 | 2 | 3 }).run();
    } else if (action === "bold") {
      ed.chain().focus().toggleBold().run();
    } else if (action === "italic") {
      ed.chain().focus().toggleItalic().run();
    } else if (action === "underline") {
      ed.chain().focus().toggleUnderline().run();
    } else if (action === "bullet") {
      ed.chain().focus().toggleBulletList().run();
    } else if (action === "ordered") {
      ed.chain().focus().toggleOrderedList().run();
    } else if (action === "task") {
      ed.chain().focus().toggleTaskList().run();
    } else if (action === "image") {
      const input = document.createElement("input");
      input.type = "file";
      input.accept = "image/*";
      input.onchange = (e) => {
        const file = (e.target as HTMLInputElement).files?.[0];
        if (file) {
          const reader = new FileReader();
          reader.onload = () => ed.chain().focus().setImage({ src: reader.result as string }).run();
          reader.readAsDataURL(file);
        }
      };
      input.click();
    }
  };

  return (
    <div className="md:hidden">
      <div
        className="flex items-center border-t border-[var(--border)] bg-[var(--card)]"
        style={{
          height: "48px",
          position: "sticky",
          top: "calc(52px + env(safe-area-inset-top))",
          zIndex: 20,
        }}
      >
        <div className="flex flex-1 items-center gap-1 overflow-x-auto overflow-y-hidden px-2 scrollbar-none" style={{ scrollbarWidth: "none" }}>
          {TOOLS.map((t) => (
            <button
              key={t.action}
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => toggle(t.action)}
              className={cn(
                "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
                ed.isActive(t.action) ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "text-[var(--text-muted)]"
              )}
              aria-label={t.label}
            >
              <Icon icon={t.icon} size={18} weight="regular" />
            </button>
          ))}
        </div>
        <div className="flex h-full w-px shrink-0 bg-[var(--border)]" />
        <button
          onMouseDown={(e) => e.preventDefault()}
          onClick={onTogglePanel}
          className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-transform", panelOpen && "rotate-180")}
          aria-label="Panel"
        >
          <Icon icon={CaretDown} size={18} weight="regular" />
        </button>
      </div>
      <div
        className="grid bg-[var(--card)]"
        style={{
          gridTemplateRows: panelOpen ? "1fr" : "0fr",
          opacity: panelOpen ? 1 : 0,
          transition: "grid-template-rows 240ms cubic-bezier(.2,.8,.2,1), opacity 200ms",
        }}
      >
        <div className="overflow-hidden" style={{ minHeight: 0 }}>
          <div className="flex flex-wrap items-center gap-1 border-t border-[var(--border)] p-2">
            <button onMouseDown={(e) => e.preventDefault()} onClick={() => ed.chain().focus().toggleHeading({ level: 1 }).run()} className={cn("flex h-10 w-10 items-center justify-center rounded-lg", ed.isActive("heading", { level: 1 }) ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "text-[var(--text-muted)]")}><Icon icon={TextHOne} size={18} /></button>
            <button onMouseDown={(e) => e.preventDefault()} onClick={() => ed.chain().focus().toggleHeading({ level: 2 }).run()} className={cn("flex h-10 w-10 items-center justify-center rounded-lg", ed.isActive("heading", { level: 2 }) ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "text-[var(--text-muted)]")}><Icon icon={TextHTwo} size={18} /></button>
            <button onMouseDown={(e) => e.preventDefault()} onClick={() => ed.chain().focus().toggleHeading({ level: 3 }).run()} className={cn("flex h-10 w-10 items-center justify-center rounded-lg", ed.isActive("heading", { level: 3 }) ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "text-[var(--text-muted)]")}><Icon icon={TextHThree} size={18} /></button>
            <span className="w-px h-6 bg-[var(--border)]" />
            <button onMouseDown={(e) => e.preventDefault()} onClick={() => ed.chain().focus().toggleBold().run()} className={cn("flex h-10 w-10 items-center justify-center rounded-lg", ed.isActive("bold") ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "text-[var(--text-muted)]")}><Icon icon={TextB} size={18} /></button>
            <button onMouseDown={(e) => e.preventDefault()} onClick={() => ed.chain().focus().toggleItalic().run()} className={cn("flex h-10 w-10 items-center justify-center rounded-lg", ed.isActive("italic") ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "text-[var(--text-muted)]")}><Icon icon={TextItalic} size={18} /></button>
            <button onMouseDown={(e) => e.preventDefault()} onClick={() => ed.chain().focus().toggleUnderline().run()} className={cn("flex h-10 w-10 items-center justify-center rounded-lg", ed.isActive("underline") ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "text-[var(--text-muted)]")}><Icon icon={TextUnderline} size={18} /></button>
            <button onMouseDown={(e) => e.preventDefault()} onClick={() => ed.chain().focus().toggleStrike().run()} className={cn("flex h-10 w-10 items-center justify-center rounded-lg", ed.isActive("strike") ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "text-[var(--text-muted)]")}><Icon icon={TextStrikethrough} size={18} /></button>
            <button onMouseDown={(e) => e.preventDefault()} onClick={() => ed.chain().focus().toggleCode().run()} className={cn("flex h-10 w-10 items-center justify-center rounded-lg", ed.isActive("code") ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "text-[var(--text-muted)]")}><Icon icon={CodeBlock} size={18} /></button>
            <span className="w-px h-6 bg-[var(--border)]" />
            <button onMouseDown={(e) => e.preventDefault()} onClick={() => ed.chain().focus().toggleBulletList().run()} className={cn("flex h-10 w-10 items-center justify-center rounded-lg", ed.isActive("bulletList") ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "text-[var(--text-muted)]")}><Icon icon={ListBullets} size={18} /></button>
            <button onMouseDown={(e) => e.preventDefault()} onClick={() => ed.chain().focus().toggleOrderedList().run()} className={cn("flex h-10 w-10 items-center justify-center rounded-lg", ed.isActive("orderedList") ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "text-[var(--text-muted)]")}><Icon icon={ListNumbers} size={18} /></button>
            <button onMouseDown={(e) => e.preventDefault()} onClick={() => ed.chain().focus().toggleTaskList().run()} className={cn("flex h-10 w-10 items-center justify-center rounded-lg", ed.isActive("taskList") ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "text-[var(--text-muted)]")}><Icon icon={CheckSquare} size={18} /></button>
            <button onMouseDown={(e) => e.preventDefault()} onClick={() => ed.chain().focus().toggleBlockquote().run()} className={cn("flex h-10 w-10 items-center justify-center rounded-lg", ed.isActive("blockquote") ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "text-[var(--text-muted)]")}><Icon icon={Quotes} size={18} /></button>
            <button onMouseDown={(e) => e.preventDefault()} onClick={() => ed.chain().focus().toggleCodeBlock().run()} className={cn("flex h-10 w-10 items-center justify-center rounded-lg", ed.isActive("codeBlock") ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "text-[var(--text-muted)]")}><Icon icon={BracketsSquare} size={18} /></button>
            <span className="w-px h-6 bg-[var(--border)]" />
            <button onMouseDown={(e) => e.preventDefault()} onClick={() => ed.chain().focus().setTextAlign("left").run()} className={cn("flex h-10 w-10 items-center justify-center rounded-lg", ed.isActive({ textAlign: "left" }) ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "text-[var(--text-muted)]")}><Icon icon={AlignLeft} size={18} /></button>
            <button onMouseDown={(e) => e.preventDefault()} onClick={() => ed.chain().focus().setTextAlign("center").run()} className={cn("flex h-10 w-10 items-center justify-center rounded-lg", ed.isActive({ textAlign: "center" }) ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "text-[var(--text-muted)]")}><Icon icon={TextAlignCenter} size={18} /></button>
            <button onMouseDown={(e) => e.preventDefault()} onClick={() => ed.chain().focus().setTextAlign("right").run()} className={cn("flex h-10 w-10 items-center justify-center rounded-lg", ed.isActive({ textAlign: "right" }) ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "text-[var(--text-muted)]")}><Icon icon={AlignRight} size={18} /></button>
            <button onMouseDown={(e) => e.preventDefault()} onClick={() => ed.chain().focus().setTextAlign("justify").run()} className={cn("flex h-10 w-10 items-center justify-center rounded-lg", ed.isActive({ textAlign: "justify" }) ? "bg-[var(--accent-soft)] text-[var(--accent)]" : "text-[var(--text-muted)]")}><Icon icon={TextAlignJustify} size={18} /></button>
          </div>
        </div>
      </div>
    </div>
  );
}
