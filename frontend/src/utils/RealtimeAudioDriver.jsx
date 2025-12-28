/**
 * RealtimeAudioDriver
 * ------------------------------------------------
 * Responsibilities:
 *
 * - Connects the SINGLE shared HTMLAudioElement to the Web Audio API
 * - Extracts REAL-TIME audio features every frame:
 *     • RMS (overall energy)
 *     • Frequency bands (low / mid / high)
 *     • Beat impulses (simple energy-based detection)
 *
 * This file is the LIVE audio analysis engine.
 * It runs continuously while audio is playing.
 *
 * IMPORTANT ARCHITECTURAL RULES:
 * ------------------------------------------------
 * - The HTMLAudioElement must already exist and be playing.
 * - ONLY ONE MediaElementSourceNode may ever be created
 *   for a given audio element (Web Audio API constraint).
 * - We branch the signal graph (analyser + destination),
 *   NOT the audio element itself.
 *
 * Data flow:
 *   audio (HTMLAudioElement)
 *        ↓
 *   AudioContext → AnalyserNode
 *        ↓
 *   rmsRef / bandsRef / beatRef (updated every frame)
 *
 * These refs are consumed by:
 *   - CentralAura (body movement, breathing)
 *   - FractalSDF (shape distortion, glow, mood)
 *
 * Mental model:
 *   This is the "microphone + heartbeat sensor" of the system.
 */

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";

export default function RealtimeAudioDriver({
  audio,
  rmsRef,
  bandsRef,
  beatRef,
}) {
  const ctxRef = useRef(null);
  const analyserRef = useRef(null);
  const dataRef = useRef(null);

  const rmsHistory = useRef([]);

  useEffect(() => {
    if (!audio) return;

    const ctx = new AudioContext();
    ctxRef.current = ctx;

    const source = ctx.createMediaElementSource(audio);

    const analyser = ctx.createAnalyser();
    analyser.fftSize = 1024;

    // branch graph: analyser + speakers
    source.connect(analyser);
    source.connect(ctx.destination);

    analyserRef.current = analyser;
    dataRef.current = new Uint8Array(analyser.frequencyBinCount);

    return () => {
      source.disconnect();
      analyser.disconnect();
      ctx.close();
    };
  }, [audio]); // 🔑 audio must be a dependency

  useFrame(() => {
    const analyser = analyserRef.current;
    const data = dataRef.current;
    if (!analyser || !data) return;

    analyser.getByteFrequencyData(data);

    // ---- RMS ----
    let sum = 0;
    for (let i = 0; i < data.length; i++) {
      const v = data[i] / 255;
      sum += v * v;
    }

    const rms = Math.sqrt(sum / data.length);
    rmsRef.current = Math.min(1, rms * 4.0); // scaled for visuals

    // ---- BEAT DETECTION ----
    rmsHistory.current.push(rms);
    if (rmsHistory.current.length > 20) {
      rmsHistory.current.shift();
    }

    const avg =
      rmsHistory.current.reduce((a, b) => a + b, 0) / rmsHistory.current.length;

    const threshold = 1.6;
    if (rms > avg * threshold && rms > 0.05) {
      beatRef.current = 1.0;
    }

    // decay beat impulse
    beatRef.current = Math.max(0, beatRef.current - 0.08);

    // ---- Frequency Bands ----
    if (bandsRef) {
      const low = data.slice(0, 40);
      const mid = data.slice(40, 160);
      const high = data.slice(160);

      const avgBand = (arr) =>
        arr.reduce((a, b) => a + b, 0) / (arr.length * 255);

      bandsRef.current = {
        low: avgBand(low),
        mid: avgBand(mid),
        high: avgBand(high),
      };
    }
  });

  return null;
}
