"use client";
import { useEffect, useState } from "react";
export function useFlashcardSpeech() {
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceURI, setVoiceURI] = useState("");
  const [rate, setRate] = useState(1);
  const [speaking, setSpeaking] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    const synth = window.speechSynthesis;
    const load = () => setVoices(synth.getVoices());
    load(); synth.addEventListener("voiceschanged", load);
    return () => { synth.cancel(); synth.removeEventListener("voiceschanged", load); };
  }, []);
  const stop = () => { window.speechSynthesis?.cancel(); setSpeaking(false); };
  const speak = (text: string, language: string) => {
    stop(); setError("");
    const voice = voices.find(v => v.voiceURI === voiceURI) ?? voices.find(v => v.lang.toLowerCase() === language.toLowerCase()) ?? voices.find(v => v.lang.split("-")[0] === language.split("-")[0]);
    if (!voice) { setError("Thiết bị chưa có giọng đọc cho ngôn ngữ này."); return; }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voice; utterance.lang = voice.lang; utterance.rate = rate;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = event => { setSpeaking(false); if (event.error !== "interrupted" && event.error !== "canceled") setError("Chưa đọc được thẻ. Hãy chọn giọng khác."); };
    window.speechSynthesis.speak(utterance);
  };
  return { voices, voiceURI, setVoiceURI, rate, setRate, speaking, speak, stop, error };
}
