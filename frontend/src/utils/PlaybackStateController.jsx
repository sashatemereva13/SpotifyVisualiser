import { useFrame } from "@react-three/fiber";

/**
 * PlaybackStateController
 * ------------------------------------------------
 * Owns the playback state machine.
 * Must live INSIDE <Canvas>.
 *
 * States:
 * idle → anticipation → awakening → playing → ending
 */
export default function PlaybackStateController({
  audio,
  beatRef,
  audioReadyRef,
  playbackStateRef,
  onPlaybackChange,
}) {
  useFrame(() => {
    const state = playbackStateRef.current;

    // Idle → anticipation
    if (audio && state === "idle") {
      playbackStateRef.current = "anticipation";
    }

    // Anticipation → awakening
    if (audioReadyRef.current && state === "anticipation") {
      playbackStateRef.current = "awakening";
    }

    // Awakening → playing (first strong beat)
    if (beatRef.current > 0.9 && state === "awakening") {
      playbackStateRef.current = "playing";
      onPlaybackChange?.(true);
    }
  });

  return null;
}
