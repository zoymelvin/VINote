import { searchNotes } from "@/lib/db/repo";

export interface SearchResult {
  type: "note" | "collection" | "action";
  id?: string;
  title: string;
  description?: string;
  action?: () => void;
}

const ACTIONS = [
  { id: "new-note", title: "Catatan baru", description: "Buat catatan Teks" },
  { id: "toggle-theme", title: "Ganti tema", description: "Terang / Gelap / Sistem" },
  { id: "open-settings", title: "Buka Pengaturan", description: "Preferensi aplikasi" },
];

export async function globalSearch(query: string): Promise<SearchResult[]> {
  const results: SearchResult[] = [];

  if (!query.trim()) {
    results.push(...ACTIONS.map((a) => ({ ...a, type: "action" as const })));
    return results;
  }

  const notes = await searchNotes(query);
  for (const n of notes.slice(0, 15)) {
    results.push({
      type: "note",
      id: n.id,
      title: n.title || "Tanpa judul",
      description: n.contentText?.slice(0, 80) || "",
    });
  }

  return results;
}
