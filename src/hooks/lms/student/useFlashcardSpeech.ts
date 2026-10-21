"use client";
import { useCallback, useEffect, useRef, useState } from "react";
import { speechService } from "@/services/ai/speechService";
export function useFlashcardSpeech(courseId: number) {
  const [mode, setMode] = useState<"neural" | "browser">("neural");
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const objectUrl = useRef<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceURI, setVoiceURI] = useState("");
  const [rate, setRate] = useState(0.97);
  const [speaking, setSpeaking] = useState(false);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!("speechSynthesis" in window)) return;
    const synth = window.speechSynthesis;
    const load = () => setVoices(synth.getVoices());
    load(); synth.addEventListener("voiceschanged", load);
    return () => { synth.cancel(); synth.removeEventListener("voiceschanged", load); };
  }, []);
  const stop = useCallback(() => {
    controllerRef.current?.abort(); controllerRef.current = null;
    if (audioRef.current) { audioRef.current.pause(); audioRef.current.src = ""; audioRef.current = null; }
    if (objectUrl.current) { URL.revokeObjectURL(objectUrl.current); objectUrl.current = null; }
    window.speechSynthesis?.cancel(); setSpeaking(false); setLoading(false);
  }, []);
  useEffect(() => () => stop(), [stop]);
  const speak = async (text: string, language: string, cardId: number, side: "front" | "back") => {
    stop(); setError("");
    if (mode === "neural") {
      const controller = new AbortController(); controllerRef.current = controller; setLoading(true);
      try {
        const blob = await speechService.flashcard(courseId, cardId, side, rate, controller.signal);
        controller.signal.throwIfAborted();
        const url = URL.createObjectURL(blob); objectUrl.current = url;
        const audio = new Audio(url); audioRef.current = audio;
        audio.onended = stop;
        audio.onerror = () => { stop(); setError("Không phát được audio. Hãy thử lại."); };
        await audio.play(); setSpeaking(true);
      } catch (err) {
        if (!controller.signal.aborted) setError(err instanceof Error ? err.message : "Giọng neural chưa sẵn sàng.");
      } finally { if (!controller.signal.aborted) setLoading(false); }
      return;
    }
    const voice = voices.find(v => v.voiceURI === voiceURI) ?? voices.find(v => v.lang.toLowerCase() === language.toLowerCase()) ?? voices.find(v => v.lang.split("-")[0] === language.split("-")[0]);
    if (!voice) { setError("Thiết bị chưa có giọng đọc cho ngôn ngữ này."); return; }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.voice = voice; utterance.lang = voice.lang; utterance.rate = rate;
    utterance.onstart = () => setSpeaking(true);
    utterance.onend = () => setSpeaking(false);
    utterance.onerror = event => { setSpeaking(false); if (event.error !== "interrupted" && event.error !== "canceled") setError("Chưa đọc được thẻ. Hãy chọn giọng khác."); };
    window.speechSynthesis.speak(utterance);
  };
  return { mode, setMode, loading, voices, voiceURI, setVoiceURI, rate, setRate, speaking, speak, stop, error };
}
