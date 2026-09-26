import { readdir, stat } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";

const roots = ["public/images", "public/brand/new"];
const logoNames = new Set(["logo-icon-only.png", "logo-full-lockup.png"]);

async function filesIn(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const out = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) out.push(...(await filesIn(full)));
    else out.push(full);
  }
  return out;
}

let written = 0;
for (const root of roots) {
  const files = await filesIn(root);
  for (const file of files) {
    if (!/\.(jpe?g|png)$/i.test(file)) continue;
    if (file.includes(`${path.sep}brand${path.sep}`) && !logoNames.has(path.basename(file))) continue;
    const out = file.replace(/\.(jpe?g|png)$/i, ".webp");
    const before = await stat(file);
    await sharp(file)
      .rotate()
      .resize({ width: 1600, withoutEnlargement: true })
      .webp({ quality: 74 })
      .toFile(out);
    const after = await stat(out);
    written += 1;
    console.log(`${path.basename(file)} ${before.size} -> ${path.basename(out)} ${after.size}`);
  }
}
console.log(`wrote ${written} webp files`);
