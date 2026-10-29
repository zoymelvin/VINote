"use client";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import Underline from "@tiptap/extension-underline";
import Link from "@tiptap/extension-link";
import Highlight from "@tiptap/extension-highlight";
import Placeholder from "@tiptap/extension-placeholder";
import { useEffect, useState } from "react";
import { updateNote } from "@/lib/db/repo";
import { Button } from "@/components/ui/button";

export default function RichEditor({ noteId, initialTitle, initialContent }: { noteId: string; initialTitle: string; initialContent: unknown }) {
  const [title, setTitle] = useState(initialTitle);
  const [saving, setSaving] = useState(false);
  const editor = useEditor({
    extensions: [StarterKit, Underline, Link, Highlight, Placeholder.configure({ placeholder: "Tulis catatan..." })],
    content: initialContent as never,
    immediatelyRender: false,
    editorProps: { attributes: { class: "prose max-w-none min-h-[60vh] outline-none" } },
  });

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

  const html = editor?.getHTML();
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

  return (
    <div className="flex flex-col gap-3 p-4" style={{ paddingBottom: "calc(env(safe-area-inset-bottom) + var(--kb,0px))" }}>
      <input
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        className="text-2xl font-bold bg-transparent outline-none"
        placeholder="Judul"
      />
      <div className="sticky top-0 z-10 flex flex-wrap gap-2 rounded-2xl bg-[var(--card)]/90 p-2 backdrop-blur">
        <Button size="sm" variant="ghost" onClick={() => editor?.chain().focus().toggleBold().run()}>B</Button>
        <Button size="sm" variant="ghost" onClick={() => editor?.chain().focus().toggleItalic().run()}>I</Button>
        <Button size="sm" variant="ghost" onClick={() => editor?.chain().focus().toggleUnderline().run()}>U</Button>
        <Button size="sm" variant="ghost" onClick={() => editor?.chain().focus().toggleStrike().run()}>S</Button>
        <Button size="sm" variant="ghost" onClick={() => editor?.chain().focus().toggleHeading({ level: 2 }).run()}>H2</Button>
        <Button size="sm" variant="ghost" onClick={() => editor?.chain().focus().toggleBulletList().run()}>•</Button>
        <span className="ml-auto text-xs text-[var(--muted)]">{saving ? "Menyimpan..." : "Tersimpan"}</span>
      </div>
      <EditorContent editor={editor} />
    </div>
  );
}
