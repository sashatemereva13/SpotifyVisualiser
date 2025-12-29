/**
 * RealtimeAudioDriver
 * ------------------------------------------------
 * LIVE audio analysis engine (Web Audio API).
 *
 * Responsibilities:
 * - Bind a SINGLE MediaElementSourceNode to the audio element
 * - Extract real-time audio features every frame:
 *     • RMS (overall energy)
 *     • Beat impulses (energy spikes)
 *     • Frequency bands (low / mid / high)
 * - Drive the playback state machine (anticipation → playing)
 *
 * IMPORTANT ARCHITECTURAL RULES:
 * ------------------------------------------------
 * - One MediaElementSourceNode per HTMLAudioElement (FOREVER)
 * - Audio playback is routed through AudioContext.destination
 * - This component WRITES audio refs, others only READ
 */

import { useEffect, useRef } from "react";
import { useFrame } from "@react-three/fiber";

export default function RealtimeAudioDriver({
  audio,
  rmsRef,
  bandsRef,
  beatRef,
  audioReadyRef,
  playbackStateRef,
}) {
  /* ---------------- Web Audio Nodes ---------------- */
  const ctxRef = useRef(null);
  const analyserRef = useRef(null);
  const dataRef = useRef(null);

  /* ---------------- Identity Guards ---------------- */
  const boundAudioRef = useRef(null);

  /* ---------------- RMS Smoothing ---------------- */
  const rmsSmoothedRef = useRef(0);
  const rmsHistory = useRef([]);

  /* --------------------------------------------------
     Web Audio graph setup (runs on audio change)
  -------------------------------------------------- */
  useEffect(() => {
    if (!audio) return;

    // Prevent rebinding the same audio element
    if (boundAudioRef.current === audio && analyserRef.current) return;
    boundAudioRef.current = audio;

    // Create or reuse AudioContext
    const AudioCtx = window.AudioContext || window.webkitAudioContext;
    const ctx = ctxRef.current ?? new AudioCtx();
    ctxRef.current = ctx;

    // Safari / iOS safety
    if (ctx.state === "suspended") {
      ctx.resume().catch(() => {});
    }

    // 🔒 ONE MediaElementSourceNode per audio element
    let source = audio.__mediaSourceNode;
    if (!source) {
      source = ctx.createMediaElementSource(audio);
      audio.__mediaSourceNode = source;
    }

    // 🔊 Connect to speakers ONCE
    if (!source.__connectedToDestination) {
      source.connect(ctx.destination);
      source.__connectedToDestination = true;
    }

    // 📊 Analysis branch
    const analyser = ctx.createAnalyser();
    analyser.fftSize = 1024;
    analyser.smoothingTimeConstant = 0.85;
    analyserRef.current = analyser;

    source.connect(analyser);
    dataRef.current = new Uint8Array(analyser.frequencyBinCount);

    return () => {
      // DO NOT disconnect source (permanent binding)
      try {
        analyser.disconnect();
      } catch {}

      analyserRef.current = null;
      dataRef.current = null;

      rmsHistory.current = [];
      rmsSmoothedRef.current = 0;
      if (beatRef) beatRef.current = 0;
    };
  }, [audio]);

  /* --------------------------------------------------
     Per-frame audio analysis
  -------------------------------------------------- */
  useFrame((_, delta) => {
    const analyser = analyserRef.current;
    const data = dataRef.current;
    if (!analyser || !data) return;

    analyser.getByteFrequencyData(data);

    /* ---------------- RMS ---------------- */
    let sumSq = 0;
    for (let i = 0; i < data.length; i++) {
      const v = data[i] / 255;
      sumSq += v * v;
    }

    const rmsRaw = Math.sqrt(sumSq / data.length);

    // Frame-rate independent exponential smoothing
    const smoothing = 1 - Math.pow(0.001, delta);
    rmsSmoothedRef.current += (rmsRaw - rmsSmoothedRef.current) * smoothing;

    const rmsVisual = Math.min(1, rmsSmoothedRef.current * 4.0);
    if (rmsRef) rmsRef.current = rmsVisual;

    /* ---------------- AUDIO READY ---------------- */
    if (!audioReadyRef.current && rmsVisual > 0.02) {
      audioReadyRef.current = true;
    }

    /* ---------------- BEAT DETECTION ---------------- */
    rmsHistory.current.push(rmsRaw);
    if (rmsHistory.current.length > 24) rmsHistory.current.shift();

    const avg =
      rmsHistory.current.reduce((a, b) => a + b, 0) / rmsHistory.current.length;

    if (rmsRaw > avg * 1.6 && rmsRaw > 0.05) {
      if (beatRef) beatRef.current = 1.0;
    }

    // Beat decay (seconds-based)
    if (beatRef) {
      beatRef.current = Math.max(0, beatRef.current - 2.5 * delta);
    }

    /* ---------------- FREQUENCY BANDS ---------------- */
    if (bandsRef) {
      let low = 0,
        mid = 0,
        high = 0;

      for (let i = 0; i < 40; i++) low += data[i];
      for (let i = 40; i < 160; i++) mid += data[i];
      for (let i = 160; i < data.length; i++) high += data[i];

      bandsRef.current = {
        low: low / (40 * 255),
        mid: mid / (120 * 255),
        high: high / ((data.length - 160) * 255),
      };
    }

    /* ---------------- STATE MACHINE ---------------- */
    if (!playbackStateRef) return;

    if (audioReadyRef.current && playbackStateRef.current === "anticipation") {
      playbackStateRef.current = "awakening";
    }

    if (beatRef.current > 0.9 && playbackStateRef.current === "awakening") {
      playbackStateRef.current = "playing";
    }
  });

  return null;
}
