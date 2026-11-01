"use client";
import * as React from "react";
import { CollectionPicker } from "@/components/shared/collection-picker";

type Ctx = {
  noteId: string | null;
  open: boolean;
  setNoteId: (id: string | null) => void;
  setOpen: (v: boolean) => void;
};

const Ctx = React.createContext<Ctx | null>(null);

export function useCollectionPicker() {
  const ctx = React.useContext(Ctx);
  if (!ctx) throw new Error("useCollectionPicker must be inside CollectionPickerProvider");
  return ctx;
}

export function CollectionPickerProvider({ children }: { children: React.ReactNode }) {
  const [noteId, setNoteId] = React.useState<string | null>(null);
  const [open, setOpen] = React.useState(false);

  React.useEffect(() => {
    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail || {};
      setNoteId(detail.noteId ?? null);
      setOpen(true);
    };
    window.addEventListener("vinote:open-picker", handler as EventListener);
    return () => window.removeEventListener("vinote:open-picker", handler as EventListener);
  }, []);

  return (
    <Ctx.Provider value={{ noteId, open, setNoteId, setOpen }}>
      {children}
      <CollectionPicker noteId={noteId} open={open} onClose={() => setOpen(false)} />
    </Ctx.Provider>
  );
}

export function openCollectionPicker(noteId: string | null = null) {
  window.dispatchEvent(new CustomEvent("vinote:open-picker", { detail: { noteId } }));
}