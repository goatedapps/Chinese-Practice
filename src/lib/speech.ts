// Reads question text aloud via the browser's SpeechSynthesis API so
// students can practise 听写 (writing what they hear) without any audio
// assets.
export function speakText(text: string): void {
  if (!window.speechSynthesis) {
    alert("此设备不支持朗读功能。This device doesn't support read-aloud.");
    return;
  }
  window.speechSynthesis.cancel();
  const utter = new SpeechSynthesisUtterance(text.replace(/__(.+?)__/g, "$1"));
  utter.lang = "zh-CN";
  utter.rate = 0.82;
  window.speechSynthesis.speak(utter);
}

// Stops any in-progress/queued read-aloud immediately -- called whenever the
// student moves on (submitting, advancing to the next question/group,
// leaving the screen) so a reading started via the 🔊 button doesn't keep
// playing over a question the student has already left.
export function stopSpeaking(): void {
  window.speechSynthesis?.cancel();
}
