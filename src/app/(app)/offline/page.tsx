export default function OfflinePage() {
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-3 p-6 text-center">
      <h1 className="text-2xl font-bold">Anda sedang offline</h1>
      <p className="text-[var(--muted)]">VINOTE tetap bisa digunakan. Perubahan akan disinkronkan saat online.</p>
    </div>
  );
}
