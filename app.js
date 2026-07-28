/* =========================================================
   Chinese Practice App — logic layer.
   Reads only from the globals defined in data/questions.js
   (LESSON_COUNT, CATEGORIES, SUBJECTS, QUESTION_GROUPS).
   ========================================================= */

const HISTORY_KEY = "hanyuPracticeHistory_v2";

const state = {
  screen: "home",       // home | lessonPicker | typePicker | quiz | result
  mode: null,            // "lesson" | "type"
  groups: [],            // selected groups for this session (in play order)
  groupIndex: 0,
  results: [],           // per group: { groupId, items: [{qNo, marks, correct, skipped}] }
  submitted: false,       // has the current group been submitted/graded?
  selectedLesson: null,
  selectedSubject: "All",
  selectedCategories: new Set()
};

const root = document.getElementById("app");

/* ---------------------------------------------------------
   Sound effects — synthesized with the Web Audio API so the
   app needs no external sound files (keeps it a pure static
   folder that works when opened directly, offline).
   --------------------------------------------------------- */
const Sound = (() => {
  let ctx = null;
  function ensureCtx() {
    if (!ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      ctx = new AC();
    }
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }
  function tone(freq, startTime, duration, type, peakGain) {
    const c = ensureCtx();
    if (!c) return;
    const osc = c.createOscillator();
    const gain = c.createGain();
    osc.type = type || "sine";
    osc.frequency.setValueAtTime(freq, c.currentTime + startTime);
    gain.gain.setValueAtTime(0, c.currentTime + startTime);
    gain.gain.linearRampToValueAtTime(peakGain || 0.15, c.currentTime + startTime + 0.008);
    gain.gain.exponentialRampToValueAtTime(0.0001, c.currentTime + startTime + duration);
    osc.connect(gain);
    gain.connect(c.destination);
    osc.start(c.currentTime + startTime);
    osc.stop(c.currentTime + startTime + duration + 0.03);
  }
  return {
    click() { try { tone(700, 0, 0.05, "square", 0.06); } catch (e) { /* ignore */ } },
    ding(delay) {
      try {
        const d = delay || 0;
        tone(880, d, 0.12, "sine", 0.16);
        tone(1318.51, d + 0.09, 0.16, "sine", 0.14);
      } catch (e) { /* ignore */ }
    }
  };
})();

// Play a click sound for any button-like element pressed anywhere in the app.
document.addEventListener("click", (e) => {
  if (e.target.closest("button, .option-label")) Sound.click();
}, true);

/* ---------------------------------------------------------
   Helpers
   --------------------------------------------------------- */
