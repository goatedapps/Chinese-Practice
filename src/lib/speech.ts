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
  if (onDone) {
    utter.onend = onDone;
    utter.onerror = onDone;
  }
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
  wordUtter.onend = () => {
    pendingChainTimeout = setTimeout(() => {
      pendingChainTimeout = null;
      window.speechSynthesis.speak(makeUtterance(sentence));
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
  window.speechSynthesis?.cancel();
}
