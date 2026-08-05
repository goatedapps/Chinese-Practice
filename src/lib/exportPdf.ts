import type { QuestionGroup, GroupResult, Question, GroupResultItem, HistoryEntry } from "../data/types";
import { correctOptionFor } from "./grading";
import { getTodaySummary, type TodayTingxieWrong } from "../state/todaySummary";
import { getTodayStats, isTingxieMissionComplete } from "./stats";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// Same __word__ -> underline convention as lib/richText.tsx's RichText, but
// producing an HTML string for the print window instead of React nodes.
function richTextHtml(text: string): string {
  return escapeHtml(text).replace(/__(.+?)__/g, "<u>$1</u>");
}

function statusLabel(item: GroupResultItem | undefined): { cls: string; label: string } {
  if (!item || item.correct === null) return { cls: "pending", label: "未自评 Not self-checked" };
  if (item.skipped) return { cls: "skipped", label: "未作答 Not answered" };
  return item.correct ? { cls: "correct", label: "✓ 正确 Correct" } : { cls: "incorrect", label: "✗ 错误 Incorrect" };
}

function renderQuestion(
  q: Question,
  group: QuestionGroup,
  displayNo: number,
  item: GroupResultItem | undefined
): string {
  const { cls, label } = statusLabel(item);
  let bodyHtml: string;

  if (q.format === "MCQ") {
    const bank = group.optionBank ?? q.options ?? [];
    const optionsHtml = bank
      .map((opt) => {
        const isChosen = item?.answer === opt.key;
        const isCorrect = opt.key === q.correctKey;
        const tags = [isChosen ? "你的答案 Your answer" : "", isCorrect ? "正确答案 Correct answer" : ""]
          .filter(Boolean)
          .join(" · ");
        return `<div class="opt${isChosen ? " chosen" : ""}${isCorrect ? " correct-opt" : ""}">${escapeHtml(opt.key)}. ${escapeHtml(opt.text)}${tags ? ` <span class="opt-tag">(${tags})</span>` : ""}</div>`;
      })
      .join("");
    bodyHtml = `<div class="options">${optionsHtml}</div>`;
    if (!bank.length) {
      const correctOpt = correctOptionFor(q, group);
      bodyHtml += `<div class="answer-line">你的答案 Your answer: ${item?.answer ? escapeHtml(item.answer) : "(未作答 blank)"}</div><div class="answer-line">正确答案 Correct answer: ${escapeHtml(correctOpt?.key ?? "")}. ${escapeHtml(correctOpt?.text ?? "")}</div>`;
    }
  } else if (q.format === "Fill-in") {
    bodyHtml = `<div class="answer-line">你的答案 Your answer: ${item?.answer ? escapeHtml(item.answer) : "(未作答 blank)"}</div><div class="answer-line">参考答案 Suggested answer: ${escapeHtml(q.displayAnswer)}</div>`;
  } else {
    bodyHtml = `<div class="answer-line">你的答案 Your answer: ${item?.answer ? escapeHtml(item.answer) : "(未作答 blank)"}</div><div class="answer-line">参考答案 Model answer: ${escapeHtml(q.displayAnswer)}</div>`;
  }

  return `
    <div class="question">
      <div class="q-head">
        <span>Q${displayNo}</span>
        <span class="marks">${q.marks} 分</span>
        <span class="status ${cls}">${label}</span>
      </div>
      <div class="q-text">${richTextHtml(q.text)}</div>
      ${q.context ? `<div class="q-context">${escapeHtml(q.context)}</div>` : ""}
      ${bodyHtml}
    </div>
  `;
}

// Shared by both exportSessionToPdf (one session) and exportTodaySummaryToPdf
// (every session completed today) -- renders passage/word-bank/questions for
// one QuestionGroup[]+GroupResult[] pair. Question numbers restart from 1
// within each call (each session gets its own Q1, Q2, ... run).
function renderGroupsHtml(groups: QuestionGroup[], results: GroupResult[]): string {
  let priorQuestionCount = 0;
  return groups
    .map((group, gi) => {
      const result = results[gi];
      const itemsByQNo = new Map((result?.items ?? []).map((it) => [it.qNo, it]));

      const passageHtml = group.passage
        ? `<div class="passage">
             <div class="passage-title">${escapeHtml(group.passage.title)}</div>
             ${group.passage.source ? `<div class="passage-source">${escapeHtml(group.passage.source)}</div>` : ""}
             <div class="passage-text">${escapeHtml(group.passage.text)}</div>
           </div>`
        : "";

      const bankHtml = group.optionBank
        ? `<div class="option-bank">
             <div class="option-bank-title">词语库 Word Bank</div>
             ${group.optionBank.map((o) => `<span class="bank-item">${escapeHtml(o.key)}. ${escapeHtml(o.text)}</span>`).join("")}
           </div>`
        : "";

      const questionsHtml = group.questions
        .map((q, qi) => renderQuestion(q, group, priorQuestionCount + qi + 1, itemsByQNo.get(q.qNo)))
        .join("");

      priorQuestionCount += group.questions.length;

      return `<div class="group">${passageHtml}${bankHtml}${questionsHtml}</div>`;
    })
    .join("");
}