function shuffle(arr) {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

function normalize(s) {
  return (s || "").toString().trim().replace(/\s+/g, "");
}

function el(tag, attrs, children) {
  const node = document.createElement(tag);
  if (attrs) {
    for (const [k, v] of Object.entries(attrs)) {
      if (k === "class") node.className = v;
      else if (k === "html") node.innerHTML = v;
      else if (k.startsWith("on") && typeof v === "function") node.addEventListener(k.slice(2), v);
      else node.setAttribute(k, v);
    }
  }
  (children || []).forEach(c => {
    if (c == null) return;
    node.appendChild(typeof c === "string" ? document.createTextNode(c) : c);
  });
  return node;
}

// Renders plain text but turns __word__ markers into an underlined span —
// used for "画线词语 / underlined word" style questions (hanyu pinyin,
// phrase-meaning, etc.) where the source paper underlined a target word.
function richText(str) {
  const frag = document.createDocumentFragment();
  const re = /__(.+?)__/g;
  let lastIndex = 0, m;
  while ((m = re.exec(str)) !== null) {
    if (m.index > lastIndex) frag.appendChild(document.createTextNode(str.slice(lastIndex, m.index)));
    frag.appendChild(el("u", { class: "underline-word" }, [m[1]]));
    lastIndex = re.lastIndex;
  }
  if (lastIndex < str.length) frag.appendChild(document.createTextNode(str.slice(lastIndex)));
  return frag;
}

function saveHistory(entry) {
  let hist = [];
  try { hist = JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; } catch (e) { hist = []; }
  hist.unshift(entry);
  hist = hist.slice(0, 50);
  localStorage.setItem(HISTORY_KEY, JSON.stringify(hist));
}

function loadHistory() {
  try { return JSON.parse(localStorage.getItem(HISTORY_KEY)) || []; } catch (e) { return []; }
}

// Lightweight in-page confirm dialog (native confirm() is avoided so the
// app's own styling/testing stays consistent).
function showConfirmModal(messageLines, onConfirm) {
  const overlay = el("div", { class: "modal-overlay" });
  const modal = el("div", { class: "modal-box" }, [
    el("div", { class: "modal-message" }, messageLines.map(line => el("p", {}, [line]))),
    el("div", { class: "modal-actions" }, [
      el("button", { class: "secondary-btn", onclick: () => overlay.remove() }, ["取消 Cancel"]),
      el("button", { class: "primary-btn danger-btn", onclick: () => { overlay.remove(); onConfirm(); } }, ["确定返回 Confirm"])
    ])
  ]);
  overlay.addEventListener("click", (e) => { if (e.target === overlay) overlay.remove(); });
  overlay.appendChild(modal);
  document.body.appendChild(overlay);
}

// Has the student made any progress in the current quiz session that a
// "return home" click would throw away?
function hasQuizProgress() {
  if (state.results.length > 0) return true;
  if (document.querySelector('#app input[type="radio"]:checked')) return true;
  const filled = Array.from(document.querySelectorAll("#app .fillin-input, #app .longanswer-input"))
    .some(i => i.value.trim().length > 0);
  return filled;
}

function goHomeWithConfirm() {
  if (hasQuizProgress()) {
    showConfirmModal(
      ["确定要返回主页吗？本次练习尚未完成，本组进度将不会被保存。",
       "Are you sure you want to return home? This session isn't finished — progress won't be saved."],
      () => resetToHome()
    );
  } else {
    resetToHome();
  }
}

/* ---------------------------------------------------------
   Render dispatcher
   --------------------------------------------------------- */
function render() {
  root.innerHTML = "";
  if (state.screen === "home") root.appendChild(renderHome());
  else if (state.screen === "lessonPicker") root.appendChild(renderLessonPicker());
  else if (state.screen === "typePicker") root.appendChild(renderTypePicker());
  else if (state.screen === "quiz") root.appendChild(renderQuiz());
  else if (state.screen === "result") root.appendChild(renderResult());
  window.scrollTo(0, 0);
}

/* ---------------------------------------------------------
   Home
   --------------------------------------------------------- */
function renderHome() {
  const hist = loadHistory();
  const wrap = el("div", { class: "screen home" }, [
    el("h1", {}, ["华文练习 Chinese Practice"]),
    el("p", { class: "subtitle" }, ["选择一种练习方式 Choose how you'd like to practice"]),
    el("div", { class: "mode-cards" }, [
      el("button", { class: "mode-card", onclick: () => { state.screen = "lessonPicker"; render(); } }, [
        el("div", { class: "mode-card-title" }, ["📘 按课文练习"]),
        el("div", { class: "mode-card-sub" }, ["Practice by Lesson"]),
        el("div", { class: "mode-card-desc" }, ["选择正在学习的课，练习该课的语文应用题目。"])
      ]),
      el("button", { class: "mode-card", onclick: () => { state.screen = "typePicker"; render(); } }, [
        el("div", { class: "mode-card-title" }, ["🧩 按题型练习"]),
        el("div", { class: "mode-card-sub" }, ["Practice by Question Type"]),
        el("div", { class: "mode-card-desc" }, ["选择题型，如完形填空、阅读理解、汉语拼音等，不分课别。"])
      ])
    ]),
    hist.length ? el("div", { class: "history" }, [
      el("h2", {}, ["最近记录 Recent Sessions"]),
      el("table", { class: "history-table" }, [
        el("thead", {}, [el("tr", {}, [
          el("th", {}, ["日期 Date"]), el("th", {}, ["模式 Mode"]),
          el("th", {}, ["得分 Score"])
        ])]),
        el("tbody", {}, hist.slice(0, 8).map(h => el("tr", {}, [
          el("td", {}, [new Date(h.date).toLocaleString()]),
          el("td", {}, [h.modeLabel]),
          el("td", {}, [`${h.correctItems}/${h.totalItems}`])
        ])))
      ])
    ]) : null
  ]);
  return wrap;
}

/* ---------------------------------------------------------
   Lesson picker
   --------------------------------------------------------- */
function renderLessonPicker() {
  const wrap = el("div", { class: "screen picker" }, [
    backButton(),
    el("h1", {}, ["按课文练习 Practice by Lesson"]),
    el("p", { class: "subtitle" }, ["选择一课 Choose a lesson"]),
    el("div", { class: "lesson-grid" },
      Array.from({ length: LESSON_COUNT }, (_, i) => i + 1).map(n => {
        const count = QUESTION_GROUPS.filter(g => g.lessonEligible && g.lessonIds.includes(n))
          .reduce((sum, g) => sum + g.questions.length, 0);
        return el("button", {
          class: "lesson-btn" + (count === 0 ? " disabled" : ""),
          onclick: () => {
            if (count === 0) return;
            startLessonQuiz(n);
          }
        }, [
          el("div", { class: "lesson-btn-num" }, [`第 ${n} 课`]),
          el("div", { class: "lesson-btn-count" }, [count > 0 ? `${count} 题` : "暂无题目"])
        ]);
      })
    )
  ]);
  return wrap;
}

function startLessonQuiz(lessonNum) {
  const groups = QUESTION_GROUPS.filter(g => g.lessonEligible && g.lessonIds.includes(lessonNum));
  state.mode = "lesson";
  state.modeLabel = `第 ${lessonNum} 课 Lesson ${lessonNum}`;
  state.groups = shuffle(groups);
  state.groupIndex = 0;
  state.results = [];
  state.submitted = false;
  state.screen = "quiz";
  render();
}

/* ---------------------------------------------------------
   Type picker
   --------------------------------------------------------- */
function renderTypePicker() {
  const catEntries = Object.entries(CATEGORIES);
  const wrap = el("div", { class: "screen picker" }, [
    backButton(),
    el("h1", {}, ["按题型练习 Practice by Question Type"]),
    el("p", { class: "subtitle" }, ["选择科目和题型 Choose subject and question type(s)"]),
    el("div", { class: "subject-row" }, [
      el("span", { class: "field-label" }, ["科目 Subject:"]),
      ...["All", ...SUBJECTS].map(s => el("button", {
        class: "chip" + (state.selectedSubject === s ? " chip-active" : ""),
        onclick: () => { state.selectedSubject = s; render(); }
      }, [s === "All" ? "全部 All" : s]))
    ]),
    el("div", { class: "category-grid" }, catEntries.map(([key, cat]) => {
      const active = state.selectedCategories.has(key);
      return el("button", {
        class: "category-btn" + (active ? " category-active" : ""),
        onclick: () => {
          if (active) state.selectedCategories.delete(key);
          else state.selectedCategories.add(key);
          render();
        }
      }, [cat.label]);
    })),
    el("div", { class: "action-row" }, [
      el("button", {
        class: "primary-btn",
        onclick: () => startTypeQuiz()
      }, ["开始练习 Start Practice"])
    ])
  ]);
  return wrap;
}

function startTypeQuiz() {
  if (state.selectedCategories.size === 0) {
    alert("请至少选择一种题型 Please choose at least one question type.");
    return;
  }
  const groups = QUESTION_GROUPS.filter(g => {
    if (!state.selectedCategories.has(g.category)) return false;
    if (state.selectedSubject !== "All" && g.subject !== state.selectedSubject) return false;
    return true;
  });
  if (groups.length === 0) {
    alert("没有符合条件的题目，请调整选择。 No matching questions, please adjust your selection.");
    return;
  }
  state.mode = "type";
  state.modeLabel = "按题型 " + Array.from(state.selectedCategories).map(k => CATEGORIES[k].label).join("、");
  state.groups = shuffle(groups);
  state.groupIndex = 0;
  state.results = [];
  state.submitted = false;
  state.screen = "quiz";
  render();
}

/* ---------------------------------------------------------
   Quiz screen — renders one whole group (passage + all its
   questions) at a time, grouped as required.
   --------------------------------------------------------- */
function renderQuiz() {
  const group = state.groups[state.groupIndex];
  if (!group) return renderResult();

  const wrap = el("div", { class: "screen quiz" });

  wrap.appendChild(el("div", { class: "quiz-topbar" }, [
    el("div", { class: "quiz-progress" }, [
      `第 ${state.groupIndex + 1} / ${state.groups.length} 组`,
      el("span", { class: "quiz-mode-label" }, [state.modeLabel || ""])
    ]),
    el("button", { class: "home-btn", onclick: () => goHomeWithConfirm() }, ["🏠 返回主页 Home"])
  ]));

  if (group.passage) {
    wrap.appendChild(el("div", { class: "passage-box" }, [
      el("div", { class: "passage-title" }, [group.passage.title]),
      group.passage.source ? el("div", { class: "passage-source" }, [group.passage.source]) : null,
      el("div", { class: "passage-text" }, [group.passage.text])
    ]));
  }

  // Shared option bank (e.g. dialogue-completion): shown once, questions
  // below just reference the option numbers instead of repeating them.
  if (group.optionBank) {
    wrap.appendChild(el("div", { class: "option-bank-box" }, [
      el("div", { class: "option-bank-title" }, ["词语库 Word Bank"]),
      el("div", { class: "option-bank-list" },
        group.optionBank.map(opt => el("div", { class: "option-bank-item" }, [`${opt.key}. ${opt.text}`])))
    ]));
  }

  const itemRefs = [];
  group.questions.forEach((q, idx) => {
    const itemBox = el("div", { class: "question-box", id: `q-${idx}` });
    itemBox.appendChild(el("div", { class: "question-head" }, [`${q.qNo}`, el("span", { class: "marks-badge" }, [`${q.marks} 分`])]));
    const qTextDiv = el("div", { class: "question-text" });
    qTextDiv.appendChild(richText(q.text));
    itemBox.appendChild(qTextDiv);
    if (q.context) itemBox.appendChild(el("div", { class: "question-context" }, [q.context]));

    let inputEl = null;
    if (q.format === "MCQ") {
      const bank = group.optionBank || q.options;
      const compact = !!group.optionBank;
      const optWrap = el("div", { class: "options" + (compact ? " options-compact" : "") });
      bank.forEach(opt => {
        const inputId = `opt-${idx}-${opt.key}`;
        const label = el("label", { class: "option-label" + (compact ? " option-compact" : ""), for: inputId }, [
          el("input", { type: "radio", name: `radio-${idx}`, id: inputId, value: opt.key }),
          el("span", { class: "option-text" }, [compact ? opt.key : `${opt.key}. ${opt.text}`])
        ]);
        optWrap.appendChild(label);
      });
      itemBox.appendChild(optWrap);
      inputEl = optWrap;
    } else if (q.format === "Fill-in") {
      const input = el("input", { type: "text", class: "fillin-input", placeholder: "输入答案 Type your answer" });
      itemBox.appendChild(input);
      inputEl = input;
    } else {
      const textarea = el("textarea", { class: "longanswer-input", rows: "3", placeholder: "写下你的答案（自我批改）Write your answer (self-checked)" });
      itemBox.appendChild(textarea);
      inputEl = textarea;
    }

    const feedback = el("div", { class: "feedback" });
    itemBox.appendChild(feedback);
    wrap.appendChild(itemBox);
    itemRefs.push({ q, box: itemBox, input: inputEl, feedback, idx });
  });

  const submitRow = el("div", { class: "action-row" });
  const submitBtn = el("button", { class: "primary-btn" }, ["提交本组 Submit This Set"]);
  const nextBtn = el("button", { class: "secondary-btn hidden" },
    [state.groupIndex + 1 < state.groups.length ? "下一组 Next Set" : "查看结果 See Results"]);

  submitBtn.addEventListener("click", () => {
    if (state.submitted) return;
    gradeGroup(group, itemRefs);
    state.submitted = true;
    submitBtn.classList.add("hidden");
    nextBtn.classList.remove("hidden");
  });

  nextBtn.addEventListener("click", () => {
    state.groupIndex += 1;
    state.submitted = false;
    if (state.groupIndex >= state.groups.length) state.screen = "result";
    render();
  });

  submitRow.appendChild(submitBtn);
  submitRow.appendChild(nextBtn);
  wrap.appendChild(submitRow);

  return wrap;
}

function gradeGroup(group, itemRefs) {
  const record = { groupId: group.groupId, items: [] };
  let dingCount = 0;

  itemRefs.forEach(({ q, box, input, feedback, idx }) => {
    if (q.format === "MCQ") {
      const bank = group.optionBank || q.options;
      const checked = box.querySelector(`input[name="radio-${idx}"]:checked`);
      const chosen = checked ? checked.value : null;
      const correct = chosen === q.correctKey;
      const correctOpt = bank.find(o => o.key === q.correctKey);
      feedback.classList.add(correct ? "correct" : (chosen ? "incorrect" : "skipped"));
      feedback.textContent = chosen
        ? (correct ? "✓ 正确 Correct" : `✗ 正确答案 Correct answer: ${correctOpt.key}. ${correctOpt.text}`)
        : `未作答。正确答案 Not answered. Correct answer: ${correctOpt.key}. ${correctOpt.text}`;
      if (correct) Sound.ding(dingCount++ * 0.14);
      record.items.push({ qNo: q.qNo, marks: q.marks, correct, skipped: !chosen });
    } else if (q.format === "Fill-in") {
      const val = normalize(input.value);
      const correct = q.accepted.some(a => normalize(a) === val);
      feedback.classList.add(correct ? "correct" : (val ? "incorrect" : "skipped"));
      feedback.textContent = val
        ? (correct ? "✓ 正确 Correct" : `✗ 参考答案 Suggested answer: ${q.displayAnswer}`)
        : `未作答。参考答案 Not answered. Suggested answer: ${q.displayAnswer}`;
      if (correct) Sound.ding(dingCount++ * 0.14);
      record.items.push({ qNo: q.qNo, marks: q.marks, correct, skipped: !val });
    } else {
      // Long-Answer / Writing-Constrained -> self-check
      feedback.classList.add("self-check");
      const answerBlock = el("div", { class: "model-answer" }, [
        el("div", { class: "model-answer-label" }, ["参考答案 Model Answer:"]),
        el("div", { class: "model-answer-text" }, [q.displayAnswer])
      ]);
      const btnRow = el("div", { class: "self-check-row" });
      const rightBtn = el("button", { class: "self-btn self-right" }, ["✓ 我答对了 Got it right"]);
      const wrongBtn = el("button", { class: "self-btn self-wrong" }, ["✗ 还需加强 Need more practice"]);
      const rec = { qNo: q.qNo, marks: q.marks, correct: null, skipped: true };
      record.items.push(rec);
      rightBtn.addEventListener("click", () => {
        rec.correct = true; rec.skipped = false;
        rightBtn.classList.add("self-chosen");
        wrongBtn.classList.remove("self-chosen");
        Sound.ding(0);
      });
      wrongBtn.addEventListener("click", () => {
        rec.correct = false; rec.skipped = false;
        wrongBtn.classList.add("self-chosen");
        rightBtn.classList.remove("self-chosen");
      });
      btnRow.appendChild(rightBtn);
      btnRow.appendChild(wrongBtn);
      feedback.appendChild(answerBlock);
      feedback.appendChild(btnRow);
    }
  });

  state.results.push(record);
}

/* ---------------------------------------------------------
   Result screen
   --------------------------------------------------------- */
function renderResult() {
  let totalItems = 0, correctItems = 0, skippedItems = 0;
  state.results.forEach(r => r.items.forEach(it => {
    totalItems += 1;
    if (it.correct === true) correctItems += 1;
    if (it.skipped) skippedItems += 1;
  }));

  saveHistory({
    date: Date.now(),
    modeLabel: state.modeLabel || "",
    totalItems, correctItems, skippedItems
  });

  const pct = totalItems ? Math.round((correctItems / totalItems) * 100) : 0;

  const wrap = el("div", { class: "screen result" }, [
    el("h1", {}, ["练习结果 Practice Results"]),
    el("div", { class: "score-circle" }, [`${pct}%`]),
    el("p", { class: "score-detail" }, [`答对 ${correctItems} / ${totalItems} 题${skippedItems ? `（${skippedItems} 题未作答或未自评）` : ""}`]),
    el("div", { class: "action-row" }, [
      el("button", { class: "primary-btn", onclick: () => { resetToHome(); } }, ["返回主页 Back to Home"])
    ])
  ]);
  return wrap;
}

function resetToHome() {
  state.screen = "home";
  state.mode = null;
  state.groups = [];
  state.groupIndex = 0;
  state.results = [];
  state.submitted = false;
  render();
}

function backButton() {
  return el("button", { class: "back-btn", onclick: () => { resetToHome(); } }, ["← 返回 Back"]);
}

/* ---------------------------------------------------------
   Init
   --------------------------------------------------------- */
render();
