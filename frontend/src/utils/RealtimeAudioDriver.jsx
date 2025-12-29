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
  const sourceRef = useRef(null);
  const analyserRef = useRef(null);
  const dataRef = useRef(null);

  // audio identity guard
  const boundAudioRef = useRef(null);

  // smoothing helpers
  const rmsSmoothedRef = useRef(0);
  const rmsHistory = useRef([]);

  useEffect(() => {
    if (!audio) return;

    // if that exact element was wired already, do nothing
    if (boundAudioRef.current === audio && analyserRef.current) return;

    // If a new audio element arrives
    // cleanly tear down previous graph
    cleanupGraph();

    boundAudioRef.current = audio;

    // create or reuse audio context
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const ctx = ctxRef.current ?? new AudioCtx();
    ctxRef.current = ctx;

    // ensure context is running
    // prevention for Safari
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {
        // if resume fails, visuals will stay at null
        // avoids hard crash
      });
    }

    // only one media element source node may be created
    // for a given HTMLAudioElement
    // prevention for react Strict Mode that runs twice
    let source = audio.__mediaSourceNode;

    if (!source) {
      source = ctx.createMediaElementSource(audio);
      audio.__mediaSourceNode = source;
    }

    sourceRef.current = source;
    source.connect(ctx.destination);

    const analyser = ctx.createAnalyser();
    analyser.fftSize = 1024;
    analyser.smoothingTimeConstant = 0.85; // for the visuals
    analyserRef.current = analyser;

    //connect source -> analyser -> destination
    source.connect(analyser);

    dataRef.current = new Uint8Array(analyser.frequencyBinCount);

    return () => {
      // in strict mode the cleanup runs during the 'test unmount'
      cleanupGraph(false);
    };
  }, [audio]);

  function cleanupGraph(alsoCloseContext = false) {
    try {
      if (sourceRef.current) sourceRef.current.disconnect();
    } catch {}

    try {
      if (analyserRef.current) analyserRef.current.disconnect();
    } catch {}

    sourceRef.current = null;
    analyserRef.current = null;
    dataRef.current = null;

    rmsHistory.current = [];
    rmsSmoothedRef.current = 0;
    if (beatRef) beatRef.current = 0;

    if (alsoCloseContext && ctxRef.current) {
      // keep context alice across track changes
      ctxRef.current.close().catch(() => {});
      ctxRef.current = null;
    }
  }

  useFrame((_, delta) => {
    const analyser = analyserRef.current;
    const data = dataRef.current;
    if (!analyser || !data) return;

    analyser.getByteFrequencyData(data);

    // ---- RMS ----
    let sumSq = 0;
    for (let i = 0; i < data.length; i++) {
      const v = data[i] / 255;
      sumSq += v * v;
    }

    const rmsRaw = Math.sqrt(sumSq / data.length);

    // smooth RMS for nicer motion
    // exponential smoothing
    const smoothing = 1 - Math.pow(0.001, delta); // frame-rate independent
    const rmsSmoothed =
      rmsSmoothedRef.current + (rmsRaw - rmsSmoothedRef.current) * smoothing;
    rmsSmoothedRef.current = rmsSmoothed;

    // scale for visuals
    const rmsVisual = Math.min(1, rmsSmoothed * 4.0);
    if (rmsRef) rmsRef.current = rmsVisual;

    // ---- BEAT DETECTION ----
    rmsHistory.current.push(rmsRaw);
    if (rmsHistory.current.length > 24) {
      rmsHistory.current.shift();
    }

    const avg =
      rmsHistory.current.reduce((a, b) => a + b, 0) / rmsHistory.current.length;

    const threshold = 1.6;
    const minEnergy = 0.05;

    if (rmsRaw > avg * threshold && rmsRaw > minEnergy) {
      if (beatRef) beatRef.current = 1.0;
    }

    // decay impulse
    // frame rate independent
    const decayPerSecond = 2.5;
    if (beatRef)
      beatRef.current = Math.max(0, beatRef.current - decayPerSecond * delta);

    // ---- Frequency Bands ----
    if (bandsRef) {
      const lowEnd = 40;
      const midEnd = 160;

      let lowSum = 0;
      for (let i = 0; i < lowEnd; i++) lowSum += data[i];

      let midSum = 0;
      for (let i = lowEnd; i < midEnd; i++) midSum += data[i];

      let highSum = 0;
      for (let i = midEnd; i < data.length; i++) highSum += data[i];

      const low = lowSum / (lowEnd * 255);
      const mid = midSum / ((midEnd - lowEnd) * 255);
      const high = highSum / ((data.length - midEnd) * 255);

      bandsRef.current = { low, mid, high };
    }
  });

  return null;
}
