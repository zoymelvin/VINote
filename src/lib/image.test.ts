import { describe, it, expect } from "vitest";
import { calculateDimensions, shouldPreservePng, validateSourceSize, validateImageCount, MAX_SOURCE_SIZE, MAX_IMAGES_PER_NOTE, MAX_LONG_EDGE } from "@/lib/image";

describe("image", () => {
  it("calculateDimensions: no upscale", () => {
    expect(calculateDimensions(800, 600)).toEqual({ width: 800, height: 600 });
  });

  it("calculateDimensions: downscale long edge", () => {
    const result = calculateDimensions(3200, 2400);
    expect(result.width).toBe(1600);
    expect(result.height).toBe(1200);
  });

  it("calculateDimensions: portrait", () => {
    const result = calculateDimensions(1200, 3200);
    expect(result.width).toBe(600);
    expect(result.height).toBe(1600);
  });

  it("calculateDimensions: zero input", () => {
    expect(calculateDimensions(0, 0)).toEqual({ width: 0, height: 0 });
  });

  it("shouldPreservePng: png true", () => {
    expect(shouldPreservePng("image/png")).toBe(true);
  });

  it("shouldPreservePng: jpeg false", () => {
    expect(shouldPreservePng("image/jpeg")).toBe(false);
  });

  it("validateSourceSize: under limit", () => {
    expect(validateSourceSize(1024)).toBe(true);
  });

  it("validateSourceSize: over limit", () => {
    expect(validateSourceSize(MAX_SOURCE_SIZE + 1)).toBe(false);
  });

  it("validateImageCount: under limit", () => {
    expect(validateImageCount(MAX_IMAGES_PER_NOTE - 1)).toBe(true);
  });

  it("validateImageCount: at limit", () => {
    expect(validateImageCount(MAX_IMAGES_PER_NOTE)).toBe(false);
  });
});
