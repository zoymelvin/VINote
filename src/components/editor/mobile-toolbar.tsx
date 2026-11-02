"use client";
import * as React from "react";
import { cn } from "@/lib/utils";
import { Icon } from "@/components/icons";
import { TextHOne, TextHTwo, TextHThree, TextB, TextItalic, TextUnderline, TextStrikethrough, CodeBlock, ListBullets, ListNumbers, CheckSquare, Quotes, BracketsSquare, AlignLeft, TextAlignCenter, AlignRight, TextAlignJustify, ImageSquare, CaretDown, ArrowCounterClockwise, ArrowClockwise, Link as PhosphorLinkIcon, Eraser } from "@phosphor-icons/react";
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

  // Panel items organized in 3 rows - only items NOT in the main bar
  const PANEL_ROW_1 = [
    { icon: TextHOne, label: "H1", action: () => ed.chain().focus().toggleHeading({ level: 1 }).run() },
    { icon: TextHTwo, label: "H2", action: () => ed.chain().focus().toggleHeading({ level: 2 }).run() },
    { icon: TextHThree, label: "H3", action: () => ed.chain().focus().toggleHeading({ level: 3 }).run() },
    { icon: TextStrikethrough, label: "Coret", action: () => ed.chain().focus().toggleStrike().run() },
    { icon: CodeBlock, label: "Kode", action: () => ed.chain().focus().toggleCode().run() },
    { icon: Quotes, label: "Kutipan", action: () => ed.chain().focus().toggleBlockquote().run() },
    { icon: BracketsSquare, label: "Blok Kode", action: () => ed.chain().focus().toggleCodeBlock().run() },
    { icon: PhosphorLinkIcon, label: "Tautan", action: () => ed.chain().focus().setLink({ href: "" }).run() },
  ];

  const PANEL_ROW_2 = [
    { icon: CodeBlock, label: "Blok Kode", action: () => ed.chain().focus().toggleCodeBlock().run() },
    { icon: ListBullets, label: "Bullet", action: () => ed.chain().focus().toggleBulletList().run() },
    { icon: ListNumbers, label: "Bernomor", action: () => ed.chain().focus().toggleOrderedList().run() },
    { icon: CheckSquare, label: "Checklist", action: () => ed.chain().focus().toggleTaskList().run() },
    { icon: AlignLeft, label: "Rata Kiri", action: () => ed.chain().focus().setTextAlign("left").run() },
    { icon: TextAlignCenter, label: "Rata Tengah", action: () => ed.chain().focus().setTextAlign("center").run() },
    { icon: AlignRight, label: "Rata Kanan", action: () => ed.chain().focus().setTextAlign("right").run() },
    { icon: TextAlignJustify, label: "Rata Kanan-Kiri", action: () => ed.chain().focus().setTextAlign("justify").run() },
  ];

  const PANEL_ROW_3 = [
    { icon: ImageSquare, label: "Gambar", action: () => {
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
    }},
    { icon: ArrowCounterClockwise, label: "Urungkan", action: () => ed.chain().focus().undo().run() },
    { icon: ArrowClockwise, label: "Ulangi", action: () => ed.chain().focus().redo().run() },
  ];

  const renderPanelRow = (items: Array<{ icon: any; label: string; action: () => void }>) => (
    <div className="flex items-center gap-1 px-2 py-1.5 overflow-x-auto scrollbar-none" style={{ scrollbarWidth: "none" }}>
      {items.map((item, idx) => (
        <button
          key={idx}
          onMouseDown={(e) => e.preventDefault()}
          onClick={item.action}
          className={cn(
            "flex h-9 w-9 shrink-0 items-center justify-center rounded-lg",
            "text-[var(--text-muted)] hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]"
          )}
          aria-label={item.label}
        >
          <Icon icon={item.icon} size={18} weight="regular" />
        </button>
      ))}
    </div>
  );

  return (
    <div className="md:hidden" suppressHydrationWarning>
      <div
        className="flex items-center border-t border-[var(--border)] bg-[var(--card)]"
        style={{
          height: "48px",
          position: "sticky",
          top: "calc(52px + env(safe-area-inset-top))",
          zIndex: 20,
        }}
        suppressHydrationWarning
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
          <div className="flex flex-col gap-1 border-t border-[var(--border)] p-2">
            {renderPanelRow(PANEL_ROW_1)}
            {renderPanelRow(PANEL_ROW_2)}
            {renderPanelRow(PANEL_ROW_3)}
          </div>
        </div>
      </div>
    </div>
  );
}