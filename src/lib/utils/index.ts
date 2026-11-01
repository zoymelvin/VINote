import { format, startOfWeek } from "date-fns";
import { id as idLocale } from "date-fns/locale";

export function uid() {
  return crypto.randomUUID();
}

export function now() {
  return Date.now();
}

export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}

export function startOfToday() {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.getTime();
}

export function groupHistoryDate(ts: number | null, nowMs = Date.now()) {
  if (!ts) return "older";
  const date = new Date(ts);
  const today = new Date(nowMs);
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const weekStart = startOfWeek(today, { weekStartsOn: 1 });
  if (date >= today) return "today";
  if (date >= yesterday && date < today) return "yesterday";
  if (date >= weekStart) return "week";
  return "older";
}

export function formatDate(ts: number, locale = "id") {
  return format(new Date(ts), "d MMM yyyy HH:mm", {
    locale: locale === "id" ? idLocale : undefined,
  });
}

export function stripHtml(text: string) {
  return text.replace(/<[^>]*>/g, " ").replace(/\s+/g, " ").trim();
}

export function getDisplayTitle(note: { title?: string | null; contentText?: string | null; type?: string | null }) {
  const title = note.title?.trim();
  if (title) return title;
  const raw = (note.contentText || "").trim();
  if (raw) {
    let line = raw.split(/\r?\n/)[0]?.trim() || "";
    // strip markdown markers
    line = line.replace(/^#+\s*/, "").replace(/^[-*>]+\s*/, "").replace(/^```+\s*/, "").trim();
    line = line.replace(/\s+/g, " ");
    if (line) return line.length > 80 ? line.slice(0, 80) + "…" : line;
  }
  // non-text content label
  const typeLabels: Record<string, string> = {
    checklist: "Checklist",
    markdown: "Markdown",
    code: "Kode",
    quick: "Catatan Cepat",
    journal: "Jurnal",
    voice: "Suara",
    drawing: "Sketsa",
    bookmark: "Bookmark",
    template: "Template",
  };
  if (note.type && typeLabels[note.type]) return typeLabels[note.type];
  if (note.type && note.type !== "text") return note.type;
  return "Tanpa judul";
}


export function isEmptyNote(note: { title?: string | null; content?: unknown; contentText?: string | null }) {
  const title = (note.title || "").trim();
  if (title) return false;
  const text = (note.contentText || "").trim();
  if (text) return false;
  // Check Tiptap empty doc
  const content = note.content as { type?: string; content?: Array<{ type?: string; content?: unknown[] }> } | null;
  if (content && content.type === "doc") {
    const children = content.content || [];
    if (children.length === 0) return true;
    if (children.length === 1 && children[0].type === "paragraph" && (!children[0].content || children[0].content.length === 0)) return true;
    if (children.every((c) => c.type === "paragraph" && (!c.content || c.content.length === 0))) return true;
  }
  return false;
}