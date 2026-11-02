import { chromium } from "playwright";
import fs from "node:fs";
import path from "path";

const baseDir = "/tmp/vinote-baseline";
const curDir = "/tmp/vinote-current";

const files = fs.readdirSync(baseDir).filter(f => f.endsWith(".png")).sort();

let totalDiff = 0;
let filesChecked = 0;
let diffs = [];

for (const f of files) {
  const b = path.join(baseDir, f);
  const c = path.join(curDir, f);
  if (!fs.existsSync(c)) {
    diffs.push({ file: f, status: "MISSING_CURRENT" });
    continue;
  }
  filesChecked++;
  const ba = fs.readFileSync(b);
  const ca = fs.readFileSync(c);
  if (ba.length === ca.length) {
    let diff = 0;
    for (let i = 0; i < ba.length; i++) {
      if (ba[i] !== ca[i]) diff++;
    }
    if (diff > 0) {
      totalDiff += diff;
      diffs.push({ file: f, diffBytes: diff, totalBytes: ba.length });
    }
  } else {
    diffs.push({ file: f, status: "SIZE_DIFF", base: ba.length, cur: ca.length });
  }
}

console.log("Files checked:", filesChecked);
console.log("Total differing bytes:", totalDiff);
console.log("Diff count:", diffs.length);
for (const d of diffs.slice(0, 20)) {
  console.log(JSON.stringify(d));
}