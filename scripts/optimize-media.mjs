import { copyFile, mkdir, readdir, rename, rm, stat, writeFile } from "node:fs/promises";
import { dirname, extname, join, relative, resolve } from "node:path";
import { spawnSync } from "node:child_process";
import sharp from "sharp";
import ffmpeg from "ffmpeg-static";

const sourceRoot = resolve("assets-source");
const outputRoot = resolve("src/assets");
const report = [];
const imageLimits = {
  "homepage.png": 1536,
  "garden-tile.png": 630,
  "quest-bg.png": 1469,
  "spinwheel.png": 738,
  "wheel-base.png": 688,
  "logo.png": 320,
  "login-owl.png": 384,
  "congratulations.png": 256,
  "ball.png": 320, "kite.png": 320, "memory.png": 320,
  "seeds.png": 320, "rice.png": 320, "worm.png": 320, "fish.png": 320
};

function encode(args) {
  const result = spawnSync(ffmpeg, ["-hide_banner", "-loglevel", "error", "-y", ...args], { encoding: "utf8", windowsHide: true });
  if (result.error || result.status !== 0) throw new Error(result.error?.message ?? result.stderr);
}

async function files(dir) {
  const entries = await readdir(dir, { withFileTypes: true });
  const nested = await Promise.all(entries.map((entry) => entry.isDirectory() ? files(join(dir, entry.name)) : join(dir, entry.name)));
  return nested.flat().sort();
}

for (const source of await files(sourceRoot)) {
  const path = relative(sourceRoot, source);
  const extension = extname(path);
  if (extension === ".woff2") continue;
  const output = join(outputRoot, extension === ".png" ? path.replace(/\.png$/, ".webp") : path);
  await mkdir(dirname(output), { recursive: true });

  if (extension === ".png") {
    const limit = path.startsWith("owl") ? 640 : imageLimits[path.split(/[\\/]/).at(-1)] ?? 192;
    await sharp(source).resize({ width: limit, height: limit, fit: "inside", withoutEnlargement: true })
      .webp({ quality: 90, alphaQuality: 100, effort: 6, smartSubsample: true }).toFile(output);
  } else if (extension === ".mp4") {
    const candidate = output.replace(/\.mp4$/, ".candidate.mp4");
    encode(["-i", source, "-map_metadata", "-1", "-c:v", "libx264", "-preset", "slow", "-crf", "22", "-pix_fmt", "yuv420p", "-c:a", "copy", "-movflags", "+faststart", candidate]);
    if ((await stat(candidate)).size < (await stat(source)).size * 0.9) await rename(candidate, output);
    else {
      await rm(candidate);
      encode(["-i", source, "-map_metadata", "-1", "-c", "copy", "-movflags", "+faststart", output]);
    }
    const frame = output.replace(/\.mp4$/, ".poster.png");
    encode(["-i", source, "-frames:v", "1", frame]);
    await sharp(frame).webp({ quality: 90, effort: 6 }).toFile(output.replace(/\.mp4$/, ".webp"));
    await rm(frame);
  } else if (extension === ".mp3" && !path.endsWith("background.mp3")) {
    const candidate = output.replace(/\.mp3$/, ".candidate.mp3");
    encode(["-i", source, "-map_metadata", "-1", "-c:a", "libmp3lame", "-ac", "1", "-b:a", path.endsWith("ticker.mp3") ? "48k" : "64k", candidate]);
    if ((await stat(candidate)).size < (await stat(source)).size * 0.9) await rename(candidate, output);
    else { await rm(candidate); await copyFile(source, output); }
  } else {
    await copyFile(source, output);
  }
  report.push({ source: path.replaceAll("\\", "/"), before: (await stat(source)).size, after: (await stat(output)).size });
  console.log(`${path}: ${report.at(-1).before} -> ${report.at(-1).after} bytes`);
}

const totals = report.reduce((sum, file) => ({ before: sum.before + file.before, after: sum.after + file.after }), { before: 0, after: 0 });
await mkdir("temp/performance-audit", { recursive: true });
await writeFile("temp/performance-audit/media-summary.json", JSON.stringify({ totals, files: report }, null, 2));
console.log(`Media: ${(totals.before / 1048576).toFixed(2)} -> ${(totals.after / 1048576).toFixed(2)} MiB`);
await import("./optimize-font.mjs");
