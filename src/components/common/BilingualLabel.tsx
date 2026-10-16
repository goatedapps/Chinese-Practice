export function BilingualLabel({ zh, en }: { zh: string; en: string }) {
  return (
    <span className="bilingual-label">
      <span lang="zh-Hans">{zh}</span>
      <span className="bilingual-label-en" lang="en">{en}</span>
    </span>
  );
}
