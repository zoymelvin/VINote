"use client";
import { useEffect } from "react";

export function Dialog({ open, onClose, children, title }: { open: boolean; onClose: () => void; children: React.ReactNode; title?: string }) {
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onClose]);
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative z-10 w-full max-w-lg rounded-[28px] bg-[var(--card)] p-5 shadow-[var(--shadow-2)]">
        {title && <div className="mb-3 text-lg font-semibold">{title}</div>}
        {children}
      </div>
    </div>
  );
}
