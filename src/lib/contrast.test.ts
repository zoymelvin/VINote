import { describe, it, expect } from "vitest";
import fs from "node:fs";
import path from "node:path";
import { contrastRatio } from "@/lib/contrast";

function block(css: string, selector: string) {
  const re = new RegExp(selector.replace(/[.*+?^${}()|[\]\\]/g, "\\$&") + "\\s*\\{([\\s\\S]*?)\\}", "m");
  const m = css.match(re);
  if (!m) throw new Error(`missing block ${selector}`);
  return m[1];
}

function vars(cssBlock: string) {
  const out: Record<string, string> = {};
  for (const m of cssBlock.matchAll(/(--[\w-]+)\s*:\s*(#[0-9a-fA-F]{3,6})/g)) {
    out[m[1]] = m[2];
  }
  return out;
}

describe("note color contrast", () => {
  const css = fs.readFileSync(path.resolve(process.cwd(), "src/app/globals.css"), "utf8");
  const light = vars(block(css, ":root"));
  const dark = vars(block(css, ".dark"));

  const colors = ["neutral", "pink", "orange", "yellow", "green", "teal", "blue", "purple", "lavender", "stone"];

  for (const theme of [
    { name: "light", vars: light },
    { name: "dark", vars: dark },
  ]) {
    for (const c of colors) {
      it(`${theme.name} ${c} >= 4.5`, () => {
        const bg = theme.vars[`--note-${c}-bg`];
        const fg = theme.vars[`--note-${c}-fg`];
        expect(bg).toBeTruthy();
        expect(fg).toBeTruthy();
        expect(contrastRatio(fg, bg)).toBeGreaterThanOrEqual(4.5);
      });
    }
  }
});
