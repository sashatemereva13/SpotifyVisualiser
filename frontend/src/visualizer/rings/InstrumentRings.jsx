// InstrumentRings.jsx
import InstrumentRing from "./InstrumentRing";

export default function InstrumentRings({
  analysis,
  danceEnergy = 0,
  beatEnergy = 0,
  disassemble = 0,
}) {
  const low = analysis?.low?.[0] ?? 0.4;
  const mid = analysis?.mid?.[0] ?? 0.6;
  const high = analysis?.high?.[0] ?? 0.2;

  const assembled = 1 - disassemble;

  const breath = 1 + assembled * 0.08 * danceEnergy + beatEnergy * 0.12;
  const spread = 1 + disassemble * 0.6;

  const baseOpacity = 0.25 + assembled * 0.25;
  const beatOpacity = beatEnergy * 0.35;

  return (
    <>
      {/* LOW — bass: radial compression + slow wave */}
      <InstrumentRing
        radius={1.9 * breath * spread}
        thickness={0.01}
        color="#74e3ff"
        speed={0.25 + danceEnergy * 0.2}
        intensity={low}
        opacity={baseOpacity + beatOpacity}
        y={-0.3 - disassemble * 0.2}
        bass={low}
        mid={mid * 0.35}
        high={high * 0.2}
        waveAmp={0.05}
        waveFreq={4.0}
        waveSpeed={1.2}
        radialComp={0.08 + beatEnergy * 0.12} // 🔥 bass signature
        jitterAmp={0.0}
        seed={1.1}
      />

      {/* MID — harmony: clean traveling ripple */}
      <InstrumentRing
        radius={1.9 * breath * (1 + disassemble * 0.4)}
        thickness={0.01}
        color="#1DE9B6"
        speed={0.45 + danceEnergy * 0.35}
        intensity={mid}
        opacity={baseOpacity + beatEnergy * 0.25}
        y={0.2}
        bass={low * 0.25}
        mid={mid}
        high={high * 0.35}
        waveAmp={0.07}
        waveFreq={7.0}
        waveSpeed={1.8}
        radialComp={0.02}
        jitterAmp={0.015}
        seed={2.3}
      />

      {/* HIGH — melody: angular jitter + fast micro-waves */}
      <InstrumentRing
        radius={1.4 * breath * (1 + disassemble * 0.3)}
        thickness={0.01}
        color="#6ce2ff"
        speed={0.8 + danceEnergy * 0.5}
        intensity={high}
        opacity={0.35 + beatEnergy * 0.4}
        y={0.7 + disassemble * 0.15}
        bass={low * 0.1}
        mid={mid * 0.35}
        high={high}
        waveAmp={0.06}
        waveFreq={11.0}
        waveSpeed={2.6}
        radialComp={0.0}
        jitterAmp={0.05 + beatEnergy * 0.06} // 🔥 high signature
        seed={4.7}
      />
    </>
  );
}
