"use client";
import * as React from "react";
import { Icon } from "@/components/icons";

interface SheetProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

export function Sheet({ open, onClose, title, children }: SheetProps) {
  React.useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center" role="dialog" aria-modal>
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-t-[24px] bg-[var(--card)] p-5 shadow-[var(--shadow-2)] sm:rounded-[20px]">
        <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-[var(--border)] sm:hidden" />
        {title && <div className="mb-4 text-lg font-semibold">{title}</div>}
        {children}
      </div>
    </div>
  );
}
