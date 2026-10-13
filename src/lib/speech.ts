/** Speak Mandarin text with the browser's built-in voice, if one is available. */
export function speak(text: string) {
  if (typeof window === "undefined" || !("speechSynthesis" in window)) return;
  const synth = window.speechSynthesis;
  synth.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "zh-CN";
  utterance.rate = 0.8;
  const voice = synth.getVoices().find((v) => v.lang.replace("_", "-").startsWith("zh-CN"));
  if (voice) utterance.voice = voice;
  synth.speak(utterance);
}
