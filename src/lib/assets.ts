const files = import.meta.glob<string>("../assets/**/*.{webp,mp4,mp3,svg}", {
  eager: true,
  query: "?url&no-inline",
  import: "default"
});

export function optionalAssetUrl(path: string): string | undefined {
  return files[`../assets${path}`];
}

export function assetUrl(path: string): string {
  const url = optionalAssetUrl(path);
  if (!url) throw new Error(`Missing app asset: ${path}`);
  return url;
}
