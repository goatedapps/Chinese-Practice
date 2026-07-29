import type { ReactNode } from "react";

// Renders plain text but turns __word__ markers into an underlined span --
// used for "画线词语 / underlined word" style questions (hanyu pinyin,
// phrase-meaning, etc.) where the source paper underlined a target word.
export function RichText({ text }: { text: string }): ReactNode {
  const parts: ReactNode[] = [];
  const re = /__(.+?)__/g;
  let lastIndex = 0;
  let m: RegExpExecArray | null;
  let key = 0;
  while ((m = re.exec(text)) !== null) {
    if (m.index > lastIndex) parts.push(<span key={key++}>{text.slice(lastIndex, m.index)}</span>);
    parts.push(
      <u key={key++} className="underline-word">
        {m[1]}
      </u>
    );
    lastIndex = re.lastIndex;
  }
  if (lastIndex < text.length) parts.push(<span key={key++}>{text.slice(lastIndex)}</span>);
  return <>{parts}</>;
}
