import type { QuestionGroup, GroupResult, Question, GroupResultItem } from "../data/types";
import { correctOptionFor } from "./grading";

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

export interface ExportSummary {
  modeLabel: string;
  pct: number;
  correctItems: number;
  totalItems: number;
  skippedItems: number;
}

// Renders the session as a formatted HTML page in a hidden iframe and opens
// the browser's print dialog on it -- lets the student "Save as PDF" from
// there. Chosen over a PDF-generation library (e.g. jsPDF) specifically to
// avoid embedding a CJK font just for Chinese-text rendering; see CLAUDE.md's
// dependency-light, offline-first stance.
export function exportSessionToPdf(groups: QuestionGroup[], results: GroupResult[], summary: ExportSummary): void {
  let priorQuestionCount = 0;
  const groupsHtml = groups
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

  const html = `<!doctype html>
<html lang="zh">
<head>
<meta charset="utf-8" />
<title>练习结果 Practice Results</title>
<style>
  * { box-sizing: border-box; }
  body { font-family: "Microsoft YaHei", "PingFang SC", "Segoe UI", sans-serif; color: #222; margin: 24px; line-height: 1.5; }
  h1 { font-size: 20px; margin: 0 0 4px; }
  .meta { color: #555; font-size: 13px; margin-bottom: 16px; }
  .summary { border: 1px solid #ccc; border-radius: 8px; padding: 12px 16px; margin-bottom: 20px; font-size: 14px; }
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
  u { text-decoration: underline; }
  @media print {
    .group { page-break-inside: avoid; }
  }
</style>
</head>
<body>
  <h1>练习结果 Practice Results</h1>
  <div class="meta">${escapeHtml(summary.modeLabel)} · ${escapeHtml(new Date().toLocaleString("zh-CN"))}</div>
  <div class="summary">
    得分 Score: <strong>${summary.pct}%</strong>
    答对 Correct: ${summary.correctItems} / ${summary.totalItems}
    ${summary.skippedItems ? `　未作答/未自评 Skipped: ${summary.skippedItems}` : ""}
  </div>
  ${groupsHtml}
</body>
</html>`;

  const iframe = document.createElement("iframe");
  iframe.style.position = "fixed";
  iframe.style.right = "0";
  iframe.style.bottom = "0";
  iframe.style.width = "0";
  iframe.style.height = "0";
  iframe.style.border = "0";
  document.body.appendChild(iframe);

  const doc = iframe.contentWindow?.document;
  if (!doc) {
    document.body.removeChild(iframe);
    return;
  }
  doc.open();
  doc.write(html);
  doc.close();

  iframe.onload = () => {
    const win = iframe.contentWindow;
    if (!win) return;
    win.focus();
    const cleanup = () => {
      if (iframe.parentNode) document.body.removeChild(iframe);
    };
    // Removes the iframe once the print dialog closes; falls back to a
    // longer timeout in case a browser doesn't fire afterprint on an iframe.
    win.addEventListener("afterprint", cleanup);
    win.print();
    setTimeout(cleanup, 60000);
  };
}
