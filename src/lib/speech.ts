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
