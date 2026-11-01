"use client";
import * as React from "react";
import { useLiveQuery } from "dexie-react-hooks";
import { listCollections, createCollection, updateCollection } from "@/lib/db/repo";
import { Icon } from "@/components/icons";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Field } from "@/components/shared/field";
import { Dialog } from "@/components/ui/dialog";
import { CollectionIcon } from "@/components/shared/collection-icon";
import { cn } from "@/lib/utils";
import {
  Folder, Briefcase, House, Lightbulb, Palette, Books, Target, AirplaneTilt, Barbell, FlowerLotus,
  Brain, Robot, Code, Rocket, Heart, Star, GraduationCap, ShoppingCart, Camera, MusicNotes,
  GameController, Leaf, CurrencyCircleDollar, Atom, Flask, Bookmark, Calendar, ChartLineUp, Globe, Wrench, ForkKnife, FilmSlate,
} from "@phosphor-icons/react";

const ICONS = [
  "Folder", "Briefcase", "House", "Lightbulb", "Palette", "Books", "Target", "AirplaneTilt",
  "Barbell", "FlowerLotus", "Brain", "Robot", "Code", "Rocket", "Heart", "Star",
  "GraduationCap", "ShoppingCart", "Camera", "MusicNotes", "GameController", "Leaf",
  "CurrencyCircleDollar", "Atom", "Flask", "Bookmark", "Calendar", "ChartLineUp", "Globe",
  "Wrench", "ForkKnife", "FilmSlate",
];

interface CollectionDialogProps {
  open: boolean;
  onClose: () => void;
  editingId?: string | null;
}

export function CollectionDialog({ open, onClose, editingId }: CollectionDialogProps) {
  const collections = useLiveQuery(() => listCollections(), []);
  const [name, setName] = React.useState("");
  const [icon, setIcon] = React.useState("Folder");
  const [description, setDescription] = React.useState("");
  const [error, setError] = React.useState("");

  const editing = editingId ? collections?.find((c) => c.id === editingId) : null;

  // Form state is reset by parent via key prop

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = name.trim();
    if (!trimmed) {
      setError("Nama wajib diisi");
      return;
    }
    const dup = (collections ?? []).find(
      (c) => c.name.toLowerCase() === trimmed.toLowerCase() && c.id !== editingId
    );
    if (dup) {
      setError("Nama koleksi sudah ada");
      return;
    }
    if (editingId) {
      await updateCollection(editingId, { name: trimmed, icon, description: description.trim().slice(0, 120) });
    } else {
      const c = await createCollection({ name: trimmed, icon, description: description.trim().slice(0, 120) });
      // navigate? handled by caller
    }
    onClose();
  }

  const valid = name.trim().length > 0 && !error;

  return (
    <Dialog open={open} onClose={onClose} title={editingId ? "Edit koleksi" : "Koleksi baru"}>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex justify-center">
          <CollectionIcon icon={icon} size={56} />
        </div>
        <Field label="Nama" error={error}>
          <Input value={name} onChange={(e) => { setName(e.target.value); setError(""); }} placeholder="Nama koleksi" required />
        </Field>
        <div>
          <div className="mb-2 text-xs font-semibold text-[var(--text-muted)]">Ikon</div>
          <div className="grid grid-cols-8 gap-1">
            {ICONS.map((ic) => (
              <button
                key={ic}
                type="button"
                onClick={() => setIcon(ic)}
                className={cn(
                  "flex h-9 w-9 items-center justify-center rounded-lg transition",
                  icon === ic ? "ring-2 ring-[var(--accent)] bg-[var(--accent-soft)]" : "hover:bg-[var(--card-muted)]"
                )}
              >
                <CollectionIcon icon={ic} size={24} />
              </button>
            ))}
          </div>
        </div>
        <Field label="Deskripsi (opsional)">
          <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Deskripsi koleksi" maxLength={120} />
        </Field>
        <div className="flex justify-end gap-2">
          <Button type="button" variant="secondary" onClick={onClose}>Batal</Button>
          <Button type="submit" disabled={!valid}>{editingId ? "Simpan" : "Buat"}</Button>
        </div>
      </form>
    </Dialog>
  );
}
