import { describe, it, expect } from "vitest";
import { getGreeting } from "@/lib/greeting";

describe("getGreeting", () => {
  it("pagi 05:00-10:59", () => {
    expect(getGreeting(new Date("2024-01-01T05:00:00"))).toBe("Selamat pagi");
    expect(getGreeting(new Date("2024-01-01T10:59:00"))).toBe("Selamat pagi");
  });
  it("siang 11:00-14:59", () => {
    expect(getGreeting(new Date("2024-01-01T11:00:00"))).toBe("Selamat siang");
    expect(getGreeting(new Date("2024-01-01T14:59:00"))).toBe("Selamat siang");
  });
  it("sore 15:00-17:59", () => {
    expect(getGreeting(new Date("2024-01-01T15:00:00"))).toBe("Selamat sore");
    expect(getGreeting(new Date("2024-01-01T17:59:00"))).toBe("Selamat sore");
  });
  it("malam 18:00-04:59", () => {
    expect(getGreeting(new Date("2024-01-01T18:00:00"))).toBe("Selamat malam");
    expect(getGreeting(new Date("2024-01-01T04:59:00"))).toBe("Selamat malam");
    expect(getGreeting(new Date("2024-01-01T23:59:00"))).toBe("Selamat malam");
  });
});
