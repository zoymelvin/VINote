"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import UnderlineExt from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Image from "@tiptap/extension-image";
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
import { db } from "@/lib/db/db";
import { updateNote, togglePinNote, listCollections, moveNoteToCollection, createNote, unarchiveNote, restoreNote } from "@/lib/db/repo";
import { setupFlushHandlers } from "@/lib/sync/engine";
import { useRouter } from "next/navigation";
import { useLiveQuery } from "dexie-react-hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Icon } from "@/components/icons";
import { cn } from "@/lib/utils";
import { ArrowLeft, PushPin, ClockCounterClockwise, ArrowsOutSimple, ArrowsInSimple, List, CaretDown, TextHOne, TextHTwo, TextHThree, TextB, TextItalic, TextUnderline, TextStrikethrough, CodeBlock, ListBullets, ListNumbers, CheckSquare, Quotes, BracketsSquare, AlignLeft, TextAlignCenter, AlignRight, TextAlignJustify, TextAa, Highlighter, Archive, Trash, FolderSimplePlus, ImageSquare } from "@phosphor-icons/react";
import type { Collection, Tag } from "@/lib/notes/types";

const lowlight = createLowlight(common);

const FONTS = [
  { id: "sans", label: "Sans", css: "ui-sans-serif, system-ui, sans-serif" },
  { id: "serif", label: "Serif", css: "ui-serif, Georgia, serif" },
  { id: "mono", label: "Mono", css: "ui-monospace, monospace" },
];

