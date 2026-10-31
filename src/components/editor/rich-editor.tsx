"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Highlight from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";
import { TextStyle } from "@tiptap/extension-text-style";
import TextAlign from "@tiptap/extension-text-align";
import Subscript from "@tiptap/extension-subscript";
import Superscript from "@tiptap/extension-superscript";
import TaskList from "@tiptap/extension-task-list";
import TaskItem from "@tiptap/extension-task-item";
import CharacterCount from "@tiptap/extension-character-count";
import Typography from "@tiptap/extension-typography";
import FontFamily from "@tiptap/extension-font-family";
import CodeBlockLowlight from "@tiptap/extension-code-block-lowlight";
import { common, createLowlight } from "lowlight";
import { useEffect, useState, useCallback, useRef } from "react";
import { updateNote, togglePinNote, listCollections, moveNoteToCollection } from "@/lib/db/repo";
import { useRouter } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Icon } from "@/components/ui/icon";
import { cn } from "@/lib/utils";
import { ArrowLeft, Pin, History, Maximize, Minimize, MoreHorizontal, ChevronDown } from "lucide-react";
import type { Collection, Tag } from "@/lib/notes/types";

const lowlight = createLowlight(common);

const FONTS = [
  { id: "sans", label: "Sans", css: "ui-sans-serif, system-ui, sans-serif" },
  { id: "serif", label: "Serif", css: "ui-serif, Georgia, serif" },
  { id: "mono", label: "Mono", css: "ui-monospace, monospace" },
];