const PRINT_STYLES = `
  * { box-sizing: border-box; }
  body { font-family: "Microsoft YaHei", "PingFang SC", "Segoe UI", sans-serif; color: #222; margin: 24px; line-height: 1.5; }
  h1 { font-size: 20px; margin: 0 0 4px; }
  h2.section-title { font-size: 16px; margin: 24px 0 10px; padding-top: 12px; border-top: 2px solid #ddd; }
  .meta { color: #555; font-size: 13px; margin-bottom: 16px; }
  .summary { border: 1px solid #ccc; border-radius: 8px; padding: 12px 16px; margin-bottom: 20px; font-size: 14px; }
  .summary-line { margin-bottom: 4px; }
  .session-label { font-size: 13px; font-weight: bold; color: #555; margin: 16px 0 6px; }
  .group { margin-bottom: 20px; }
  .passage { background: #f7f7f7; border-radius: 8px; padding: 10px 14px; margin-bottom: 10px; }
  .passage-title { font-weight: bold; }
  .passage-source { font-size: 12px; color: #666; margin-bottom: 6px; }
  .passage-text { white-space: pre-wrap; font-size: 13px; }
  .option-bank { margin-bottom: 10px; font-size: 13px; }
  .option-bank-title { font-weight: bold; margin-bottom: 4px; }
  .bank-item { display: inline-block; margin: 0 10px 4px 0; }
  .question { border-top: 1px solid #ddd; padding: 10px 0; page-break-inside: avoid; }
  .q-head { display: flex; gap: 10px; align-items: baseline; font-weight: bold; font-size: 13px; margin-bottom: 4px; }
  .marks { color: #888; font-weight: normal; }
  .status { margin-left: auto; font-size: 12px; padding: 1px 8px; border-radius: 999px; }
  .status.correct { background: #dcf5e0; color: #1e7a34; }
  .status.incorrect { background: #fde0e0; color: #a52020; }
  .status.skipped { background: #f0f0f0; color: #777; }
  .status.pending { background: #fff4d6; color: #8a6300; }
  .q-text { font-size: 14px; margin-bottom: 4px; }
  .q-context { font-size: 12px; color: #666; margin-bottom: 4px; }
  .options { font-size: 13px; margin-bottom: 4px; }
  .opt { padding: 2px 0; }
  .opt.chosen { font-weight: bold; }
  .opt.correct-opt { color: #1e7a34; }
  .opt-tag { font-weight: normal; font-size: 11px; color: #888; }
  .answer-line { font-size: 13px; margin-bottom: 2px; }
  .wrong-table { width: 100%; border-collapse: collapse; font-size: 13px; margin-bottom: 10px; }
  .wrong-table th, .wrong-table td { text-align: left; padding: 6px 8px; border-bottom: 1px solid #ddd; }
  .wrong-table th { color: #666; font-weight: normal; font-size: 12px; }
  u { text-decoration: underline; }
  @media print {
    .group { page-break-inside: avoid; }
  }
`;

// Opens a real new tab (not a hidden 0x0 iframe -- iOS/iPadOS Safari does not
// reliably fire print() on a hidden iframe's contentWindow, the dialog
// silently never appears) and prints it. Must be called synchronously from
// the click handler (not after an await) or Safari's popup blocker will
// swallow the window.open(). Chosen over a PDF-generation library (e.g.
// jsPDF) specifically to avoid embedding a CJK font just for Chinese-text
// rendering; see CLAUDE.md's dependency-light, offline-first stance.
function openPrintWindow(html: string): void {
  const win = window.open("", "_blank");
  if (!win) return; // popup blocked -- nothing we can do without a user gesture retry

  win.document.open();
  win.document.write(html);
  win.document.close();

  win.focus();
  // A freshly-written document needs a beat before print() reliably picks up
  // its content across browsers (most reliable as a load handler, but
  // document.write()'d windows don't always fire one consistently).
  setTimeout(() => win.print(), 300);
}