export default function RichEditor({ noteId, initialTitle, initialContent, collectionName, tags, isNew, isArchived, isDeleted }: { noteId: string; initialTitle: string; initialContent: unknown; collectionName?: string; tags?: Tag[]; isNew?: boolean; isArchived?: boolean; isDeleted?: boolean }) {
  const router = useRouter();
  const [title, setTitle] = useState(initialTitle);
  const [saving, setSaving] = useState(false);
  const [focusMode, setFocusMode] = useState(false);
  const [showReplace, setShowReplace] = useState(false);
  const [wordCount, setWordCount] = useState({ words: 0, chars: 0 });
  const [created, setCreated] = useState(false);
  const isNewRef = useRef(isNew);
  const createdRef = useRef(created);
  const titleRef = useRef(title);

  useEffect(() => {
    isNewRef.current = isNew;
    createdRef.current = created;
    titleRef.current = title;
  });
  const collections = useLiveQuery(() => listCollections(), []);
  const editorContainerRef = useRef<HTMLDivElement>(null);

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ codeBlock: false }),
      UnderlineExt,
      Link.configure({ openOnClick: false }),
      Highlight.configure({ multicolor: true }),
      Image.configure({ inline: false, allowBase64: true }),
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
    onUpdate: ({ editor: ed }) => {
      const text = ed.getText();
      setWordCount({ words: text.split(/\s+/).filter(Boolean).length, chars: text.length });
      if (isNewRef.current && !createdRef.current) {
        const hasContent = text.trim().length > 0 || titleRef.current.trim().length > 0;
        if (hasContent) {
          db.notes.get(noteId).then((existing) => {
            if (existing) {
              updateNote(noteId, { title: titleRef.current.trim(), content: ed.getJSON(), contentText: text }).then(() => setCreated(true));
            } else {
              createNote({ id: noteId, type: "text", title: titleRef.current.trim(), content: ed.getJSON(), contentText: text })
                .then(() => setCreated(true))
                .catch(() => {
                  updateNote(noteId, { title: titleRef.current.trim(), content: ed.getJSON(), contentText: text }).then(() => setCreated(true));
                });
            }
          });
        }
      } else {
        scheduleSave();
      }
    },
  });
  const editorRef = useRef(editor);

  useEffect(() => {
    editorRef.current = editor;
  });

  useEffect(() => {
    if (editor && initialContent) {
      const currentContent = JSON.stringify(editor.getJSON());
      const newContent = JSON.stringify(initialContent);
      if (currentContent !== newContent) {
        editor.commands.setContent(initialContent as import("@tiptap/core").Content, { emitUpdate: false });
      }
    }
  }, [editor, initialContent]);


  const html = editor?.getHTML();

  useEffect(() => {
    if (isNew && !created && title.trim().length > 0) {
      const ed = editorRef.current;
      if (!ed) return;
      const text = ed.getText();
      const hasContent = text.trim().length > 0;
      if (hasContent) {
        createNote({ id: noteId, type: "text", title: title.trim(), content: ed.getJSON(), contentText: text }).then(() => setCreated(true));
      }
    }
  }, [isNew, created, title, noteId]);

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
    const flush = () => {
      const ed = editorRef.current;
      if (ed) {
        const text = ed.getText();
        updateNote(noteId, { title: titleRef.current, content: ed.getJSON(), contentText: text });
      }
    };
    setupFlushHandlers(flush);
    return () => {
      flush();
    };
  }, [editor, noteId]);

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const scheduleSave = useCallback(() => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(async () => {
      const ed = editorRef.current;
      if (!ed) return;
      setSaving(true);
      const text = ed.getText();
      await updateNote(noteId, { title: titleRef.current, content: ed.getJSON(), contentText: text });
      setSaving(false);
    }, 800);
  }, [noteId]);

  useEffect(() => {
    return () => {
      if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    };
  }, []);

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
          <Button variant="ghost" onClick={() => setFocusMode(false)}><Icon icon={ArrowsInSimple} size={18} /> Keluar Mode Fokus</Button>
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
          <Button variant="ghost" size="sm" onClick={() => {}} title="Tambahkan ke koleksi"><Icon icon={FolderSimplePlus} size={16} />{collections?.length ? ` ${collections.length}` : ""}</Button>
          <span className="text-sm text-[var(--text-muted)]">{saving ? "Menyimpan..." : "Tersimpan"}</span>
        </div>
        <div className="flex items-center gap-1">
          <Button variant="ghost" size="sm" onClick={() => router.push(`/catatan/${noteId}/versions`)} title="Riwayat versi"><Icon icon={ClockCounterClockwise} size={16} /></Button>
          <Button variant="ghost" size="sm" onClick={() => setFocusMode(true)} title="Mode fokus"><Icon icon={ArrowsOutSimple} size={16} /></Button>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" title="Lainnya"><Icon icon={List} size={16} /></Button>
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

      {isArchived && !isDeleted && (
        <div className="mx-auto w-full max-w-[1040px] px-4 md:px-12 pt-4">
          <div className="flex items-center gap-3 rounded-xl bg-[var(--card-muted)] p-3 text-sm">
            <Icon icon={Archive} size={18} className="text-[var(--text-muted)]" />
            <span className="flex-1">Catatan ini ada di Arsip</span>
            <Button size="sm" variant="secondary" onClick={() => { unarchiveNote(noteId); router.refresh(); }}>Keluarkan dari arsip</Button>
          </div>
        </div>
      )}

      {isDeleted && (
        <div className="mx-auto w-full max-w-[1040px] px-4 md:px-12 pt-4">
          <div className="flex items-center gap-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 p-3 text-sm">
            <Icon icon={Trash} size={18} className="text-rose-600" />
            <span className="flex-1">Catatan ini ada di Sampah</span>
            <Button size="sm" variant="secondary" onClick={() => { restoreNote(noteId); router.refresh(); }}>Pulihkan</Button>
          </div>
        </div>
      )}

      <div className="mx-auto w-full max-w-[1040px] px-4 md:px-12 py-6">
        <div className="mb-1">
          <label className="text-xs font-semibold uppercase tracking-wider text-[var(--text-muted)]">Judul</label>
        </div>
        <input
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          className="mb-4 w-full bg-transparent text-[36px] font-bold leading-tight outline-none text-[var(--text)] placeholder:text-[var(--text-muted)]"
          placeholder="Judul catatan"
          style={{ fontFamily: "var(--font-sans)" }}
        />
        <div className="mb-6 h-0.5 bg-[var(--accent)] transition-transform origin-left" style={{ transform: title ? "scaleX(1)" : "scaleX(0)" }} />

        <div className="mb-4 flex flex-wrap gap-2">
          {tags?.map((t) => (
            <span key={t.id} className="rounded-full bg-[var(--card-muted)] px-3 py-1.5 text-xs">{t.name}</span>
          ))}
        </div>

        <div className="mb-2 flex flex-wrap items-center gap-1 rounded-2xl bg-[var(--card)] p-1.5 shadow-[var(--shadow-1)]">
          <ToolbarGroup>
            <ToolbarBtn onClick={() => setHeading(1)} active={editor?.isActive("heading", { level: 1 })}><Icon icon={TextHOne} size={18} /></ToolbarBtn>
            <ToolbarBtn onClick={() => setHeading(2)} active={editor?.isActive("heading", { level: 2 })}><Icon icon={TextHTwo} size={18} /></ToolbarBtn>
            <ToolbarBtn onClick={() => setHeading(3)} active={editor?.isActive("heading", { level: 3 })}><Icon icon={TextHThree} size={18} /></ToolbarBtn>
          </ToolbarGroup>
          <span className="w-px h-6 bg-[var(--border)]" />
          <ToolbarGroup>
            <ToolbarBtn onClick={toggleBold} active={editor?.isActive("bold")}><Icon icon={TextB} size={18} /></ToolbarBtn>
            <ToolbarBtn onClick={toggleItalic} active={editor?.isActive("italic")}><Icon icon={TextItalic} size={18} /></ToolbarBtn>
            <ToolbarBtn onClick={toggleUnderline} active={editor?.isActive("underline")}><Icon icon={TextUnderline} size={18} /></ToolbarBtn>
            <ToolbarBtn onClick={toggleStrike} active={editor?.isActive("strike")}><Icon icon={TextStrikethrough} size={18} /></ToolbarBtn>
            <ToolbarBtn onClick={toggleCode} active={editor?.isActive("code")}><Icon icon={CodeBlock} size={18} /></ToolbarBtn>
          </ToolbarGroup>
          <span className="w-px h-6 bg-[var(--border)]" />
          <ToolbarGroup>
            <ToolbarBtn onClick={toggleBulletList} active={editor?.isActive("bulletList")}><Icon icon={ListBullets} size={18} /></ToolbarBtn>
            <ToolbarBtn onClick={toggleOrderedList} active={editor?.isActive("orderedList")}><Icon icon={ListNumbers} size={18} /></ToolbarBtn>
            <ToolbarBtn onClick={toggleTaskList} active={editor?.isActive("taskList")}><Icon icon={CheckSquare} size={18} /></ToolbarBtn>
            <ToolbarBtn onClick={toggleBlockquote} active={editor?.isActive("blockquote")}><Icon icon={Quotes} size={18} /></ToolbarBtn>
            <ToolbarBtn onClick={toggleCodeBlock} active={editor?.isActive("codeBlock")}><Icon icon={BracketsSquare} size={18} /></ToolbarBtn>
            <ToolbarBtn onClick={() => {
              const input = document.createElement("input");
              input.type = "file";
              input.accept = "image/*";
              input.onchange = (e) => {
                const file = (e.target as HTMLInputElement).files?.[0];
                if (file) {
                  const reader = new FileReader();
                  reader.onload = () => {
                    editor?.chain().focus().setImage({ src: reader.result as string }).run();
                  };
                  reader.readAsDataURL(file);
                }
              };
              input.click();
            }}><Icon icon={ImageSquare} size={18} /></ToolbarBtn>
          </ToolbarGroup>
          <span className="w-px h-6 bg-[var(--border)]" />
          <ToolbarGroup>
            <ToolbarBtn onClick={() => setAlign("left")} active={editor?.isActive({ textAlign: "left" })}><Icon icon={AlignLeft} size={18} /></ToolbarBtn>
            <ToolbarBtn onClick={() => setAlign("center")} active={editor?.isActive({ textAlign: "center" })}><Icon icon={TextAlignCenter} size={18} /></ToolbarBtn>
            <ToolbarBtn onClick={() => setAlign("right")} active={editor?.isActive({ textAlign: "right" })}><Icon icon={AlignRight} size={18} /></ToolbarBtn>
            <ToolbarBtn onClick={() => setAlign("justify")} active={editor?.isActive({ textAlign: "justify" })}><Icon icon={TextAlignJustify} size={18} /></ToolbarBtn>
          </ToolbarGroup>
          <span className="w-px h-6 bg-[var(--border)]" />
          <ToolbarGroup>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-[var(--card-muted)]" aria-label="Font"><Icon icon={TextAa} size={18} /></button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start">
                {FONTS.map((f) => (
                  <DropdownMenuItem key={f.id} onClick={() => setFont(f.css)}>{f.label}</DropdownMenuItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <button className="flex h-9 w-9 items-center justify-center rounded-xl hover:bg-[var(--card-muted)]" aria-label="Sorot"><Icon icon={Highlighter} size={18} /></button>
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

        <EditorContent editor={editor} className="vn-prose min-h-[50vh]" />

         <div className="mt-6 flex items-center justify-between border-t border-[var(--border)] pt-3 text-xs text-[var(--text-muted)]">
           <span>{wordCount.words} kata · {wordCount.chars} karakter</span>
           <span>Estimasi {Math.max(1, Math.ceil(wordCount.words / 200))} min baca</span>
         </div>
       </div>
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
      onMouseDown={(e) => e.preventDefault()}
      className={cn(
        "flex h-9 w-9 items-center justify-center rounded-xl text-sm transition",
        active ? "bg-[var(--accent)]/15 text-[var(--accent)]" : "hover:bg-[var(--card-muted)]"
      )}
    >
      {children}
    </button>
  );
}