export default function RichEditor({ noteId, initialTitle, initialContent, collectionName, tags }: { noteId: string; initialTitle: string; initialContent: unknown; collectionName?: string; tags?: Tag[] }) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [saving, setSaving] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [showReplace, setShowReplace] = useState(false);
  const [wordCount, setWordCount] = useState({ words: 0, chars: 0 });
  const collections = useLiveQuery(() => listCollections(), []);
  const editorContainerRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      Underline,
      Link.configure({ openOnClick: false }),
      Highlight.configure({ multicolor: true }),
      Placeholder.configure({ placeholder: "Mulai menulis, atau ketik / untuk perintah" }),
      TextStyle,
      TextAlign.configure({ types: ["heading", "paragraph"] }),
      Subscript,
      Superscript,
      TaskList,
      TaskItem.configure({ nested: true }),
      CharacterCount,
      Typography,
      FontFamily.configure({ types: ["textStyle"] }),
      CodeBlockLowlight.configure({ lowlight }),
    ],
    content: initialContent as never,
    immediatelyRender: false,
    onUpdate: ({ editor }) => {
      const text = editor.getText();
      setWordCount({ words: text.split(/\s+/).filter(Boolean).length, chars: text.length });
    },
  });

  const html = editor?.getHTML();

  useEffect(() => {
    const vv = window.visualViewport;
    if (!vv) return;
    const adjust = () => {
      document.documentElement.style.setProperty("--kb", `${window.innerHeight - vv.height}px`);
    };
    vv.addEventListener("resize", adjust);
    adjust();
    return () => vv.removeEventListener("resize", adjust);
  }, []);

  useEffect(() => {
    if (focusMode && editorContainerRef.current) {
      editorContainerRef.current.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [focusMode]);

  useEffect(() => {
    const t = setTimeout(async () => {
      if (!editor) return;
      setSaving(true);
      const text = editor.getText();
      await updateNote(noteId, { title, content: editor.getJSON(), contentText: text });
      setSaving(false);
    }, 800);
    return () => clearTimeout(t);
  }, [title, html, editor, noteId]);

  const toggleBold = useCallback(() => editor?.chain().focus().toggleBold().run(), [editor]);
  const toggleItalic = useCallback(() => editor?.chain().focus().toggleItalic().run(), [editor]);
  const toggleUnderline = useCallback(() => editor?.chain().focus().toggleUnderline().run(), [editor]);
  const toggleStrike = useCallback(() => editor?.chain().focus().toggleStrike().run(), [editor]);
  const toggleCode = useCallback(() => editor?.chain().focus().toggleCode().run(), [editor]);
  const toggleBulletList = useCallback(() => editor?.chain().focus().toggleBulletList().run(), [editor]);
  const toggleOrderedList = useCallback(() => editor?.chain().focus().toggleOrderedList().run(), [editor]);
  const toggleTaskList = useCallback(() => editor?.chain().focus().toggleTaskList().run(), [editor]);
  const toggleBlockquote = useCallback(() => editor?.chain().focus().toggleBlockquote().run(), [editor]);
  const toggleCodeBlock = useCallback(() => editor?.chain().focus().toggleCodeBlock().run(), [editor]);
  const setHeading = useCallback((level: number) => editor?.chain().focus().toggleHeading({ level: level as 1 | 2 | 3 | 4 }).run(), [editor]);
  const setAlign = useCallback((align: string) => editor?.chain().focus().setTextAlign(align).run(), [editor]);
  const setFont = useCallback((font: string) => editor?.chain().focus().setFontFamily(font).run(), [editor]);

  async function onPin() {
    await togglePinNote(noteId);
    router.refresh();
  }

  if (focusMode) {
    return (
      <div className="fixed inset-0 z-50 bg-[var(--background)]">
        <div className="flex items-center justify-between p-4">
          <Button variant="ghost" onClick={() => setFocusMode(false)}><Icon icon={Minimize} size={18} /> Keluar Mode Fokus</Button>
          <span className="text-xs text-[var(--text-muted)]">Esc untuk keluar</span>
        </div>
        <div className="mx-auto max-w-2xl px-4 pb-20">
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="mb-6 w-full bg-transparent text-3xl font-bold outline-none"
            placeholder="Judul catatan"
          />
          <EditorContent editor={editor} className="prose prose-lg max-w-none dark:prose-invert" />
        </div>
      </div>
    );
  }

  return (
    <div ref={editorContainerRef} className={cn("flex flex-col transition-all", focusMode && "opacity-0 pointer-events-none")}>
      <div className="sticky top-0 z-20 flex items-center justify-between gap-2 border-b border-[var(--border)] bg-[var(--card)]/90 p-3 backdrop-blur">
        <div className="flex items-center gap-2">
          <Button variant="ghost" onClick={() => router.back()}><Icon icon={ArrowLeft} size={18} /></Button>
          <span className="text-sm text-[var(--text-muted)]">{collectionName || "Koleksi"}</span>
          <ChevronDown size={14} className="text-[var(--text-muted)]" />
        </div>
        <div className="flex items-center gap-1">
          <span className="text-xs text-[var(--text-muted)]">{saving ? "Menyimpan..." : "Tersimpan"}</span>
          <Button variant="ghost" size="sm" onClick={onPin}><Icon icon={Pin} size={16} /></Button>
          <Button variant="ghost" size="sm" onClick={() => router.push(`/catatan/${noteId}/versions`)}><Icon icon={History} size={16} /></Button>
          <Button variant="ghost" size="sm" onClick={() => setFocusMode(true)}><Icon icon={Maximize} size={16} /></Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm"><Icon icon={MoreHorizontal} size={16} /></Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => {}}>Bagikan</DropdownMenuItem>
              <DropdownMenuItem onClick={() => {}}>Ekspor Markdown</DropdownMenuItem>
              <DropdownMenuItem onClick={() => window.print()}>Cetak</DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setShowReplace(!showReplace)}>Cari & Ganti</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <div className="mx-auto w-full max-w-[760px] px-4 py-6">
        <div className="mb-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Judul</label>
        </div>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mb-4 w-full bg-transparent text-3xl font-bold outline-none"
          placeholder="Judul catatan"
        />
        <div className="mb-6 h-0.5 bg-[var(--accent)] transition-transform origin-left" style={{ transform: title ? "scaleX(1)" : "scaleX(0)" }} />

        <div className="mb-4 flex flex-wrap gap-2">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="flex items-center gap-1 rounded-xl bg-[var(--card-muted)] px-3 py-1.5 text-xs">{collectionName || "Koleksi"} <ChevronDown size={12} /></button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="start">
              {(collections ?? []).map((c: Collection) => (
                <DropdownMenuItem key={c.id} onClick={() => { moveNoteToCollection(noteId, c.id); router.refresh(); }}>{c.name}</DropdownMenuItem>
              ))}
            </DropdownMenuContent>
          </DropdownMenu>
          {tags?.map((t) => (
            <span key={t.id} className="rounded-full bg-[var(--card-muted)] px-3 py-1.5 text-xs">{t.name}</span>
          ))}
        </div>

        <div className="mb-2 flex flex-wrap items-center gap-1 rounded-2xl bg-[var(--card)] p-1.5 shadow-[var(--shadow-1)]">
          <ToolbarGroup>
            <ToolbarBtn onClick={() => setHeading(1)} active={editor?.isActive("heading", { level: 1 })}>H1</ToolbarBtn>
            <ToolbarBtn onClick={() => setHeading(2)} active={editor?.isActive("heading", { level: 2 })}>H2</ToolbarBtn>
            <ToolbarBtn onClick={() => setHeading(3)} active={editor?.isActive("heading", { level: 3 })}>H3</ToolbarBtn>
          </ToolbarGroup>
          <span className="w-px h-6 bg-[var(--border)]" />
          <ToolbarGroup>
            <ToolbarBtn onClick={toggleBold} active={editor?.isActive("bold")}>B</ToolbarBtn>
            <ToolbarBtn onClick={toggleItalic} active={editor?.isActive("italic")}>I</ToolbarBtn>
            <ToolbarBtn onClick={toggleUnderline} active={editor?.isActive("underline")}>U</ToolbarBtn>
            <ToolbarBtn onClick={toggleStrike} active={editor?.isActive("strike")}>S</ToolbarBtn>
            <ToolbarBtn onClick={toggleCode} active={editor?.isActive("code")}>&lt;/&gt;</ToolbarBtn>
          </ToolbarGroup>
          <span className="w-px h-6 bg-[var(--border)]" />
          <ToolbarGroup>
            <ToolbarBtn onClick={toggleBulletList} active={editor?.isActive("bulletList")}>•</ToolbarBtn>
            <ToolbarBtn onClick={toggleOrderedList} active={editor?.isActive("orderedList")}>1.</ToolbarBtn>
            <ToolbarBtn onClick={toggleTaskList} active={editor?.isActive("taskList")}>☑</ToolbarBtn>
            <ToolbarBtn onClick={toggleBlockquote} active={editor?.isActive("blockquote")}>&ldquo;</ToolbarBtn>
            <ToolbarBtn onClick={toggleCodeBlock} active={editor?.isActive("codeBlock")}>&lt;/&gt;</ToolbarBtn>
          </ToolbarGroup>
          <span className="w-px h-6 bg-[var(--border)]" />
          <ToolbarGroup>
            <ToolbarBtn onClick={() => setAlign("left")} active={editor?.isActive({ textAlign: "left" })}>Kiri</ToolbarBtn>
            <ToolbarBtn onClick={() => setAlign("center")} active={editor?.isActive({ textAlign: "center" })}>Tengah</ToolbarBtn>
            <ToolbarBtn onClick={() => setAlign("right")} active={editor?.isActive({ textAlign: "right" })}>Kanan</ToolbarBtn>
          </ToolbarGroup>
          <span className="w-px h-6 bg-[var(--border)]" />
          <ToolbarGroup>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex h-9 w-9 items-center justify-center rounded-xl text-sm hover:bg-[var(--card-muted)]">{FONTS.find(f => editor?.getAttributes("textStyle").fontFamily === f.css)?.label || "A"}</button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {FONTS.map((f) => (
                  <DropdownMenuItem key={f.id} onClick={() => setFont(f.css)}>{f.label}</DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex h-9 w-9 items-center justify-center rounded-xl text-sm hover:bg-[var(--card-muted)]">Aa</button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                <DropdownMenuItem onClick={() => editor?.chain().focus().setHighlight({ color: "#fef08a" }).run()}>Sorot Kuning</DropdownMenuItem>
                <DropdownMenuItem onClick={() => editor?.chain().focus().setHighlight({ color: "#bbf7d0" }).run()}>Sorot Hijau</DropdownMenuItem>
                <DropdownMenuItem onClick={() => editor?.chain().focus().unsetHighlight().run()}>Hapus Sorot</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </ToolbarGroup>
        </div>

        {showReplace && (
          <div className="mb-4 flex flex-wrap items-center gap-2 rounded-2xl bg-[var(--card)] p-3">
            <Input placeholder="Cari" className="h-9 w-40" onChange={() => {}} />
            <Input placeholder="Ganti" className="h-9 w-40" />
            <Button size="sm" onClick={() => {}}>Ganti</Button>
            <Button size="sm" variant="ghost" onClick={() => setShowReplace(false)}>Tutup</Button>
          </div>
        )}

        <EditorContent editor={editor} className="prose prose-lg max-w-none dark:prose-invert min-h-[50vh]" />

        <div className="mt-6 flex items-center justify-between border-t border-[var(--border)] pt-3 text-xs text-[var(--text-muted)]">
          <span>{wordCount.words} kata · {wordCount.chars} karakter</span>
          <span>Estimasi {Math.max(1, Math.ceil(wordCount.words / 200))} min baca</span>
        </div>
      </div>

      <style jsx global>{`
        .tiptap { outline: none; line-height: 1.7; font-size: 16px; }
        .tiptap p { margin: 0.5em 0; }
        .tiptap h1 { font-size: 2em; font-weight: 700; margin: 0.5em 0; }
        .tiptap h2 { font-size: 1.5em; font-weight: 600; margin: 0.5em 0; }
        .tiptap h3 { font-size: 1.25em; font-weight: 600; margin: 0.5em 0; }
        .tiptap ul, .tiptap ol { padding-left: 1.5em; }
        .tiptap blockquote { border-left: 3px solid var(--accent); padding-left: 1em; margin-left: 0; color: var(--text-muted); }
        .tiptap pre { background: var(--surface-2); padding: 1em; border-radius: 12px; overflow-x: auto; }
        .tiptap code { background: var(--surface-2); padding: 0.2em 0.4em; border-radius: 4px; font-family: ui-monospace, monospace; font-size: 0.9em; }
        .tiptap pre code { background: none; padding: 0; }
        .tiptap mark { border-radius: 2px; padding: 0.1em 0; }
        .tiptap ul[data-type="taskList"] { list-style: none; padding-left: 0; }
        .tiptap ul[data-type="taskList"] li { display: flex; align-items: flex-start; gap: 0.5em; }
        .tiptap ul[data-type="taskList"] li > label { margin-top: 0.2em; }
        .tiptap ul[data-type="taskList"] li > div { flex: 1; }
      `}</style>
    </div>
  );
}

function ToolbarGroup({ children }: { children: React.ReactNode }) {
  return <div className="flex items-center gap-0.5">{children}</div>;
}

function ToolbarBtn({ onClick, active, children }: { onClick: () => void; active?: boolean; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-xl text-sm transition",
        active ? "bg-[var(--accent)]/15 text-[var(--accent)]" : "hover:bg-[var(--card-muted)]"
      )}
    >
      {children}
    </button>
  );
}
