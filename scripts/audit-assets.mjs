import assert from "node:assert/strict";
import { readdir, readFile, stat } from "node:fs/promises";
import { join } from "node:path";
import { gzipSync } from "node:zlib";
import sharp from "sharp";
import * as fontkit from "fontkit";

async function files(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  return (await Promise.all(entries.map((entry) => entry.isDirectory() ? files(join(dir, entry.name)) : join(dir, entry.name)))).flat();
}

const assets = await files("src/assets");
const hosting = JSON.parse(await readFile("vercel.json", "utf8"));
for (const rule of hosting.headers) {
  assert.equal(typeof rule.source, "string");
  for (const header of rule.headers) {
    assert.equal(typeof header.key, "string");
    assert.equal(typeof header.value, "string");
  }
}
const images = [...assets, ...await files("public")].filter((file) => /\.(webp|png|jpe?g)$/.test(file));
const fontCharacters = new Set();
for (const file of assets.filter((file) => file.endsWith(".woff2"))) {
  for (const code of fontkit.create(await readFile(file)).characterSet) fontCharacters.add(code);
}
for (const code of fontkit.create(await readFile("assets-source/fonts/SmileySans-Oblique.woff2")).characterSet) {
  assert(fontCharacters.has(code), `Font character lost: U+${code.toString(16)}`);
}
for (const file of images) {
  const info = await sharp(file).metadata();
  assert(info.width > 0 && info.height > 0, `Invalid image: ${file}`);
}
for (const stage of ["egg", "baby", "toddler", "young", "teenager", "adult"]) {
  for (const mood of ["happy", "very_happy", "neutral", "sad"]) {
    await stat(`src/assets/owl/owl-${stage}-${mood}.webp`);
  }
}
for (const file of assets.filter((file) => file.endsWith(".mp4"))) {
  const bytes = await readFile(file);
  const atoms = [];
  for (let offset = 0; offset + 8 <= bytes.length;) {
    const size = bytes.readUInt32BE(offset);
    if (!size) break;
    atoms.push(bytes.toString("ascii", offset + 4, offset + 8));
    offset += size === 1 ? Number(bytes.readBigUInt64BE(offset + 8)) : size;
  }
  assert(atoms.indexOf("moov") >= 0 && atoms.indexOf("moov") < atoms.indexOf("mdat"), `Video lacks fast start: ${file}`);
}
const manifest = JSON.parse(await readFile("dist/.vite/manifest.json", "utf8"));
const initial = new Set();
function visit(key) {
  if (initial.has(key)) return;
  initial.add(key);
  for (const dependency of manifest[key].imports ?? []) visit(dependency);
}
visit("index.html");
const initialScripts = await Promise.all([...initial].map((key) => readFile(join("dist", manifest[key].file))));
const mediaBytes = (await Promise.all(assets.map((file) => stat(file)))).reduce((sum, item) => sum + item.size, 0);
const html = await readFile("dist/index.html", "utf8");
assert(!html.includes("fonts.googleapis.com"));
assert(/rel="preload"[^>]+\/assets\/homepage-[^>]+\.webp/.test(html));
assert(![...initial].some((key) => /questionSchema|yaml/.test(key)), "YAML parser loaded during startup");
console.log(JSON.stringify({
  checkedImages: images.length,
  checkedVideos: assets.filter((file) => file.endsWith(".mp4")).length,
  mediaBytes,
  commonHeadingFontBytes: (await stat("src/assets/fonts/smiley-common.woff2")).size,
  retainedFontCharacters: fontCharacters.size,
  initialJsBytes: initialScripts.reduce((sum, file) => sum + file.length, 0),
  initialJsGzipBytes: initialScripts.reduce((sum, file) => sum + gzipSync(file).length, 0),
  startupChunks: [...initial],
  deferredScreens: manifest["index.html"].dynamicImports.filter((key) => key.startsWith("src/components/"))
}, null, 2));
