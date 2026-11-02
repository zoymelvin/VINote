"use client";
import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { Icon } from "@/components/icons";
import { db } from "@/lib/db/db";
import { MagnifyingGlass, X } from "@phosphor-icons/react";
import { CollectionIcon } from "@/components/shared/collection-icon";
import { cn } from "@/lib/utils";

export function MobileSearchOverlay({ onClose }: { onClose: () => void }) {
  const [query, setQuery] = useState("");
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const [notes, setNotes] = useState<Array<{ id: string; title: string; contentText?: string | null; updatedAt: number; color?: string }>>([]);
  const [collections, setCollections] = useState<Array<{ id: string; name: string; icon?: string; color?: string }>>([]);

  useEffect(() => {
    if (inputRef.current) inputRef.current.focus();
      const load = async () => {
        const [n, c] = await Promise.all([
          db.notes.filter((n) => n.deletedAt === null).toArray(),
          db.folders.toArray(),
        ]);
        setNotes(n.map((n) => ({ id: n.id, title: n.title || "", contentText: n.contentText || "", updatedAt: n.updatedAt, color: n.color })));
        setCollections((c as Array<{ id: string; name: string; icon?: string; color?: string }>));
      };
    load();
  }, []);

  const q = query.toLowerCase().trim();
  const filteredNotes = q ? notes.filter((n) => (n.title?.toLowerCase().includes(q) || n.contentText?.toLowerCase().includes(q))) : [];
  const filteredCollections = q ? collections.filter((c) => c.name.toLowerCase().includes(q)) : [];

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Escape") { onClose(); return; }
    if (e.key === "ArrowDown") { e.preventDefault(); setFocusedIndex((i) => Math.min(i + 1, filteredNotes.length + filteredCollections.length - 1)); return; }
    if (e.key === "ArrowUp") { e.preventDefault(); setFocusedIndex((i) => Math.max(i - 1, -1)); return; }
    if (e.key === "Enter") {
      e.preventDefault();
      const total = filteredNotes.length + filteredCollections.length;
      if (focusedIndex >= 0 && focusedIndex < total) {
        const item = focusedIndex < filteredNotes.length ? filteredNotes[focusedIndex] : filteredCollections[focusedIndex - filteredNotes.length];
        if (item.id.startsWith("col:")) {
          window.location.href = `/koleksi/${item.id.replace("col:", "")}`;
        } else {
          window.location.href = `/catatan/${item.id}?mode=edit`;
        }
        onClose();
      }
      return;
    }
  }

  return (
    <div
      className="fixed inset-0 z-60 md:hidden"
      style={{ background: "oklch(0 0 0 / 0.4)", backdropFilter: "blur(12px)", WebkitBackdropFilter: "blur(12px)" }}
      onClick={onClose}
    >
      <div className="fixed top-[calc(env(safe-area-inset-top)+8px)] left-[12px] right-[12px] z-61 max-h-[70dvh] flex flex-col border border-[var(--border)] bg-[var(--surface)] rounded-[24px] shadow-2xl backdrop-blur-2xl overflow-hidden" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[var(--border)] bg-[var(--surface)]">
          <div className="flex-1 relative">
            <Icon icon={MagnifyingGlass} size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)]" />
            <input
              ref={inputRef}
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="Cari catatan atau koleksi"
              autoFocus
              className="w-full h-10 pl-10 pr-12 text-[16px] bg-transparent outline-none"
              style={{ fontSize: "16px" }}
            />
            {query.length > 0 && (
              <button onClick={() => { setQuery(""); inputRef.current?.focus(); }} className="absolute right-2 top-1/2 -translate-y-1/2 text-[var(--text-muted)] hover:text-[var(--foreground)]">
                <Icon icon={X} size={18} weight="regular" />
              </button>
            )}
          </div>
          <button onClick={onClose} className="text-[var(--text-muted)] hover:text-[var(--foreground)]">
            Batal
          </button>
        </div>
        <div className="flex-1 overflow-y-auto py-2">
          {q.length === 0 ? (
            <div className="px-5 space-y-3">
              <p className="text-[12px] font-medium text-[var(--text-muted)] uppercase tracking-wider">Pencarian terbaru</p>
              <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                {["Disematkan", "Catatan hari ini", "Arsip"].map((label) => (
                  <button key={label} onClick={() => { setQuery(label); }} className="flex items-center gap-2 rounded-xl bg-[var(--card-muted)] px-3 py-1.5 text-[12px] text-[var(--text-muted)] whitespace-nowrap">
                    {label}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="px-5">
              {filteredNotes.length > 0 && (
                <>
                  <p className="mb-2 px-5 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Catatan</p>
                  {filteredNotes.map((n, i) => (
                    <button
                      key={n.id}
                      onClick={() => { window.location.href = `/catatan/${n.id}?mode=edit`; onClose(); }}
                      className={cn("flex items-center gap-3 px-5 py-3 border-b border-[var(--border)/50]", focusedIndex === i && "bg-[var(--accent-soft)]")}
                      style={{ minHeight: "56px" }}
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--card-muted)] text-[var(--text-muted)]">
                        <CollectionIcon icon={n.color && n.color !== "polos" ? n.color : "polos"} size={18} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[14px] font-medium truncate">{n.title}</div>
                        <div className="text-[12px] text-[var(--text-muted)] truncate">{n.contentText?.slice(0, 60) || ""}</div>
                      </div>
                    </button>
                  ))}
                </>
              )}
              {filteredCollections.length > 0 && (
                <>
                  <p className="mb-2 px-5 text-[11px] font-semibold uppercase tracking-wider text-[var(--text-muted)]">Koleksi</p>
                  {filteredCollections.map((c, i) => (
                    <button
                      key={c.id}
                      onClick={() => { window.location.href = `/koleksi/${c.id}`; onClose(); }}
                      className={cn("flex items-center gap-3 px-5 py-3 border-b border-[var(--border)/50]", focusedIndex === filteredNotes.length + i && "bg-[var(--accent-soft)]")}
                      style={{ minHeight: "56px" }}
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[var(--card-muted)] text-[var(--text-muted)]">
                        <CollectionIconMini icon={c.icon} color={c.color} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-[14px] font-medium truncate">{c.name}</div>
                        <div className="text-[12px] text-[var(--text-muted)] truncate">Koleksi</div>
                      </div>
                    </button>
                  ))}
                </>
              )}
              {filteredNotes.length === 0 && filteredCollections.length === 0 && (
                <div className="flex flex-col items-center justify-center py-20 text-center">
                  <Icon icon={X} size={40} className="text-[var(--text-muted)]" />
                  <p className="mt-3 text-[14px] text-[var(--text-muted)]">Tidak ada hasil untuk “{query}”</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function CollectionIconMini({ icon, color }: { icon?: string; color?: string }) {
  return <CollectionIcon icon={icon} color={color} size={24} />;
}
