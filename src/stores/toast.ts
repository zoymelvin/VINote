import { create } from "zustand";

export interface ToastItem {
  id: string;
  message: string;
  undo?: () => void;
  duration?: number;
}

interface ToastState {
  items: ToastItem[];
  push: (t: Omit<ToastItem, "id">) => string;
  remove: (id: string) => void;
}

export const useToast = create<ToastState>((set) => ({
  items: [],
  push: (t) => {
    const id = crypto.randomUUID();
    set((s) => ({ items: [...s.items, { ...t, id }] }));
    setTimeout(() => set((s) => ({ items: s.items.filter((i) => i.id !== id) })), t.duration ?? 4000);
    return id;
  },
  remove: (id) => set((s) => ({ items: s.items.filter((i) => i.id !== id) })),
}));
