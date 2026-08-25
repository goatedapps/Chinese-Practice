function makeUtterance(text: string): SpeechSynthesisUtterance {
  const utter = new SpeechSynthesisUtterance(text.replace(/__(.+?)__/g, "$1"));
  utter.lang = "zh-CN";
  utter.rate = 0.82;
  return utter;
}

// Tracks a pending chained read (see speakWordThenSentence) so stopSpeaking()
// can cancel the gap between the two utterances, not just an utterance
// that's already playing.
let pendingChainTimeout: ReturnType<typeof setTimeout> | null = null;

// Chrome has a long-standing bug where a SpeechSynthesisUtterance with no
// surviving JS reference can be garbage-collected mid-read -- the engine
// then either drops it silently or (what a user actually hit once on a long
// passage read) keeps talking but starts reading unrelated garbage from
// elsewhere in memory. Keeping a strong reference for as long as the browser
// might still be reading it prevents that GC.
let activeUtterances: SpeechSynthesisUtterance[] = [];

// Reads question text aloud via the browser's SpeechSynthesis API so
// students can practise 听写 (writing what they hear) without any audio
// assets. `onDone`, if given, fires exactly once when the reading finishes
// on its own OR is interrupted (stopSpeaking(), a new speakText() call, the
// page navigating away) -- callers that show a "stop reading" toggle (e.g.
// the passage dictation button) use it to reset their own "is speaking"
// state without needing to poll speechSynthesis themselves.
export function speakText(text: string, onDone?: () => void): void {
  if (!window.speechSynthesis) {
    alert("此设备不支持朗读功能。This device doesn't support read-aloud.");
    onDone?.();
    return;
  }
  stopSpeaking();
  const utter = makeUtterance(text);
  activeUtterances.push(utter);
  const release = () => {
    activeUtterances = activeUtterances.filter((u) => u !== utter);
  };
  utter.onend = () => {
    release();
    onDone?.();
  };
  utter.onerror = () => {
    release();
    onDone?.();
  };
  window.speechSynthesis.speak(utter);
}

// Reads a vocab word, pauses briefly, then reads its example sentence --
// used by Tingxie's Learn/Vocab dictation button so the student hears the
// word in isolation before hearing it in context.
export function speakWordThenSentence(word: string, sentence: string): void {
  if (!window.speechSynthesis) {
    alert("此设备不支持朗读功能。This device doesn't support read-aloud.");
    return;
  }
  stopSpeaking();
  const wordUtter = makeUtterance(word);
  activeUtterances.push(wordUtter);
  wordUtter.onend = () => {
    activeUtterances = activeUtterances.filter((u) => u !== wordUtter);
    pendingChainTimeout = setTimeout(() => {
      pendingChainTimeout = null;
      const sentenceUtter = makeUtterance(sentence);
      activeUtterances.push(sentenceUtter);
      sentenceUtter.onend = () => {
        activeUtterances = activeUtterances.filter((u) => u !== sentenceUtter);
      };
      window.speechSynthesis.speak(sentenceUtter);
    }, 500);
  };
  window.speechSynthesis.speak(wordUtter);
}

// Stops any in-progress/queued read-aloud immediately -- called whenever the
// student moves on (submitting, advancing to the next question/group,
// leaving the screen) so a reading started via the 🔊 button doesn't keep
// playing over a question the student has already left.
export function stopSpeaking(): void {
  if (pendingChainTimeout !== null) {
    clearTimeout(pendingChainTimeout);
    pendingChainTimeout = null;
  }
  activeUtterances = [];
  window.speechSynthesis?.cancel();
}
