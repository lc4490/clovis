"use client";

import { useState, useEffect, useRef } from "react";

type VoiceState = "listening" | "thinking" | "speaking";

interface VoiceModeProps {
  onClose: () => void;
  onSend: (text: string) => Promise<string | null>;
  language: string;
}

const LANG_MAP: Record<string, string> = {
  en: "en-US",
  es: "es-ES",
  zh: "zh-CN",
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyRec = any;

export function VoiceMode({ onClose, onSend, language }: VoiceModeProps) {
  const [voiceState, setVoiceState] = useState<VoiceState>("listening");
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState("");
  const [botText, setBotText] = useState("");

  const onSendRef = useRef(onSend);
  const languageRef = useRef(language);
  useEffect(() => { onSendRef.current = onSend; }, [onSend]);
  useEffect(() => { languageRef.current = language; }, [language]);

  const interruptRef = useRef<() => void>(() => {});

  useEffect(() => {
    let destroyed = false;
    let activeRecognition: AnyRec = null;
    let activeSource: AudioBufferSourceNode | null = null;

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
    const audioCtx: AudioContext = new AudioCtx();
    audioCtx.resume().catch(() => {});

    async function playTts(text: string): Promise<void> {
      if (audioCtx.state === "suspended") {
        await audioCtx.resume().catch(() => {});
      }
      try {
        const res = await fetch("/api/tts", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ text }),
        });
        if (!res.ok) throw new Error("TTS unavailable");
        const arrayBuffer = await res.arrayBuffer();
        return new Promise((resolve) => {
          audioCtx.decodeAudioData(
            arrayBuffer,
            (audioBuffer) => {
              const source = audioCtx.createBufferSource();
              source.buffer = audioBuffer;
              source.connect(audioCtx.destination);
              activeSource = source;
              source.onended = () => { activeSource = null; resolve(); };
              source.start(0);
            },
            () => resolve(),
          );
        });
      } catch {
        return new Promise((resolve) => {
          if (!window.speechSynthesis) return resolve();
          window.speechSynthesis.cancel();
          const utt = new SpeechSynthesisUtterance(text);
          utt.lang = LANG_MAP[languageRef.current] ?? "en-US";
          utt.rate = 1.0;
          utt.onend = () => resolve();
          utt.onerror = () => resolve();
          window.speechSynthesis.speak(utt);
        });
      }
    }

    function interrupt() {
      setIsRecording(false);
      if (activeSource) { try { activeSource.stop(); } catch { /* ignore */ } activeSource = null; }
      if (activeRecognition) { try { activeRecognition.stop(); } catch { /* ignore */ } activeRecognition = null; }
      window.speechSynthesis?.cancel();
      startListening();
    }

    interruptRef.current = interrupt;

    function startThinkingChime(): () => void {
      let stopped = false;
      // A major chord ascending — bright, punchy, enthusiastic
      const notes = [440, 554, 659, 880]; // A4, C#5, E5, A5

      async function loop() {
        while (!stopped) {
          for (const freq of notes) {
            if (stopped) break;
            try {
              const osc = audioCtx.createOscillator();
              const gain = audioCtx.createGain();
              osc.connect(gain);
              gain.connect(audioCtx.destination);
              osc.type = "triangle";
              osc.frequency.setValueAtTime(freq, audioCtx.currentTime);
              gain.gain.setValueAtTime(0, audioCtx.currentTime);
              gain.gain.linearRampToValueAtTime(0.35, audioCtx.currentTime + 0.02);
              gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.22);
              osc.start(audioCtx.currentTime);
              osc.stop(audioCtx.currentTime + 0.25);
            } catch { /* ignore if ctx closed */ }
            await new Promise<void>(r => setTimeout(r, 200));
          }
          if (!stopped) await new Promise<void>(r => setTimeout(r, 220));
        }
      }

      loop().catch(() => {});
      return () => { stopped = true; };
    }

    async function handleTranscript(text: string) {
      if (destroyed) return;
      setVoiceState("thinking");

      // Kick off API call immediately while TTS says "Gimme a second"
      const replyPromise = onSendRef.current(text);
      await playTts("Ooh, one sec!");

      if (destroyed) return;

      const stopChime = startThinkingChime();
      try {
        const reply = await replyPromise;
        if (destroyed) { stopChime(); return; }
        if (!reply) { stopChime(); startListening(); return; }
        setBotText(reply);
        setVoiceState("speaking");
        stopChime(); // stop right as bot audio begins
        await playTts(reply);
        if (!destroyed) startListening();
      } catch {
        stopChime();
        if (!destroyed) startListening();
      }
    }

    function startListening() {
      if (destroyed) return;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const w = window as any;
      const Ctor = w.SpeechRecognition || w.webkitSpeechRecognition;
      if (!Ctor) { setVoiceState("listening"); return; }

      setVoiceState("listening");
      setIsRecording(false);
      setTranscript("");
      setBotText("");

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const rec = new (Ctor as any)() as AnyRec;
      rec.lang = LANG_MAP[languageRef.current] ?? "en-US";
      rec.interimResults = true;
      rec.maxAlternatives = 1;
      rec.continuous = false;

      let finalText = "";

      rec.onstart = () => setIsRecording(true);

      rec.onresult = (e: AnyRec) => {
        let interim = "";
        for (let i = e.resultIndex; i < e.results.length; i++) {
          if (e.results[i].isFinal) finalText += e.results[i][0].transcript;
          else interim += e.results[i][0].transcript;
        }
        setTranscript(finalText + interim);
      };

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      rec.onerror = (e: any) => {
        if (destroyed) return;
        if (e.error === "no-speech" || e.error === "aborted") startListening();
      };

      rec.onend = () => {
        if (destroyed) return;
        setIsRecording(false);
        activeRecognition = null;
        if (finalText.trim()) handleTranscript(finalText.trim());
        else startListening();
      };

      activeRecognition = rec;
      try { rec.start(); } catch { /* already started */ }
    }

    startListening();

    return () => {
      destroyed = true;
      if (activeRecognition) { try { activeRecognition.stop(); } catch { /* ignore */ } }
      if (activeSource) { try { activeSource.stop(); } catch { /* ignore */ } }
      window.speechSynthesis?.cancel();
      audioCtx.close().catch(() => {});
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const stateLabel =
    voiceState === "thinking" ? "Thinking…"
    : voiceState === "speaking" ? "Speaking"
    : isRecording ? "Listening…"
    : "Get ready…";

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center select-none"
      style={{ background: "rgba(10, 26, 18, 0.97)" }}
    >
      <button
        onClick={onClose}
        className="absolute top-5 right-5 w-11 h-11 flex items-center justify-center rounded-full bg-white/10 hover:bg-white/20 text-white transition-all"
        aria-label="Close voice mode"
      >
        <svg viewBox="0 0 24 24" className="w-5 h-5 stroke-current fill-none" strokeWidth="2" strokeLinecap="round">
          <line x1="18" y1="6" x2="6" y2="18" />
          <line x1="6" y1="6" x2="18" y2="18" />
        </svg>
      </button>

      <p className="text-white/30 text-[13px] tracking-[0.25em] uppercase font-semibold mb-14">
        Clovis
      </p>

      <button
        className="relative w-52 h-52 flex items-center justify-center mb-8 focus:outline-none"
        style={{ cursor: voiceState === "speaking" ? "pointer" : "default" }}
        onClick={() => voiceState === "speaking" && interruptRef.current()}
        aria-label={voiceState === "speaking" ? "Tap to interrupt" : undefined}
      >
        {(isRecording || voiceState === "speaking") && (
          <>
            <div
              className="absolute inset-0 rounded-full bg-clover-green/15 animate-ping"
              style={{ animationDuration: voiceState === "listening" ? "2.2s" : "1.6s" }}
            />
            <div
              className="absolute inset-8 rounded-full bg-clover-green/15 animate-ping"
              style={{ animationDuration: voiceState === "listening" ? "2.8s" : "2s", animationDelay: "0.5s" }}
            />
          </>
        )}
        <div
          className={`relative w-36 h-36 rounded-full flex items-center justify-center transition-all duration-500 ${
            voiceState === "thinking" ? "bg-gray-600 animate-pulse" : "bg-clover-green"
          }`}
          style={
            voiceState !== "thinking" && (isRecording || voiceState === "speaking")
              ? { boxShadow: "0 0 0 8px rgba(82,183,136,0.12), 0 0 60px rgba(82,183,136,0.35)" }
              : voiceState !== "thinking"
              ? { opacity: 0.45 }
              : undefined
          }
        >
          {voiceState === "listening" && (
            <svg
              viewBox="0 0 24 24"
              className={`w-12 h-12 stroke-white fill-none ${isRecording ? "animate-pulse" : ""}`}
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z" />
              <path d="M19 10v2a7 7 0 0 1-14 0v-2" />
              <line x1="12" y1="19" x2="12" y2="23" />
              <line x1="8" y1="23" x2="16" y2="23" />
            </svg>
          )}
          {voiceState === "thinking" && (
            <div className="flex gap-1.5 items-center">
              {[0, 150, 300].map((delay) => (
                <span key={delay} className="w-2.5 h-2.5 rounded-full bg-white animate-bounce" style={{ animationDelay: `${delay}ms` }} />
              ))}
            </div>
          )}
          {voiceState === "speaking" && (
            <svg viewBox="0 0 24 24" className="w-12 h-12 stroke-white fill-none" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07" />
            </svg>
          )}
        </div>
      </button>

      <p className="text-white/70 text-[17px] font-semibold mb-1">{stateLabel}</p>

      <p className={`text-white/30 text-base font-medium mb-6 transition-opacity duration-300 ${voiceState === "speaking" ? "opacity-100" : "opacity-0"}`}>
        Tap to interrupt
      </p>

      <div className="w-full max-w-sm px-8 min-h-[72px] text-center">
        {voiceState === "speaking" && botText ? (
          <p className="text-white/50 text-base font-medium leading-relaxed line-clamp-4">
            {botText.replace(/CHIPS:.*$/m, "").replace(/\*\*(.+?)\*\*/g, "$1").replace(/\[(.+?)\]\(.+?\)/g, "$1").trim()}
          </p>
        ) : transcript ? (
          <p className="text-white text-[17px] font-semibold leading-relaxed">{transcript}</p>
        ) : voiceState === "listening" ? (
          <p className="text-white/25 text-base font-medium italic">
            {isRecording ? "Speak now…" : "Warming up…"}
          </p>
        ) : null}
      </div>
    </div>
  );
}