export interface ExportSummary {
  modeLabel: string;
  pct: number;
  correctItems: number;
  totalItems: number;
  skippedItems: number;
}

export function exportSessionToPdf(groups: QuestionGroup[], results: GroupResult[], summary: ExportSummary): void {
  const html = `<!doctype html>
<html lang="zh">
<head>
<meta charset="utf-8" />
<title>练习结果 Practice Results</title>
<style>${PRINT_STYLES}</style>
</head>
<body>
  <h1>练习结果 Practice Results</h1>
  <div class="meta">${escapeHtml(summary.modeLabel)} · ${escapeHtml(new Date().toLocaleString("zh-CN"))}</div>
  <div class="summary">
    得分 Score: <strong>${summary.pct}%</strong>
    答对 Correct: ${summary.correctItems} / ${summary.totalItems}
    ${summary.skippedItems ? `　未作答/未自评 Skipped: ${summary.skippedItems}` : ""}
  </div>
  ${renderGroupsHtml(groups, results)}
</body>
</html>`;

  openPrintWindow(html);
}

function wrongTableHtml(title: string, rows: TodayTingxieWrong[]): string {
  if (rows.length === 0) return "";
  const body = rows
    .map(
      (w) =>
        `<tr><td>${escapeHtml(w.lessonTitle)}</td><td>${escapeHtml(w.prompt)}</td><td>${escapeHtml(w.answer)}</td></tr>`
    )
    .join("");
  return `
    <table class="wrong-table">
      <caption style="text-align:left; font-size:13px; font-weight:bold; margin-bottom:6px;">${escapeHtml(title)}</caption>
      <thead><tr><th>课文 Lesson</th><th>题目 Prompt</th><th>正确答案 Answer</th></tr></thead>
      <tbody>${body}</tbody>
    </table>
  `;
}

// Aggregates everything the student did today -- across every Practice
// session (full question/answer detail, same rendering as a single session's
// export) plus every Tingxie word/sentence self-graded "wrong" today (prompt
// + correct answer only, not a full transcript -- see state/todaySummary.ts)
// -- into one print/Save-as-PDF page. hist is passed in (not read internally)
// so this stays consistent with whatever the caller (Home.tsx) already has
// loaded, same pattern as ProgressSummary/RecentAchievements used to use.
export function exportTodaySummaryToPdf(hist: HistoryEntry[]): void {
  const { practiceSessions, tingxieWrong, storiesRead } = getTodaySummary();
  const today = getTodayStats(hist);
  const tingxieDone = isTingxieMissionComplete();
  // Just the lesson numbers, deduped + sorted -- not a full transcript, per
  // the "just indicate lesson number" scope of this summary line.
  const storyLessonIds = [...new Set(storiesRead.map((s) => s.lessonId))].sort((a, b) => a - b);

  const sessionsHtml = practiceSessions
    .map((s, i) => {
      const time = new Date(s.date).toLocaleTimeString("zh-CN", { hour: "2-digit", minute: "2-digit" });
      return `<div class="session-label">练习 ${i + 1} Session ${i + 1} · ${escapeHtml(s.modeLabel)} · ${time}</div>${renderGroupsHtml(s.groups, s.results)}`;
    })
    .join("");

  const wrongHtml = wrongTableHtml("听写练习 - 需要加强 Tingxie - Needs Improvement", tingxieWrong);

  const html = `<!doctype html>
<html lang="zh">
<head>
<meta charset="utf-8" />
<title>今日学习总结 Today's Session Summary</title>
<style>${PRINT_STYLES}</style>
</head>
<body>
  <h1>今日学习总结 Today's Session Summary</h1>
  <div class="meta">${escapeHtml(new Date().toLocaleDateString("zh-CN"))}</div>
  <div class="summary">
    <div class="summary-line">📘 练习 Practice: ${today.questions} 题，正确率 ${today.accuracy}%（共 ${practiceSessions.length} 次 sessions）</div>
    <div class="summary-line">🔊 听写练习 Dictation Practice: ${tingxieDone ? "已完成 Completed" : "未完成 Not done today"}</div>
    <div class="summary-line">📖 读故事 Read a Story: ${storyLessonIds.length > 0 ? `第 ${storyLessonIds.join("、")} 课 Lesson${storyLessonIds.length > 1 ? "s" : ""} ${storyLessonIds.join(", ")}` : "今天还没有阅读 Not read today"}</div>
  </div>
  ${sessionsHtml || `<p>今天还没有练习记录。No practice sessions yet today.</p>`}
  ${wrongHtml}
</body>
</html>`;

  openPrintWindow(html);
}
