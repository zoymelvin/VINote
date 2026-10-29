"use client";
import { useToast } from "@/stores/toast";

export function ToastHost() {
  const items = useToast((s) => s.items);
  const remove = useToast((s) => s.remove);
  return (
    <div className="fixed bottom-24 left-1/2 z-50 flex -translate-x-1/2 flex-col gap-2 md:bottom-6">
      {items.map((t) => (
        <div key={t.id} className="flex items-center gap-3 rounded-2xl bg-[var(--foreground)] px-4 py-3 text-sm text-[var(--background)] shadow-[var(--shadow-2)]">
          <span>{t.message}</span>
          {t.undo && (
            <button className="font-semibold text-[var(--accent)]" onClick={() => { t.undo?.(); remove(t.id); }}>
              Undo
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
