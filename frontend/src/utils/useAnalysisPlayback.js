import { useEffect, useRef, useState } from "react";

export default function useAnalysisPlayback(analysis, bpm = 120) {
  const [frame, setFrame] = useState(0);
  const frameRef = useRef(0);

  useEffect(() => {
    if (!analysis?.rms) return;

    frameRef.current = 0;
    setFrame(0);

    const interval = setInterval(() => {
      frameRef.current = (frameRef.current + 1) % analysis.rms.length;
      setFrame(frameRef.current);
    }, (60 / bpm) * 1000);

    return () => clearInterval(interval);
  }, [analysis, bpm]);

  if (!analysis) return null;

  return {
    rms: analysis.rms[frame] ?? 0,
    low: analysis.low,
    mid: analysis.mid,
    high: analysis.high,
    centroid: analysis.centroid?.[frame] ?? 0,
    onsets: analysis.onsets,
  };
}
