import { useState } from "react";
import { useAppDispatch } from "../../state/AppStateContext";
import type { MyVocabEntry } from "../../data/types";
import { loadMyVocab, removeFromMyVocab } from "../../state/myVocab";
import { Icon } from "../common/Icons";

interface LessonGroup {
  lessonId: number | null;
  lessonTitle: string;
  entries: MyVocabEntry[];
}

// Buckets by lessonId (falling back to lessonTitle for a Custom Review save,
// which has no real lessonId) so words saved from the same lesson always
// land in the same group even if their lessonTitle string ever drifted --
// sorted with real lesson numbers first, ungrouped/Custom Review saves last.
function groupByLesson(entries: MyVocabEntry[]): LessonGroup[] {
  const groups = new Map<string, LessonGroup>();
  for (const entry of entries) {
    const key = entry.lessonId != null ? `id:${entry.lessonId}` : `title:${entry.lessonTitle}`;
    let group = groups.get(key);
    if (!group) {
      group = { lessonId: entry.lessonId, lessonTitle: entry.lessonTitle, entries: [] };
      groups.set(key, group);
    }
    group.entries.push(entry);
  }
  return [...groups.values()].sort((a, b) => {
    if (a.lessonId == null && b.lessonId == null) return a.lessonTitle.localeCompare(b.lessonTitle);
    if (a.lessonId == null) return 1;
    if (b.lessonId == null) return -1;
    return a.lessonId - b.lessonId;
  });
}

export function MyVocab() {
  const dispatch = useAppDispatch();
  const [entries, setEntries] = useState(loadMyVocab);
  // Per-visit column visibility -- not persisted, just a reading aid while
  // browsing this screen (e.g. hide pinyin/meaning to self-test).
  const [showPinyin, setShowPinyin] = useState(true);
  const [showMeaning, setShowMeaning] = useState(true);

  function remove(word: string) {
    removeFromMyVocab(word);
    setEntries((prev) => prev.filter((e) => e.word !== word));
  }

  const groups = groupByLesson(entries);

  return (
    <div className="screen my-vocab-screen">
      <button className="back-btn" onClick={() => dispatch({ type: "RESET_TO_HOME" })}>
        <span className="back-btn-arrow">←</span>
        <span className="back-btn-label">返回 Back</span>
      </button>
      <h1 className="page-header">
        <Icon name="sparkle" className="page-header-spark" />
        <img className="page-header-icon" src="/icons/dictation-learn.png" alt="" />
        我的词库 My Vocab
        <Icon name="sparkle" className="page-header-spark" />
      </h1>

      {entries.length > 0 && (
        <div className="my-vocab-controls">
          <label className="my-vocab-toggle-label">
            <input type="checkbox" checked={showPinyin} onChange={(e) => setShowPinyin(e.target.checked)} />
            显示拼音 Show Pinyin
          </label>
          <label className="my-vocab-toggle-label">
            <input type="checkbox" checked={showMeaning} onChange={(e) => setShowMeaning(e.target.checked)} />
            显示英文 Show Meaning
          </label>
        </div>
      )}

      {entries.length === 0 ? (
        <p className="tingxie-empty">还没有加入任何词语。No words saved yet -- add some from Dictation's Learn/Apply/Test screens.</p>
      ) : (
        <div className="my-vocab-groups">
          {groups.map((group) => (
            <div key={group.lessonId ?? group.lessonTitle} className="my-vocab-lesson-group">
              <h2 className="my-vocab-lesson-title">{group.lessonTitle}</h2>
              <div className="my-vocab-table">
                {group.entries.map((entry) => (
                  <div key={entry.id} className="my-vocab-row">
                    <span className="my-vocab-word">{entry.word}</span>
                    {showPinyin && <span className="my-vocab-pinyin">{entry.pinyin}</span>}
                    {showMeaning && <span className="my-vocab-meaning">{entry.meaning}</span>}
                    <button type="button" className="my-vocab-remove-btn" aria-label="移除 Remove" onClick={() => remove(entry.word)}>
                      <Icon name="close" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
