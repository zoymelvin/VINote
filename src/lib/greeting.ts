export function getGreeting(now = new Date()): string {
  const h = now.getHours();
  if (h >= 5 && h < 11) return "Selamat pagi";
  if (h >= 11 && h < 15) return "Selamat siang";
  if (h >= 15 && h < 18) return "Selamat sore";
  return "Selamat malam";
}
