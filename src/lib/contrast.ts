export function parseHex(hex: string): [number, number, number] {
  const h = hex.trim().replace(/^#/, "");
  const full = h.length === 3 ? h.split("").map((c) => c + c).join("") : h;
  if (full.length !== 6) throw new Error(`bad hex: ${hex}`);
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ];
}

function srgbToLinear(c: number) {
  return c <= 0.04045 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4);
}

function oklchToLinearRGB(l: number, c: number, h: number): [number, number, number] {
  const a = c * Math.cos((h * Math.PI) / 180);
  const b = c * Math.sin((h * Math.PI) / 180);
  const l_ = l + 0.3963377774 * a + 0.2158037573 * b;
  const m_ = l - 0.1055613458 * a - 0.0638541728 * b;
  const s_ = l - 0.0894841775 * a - 1.2914855480 * b;
  const l3 = l_ * l_ * l_;
  const m3 = m_ * m_ * m_;
  const s3 = s_ * s_ * s_;
  const r = +0.4122214708 * l3 + 0.5363325363 * m3 + 0.0514459929 * s3;
  const g = +0.2119034982 * l3 + 0.6806995451 * m3 + 0.1073969566 * s3;
  const bb = +0.0883024619 * l3 + 0.2817188376 * m3 + 0.6299787005 * s3;
  return [srgbToLinear(Math.max(0, Math.min(1, r))), srgbToLinear(Math.max(0, Math.min(1, g))), srgbToLinear(Math.max(0, Math.min(1, bb)))];
}

export function relativeLuminance(hex: string) {
  const [r, g, b] = parseHex(hex);
  return 0.2126 * srgbToLinear(r / 255) + 0.7152 * srgbToLinear(g / 255) + 0.0722 * srgbToLinear(b / 255);
}

export function contrastRatio(fg: string, bg: string) {
  const l1 = parseColorLuminance(fg);
  const l2 = parseColorLuminance(bg);
  const [hi, lo] = l1 > l2 ? [l1, l2] : [l2, l1];
  return (hi + 0.05) / (lo + 0.05);
}

function parseColorLuminance(color: string): number {
  const trimmed = color.trim();
  if (trimmed.startsWith("#")) {
    return relativeLuminance(trimmed);
  }
  if (trimmed.startsWith("oklch(")) {
    const m = trimmed.match(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)/);
    if (!m) throw new Error(`bad oklch: ${color}`);
    const [, l, c, h] = m.map(Number);
    const [r, g, b] = oklchToLinearRGB(l, c, h);
    return 0.2126 * r + 0.7152 * g + 0.0722 * b;
  }
  if (trimmed.startsWith("rgb(") || trimmed.startsWith("rgba(")) {
    const nums = trimmed.match(/\d+/g)?.map(Number) ?? [0, 0, 0];
    const [r, g, b] = nums;
    return 0.2126 * srgbToLinear((r ?? 0) / 255) + 0.7152 * srgbToLinear((g ?? 0) / 255) + 0.0722 * srgbToLinear((b ?? 0) / 255);
  }
  throw new Error(`unsupported color: ${color}`);
}
