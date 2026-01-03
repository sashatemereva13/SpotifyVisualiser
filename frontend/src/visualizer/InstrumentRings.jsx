import InstrumentRing from "./InstrumentRing";

export default function InstrumentRings({
  analysis,
  danceEnergy = 0,
  beatEnergy = 0,
  disassemble = 0,
}) {
  // fallback if analysis not wired yet
  const low = analysis?.low?.[0] ?? 0.4;
  const mid = analysis?.mid?.[0] ?? 0.6;
  const high = analysis?.high?.[0] ?? 0.2;

  // assembled vs disassembled
  const assembled = 1 - disassemble;

  // global breathing (same rhythm as body)
  const breath = 1 + assembled * 0.08 * danceEnergy + beatEnergy * 0.12;

  // expansion during disassembly
  const spread = 1 + disassemble * 0.6;

  // opacity choreography
  const baseOpacity = 0.25 + assembled * 0.25;
  const beatOpacity = beatEnergy * 0.35;

  return (
    <>
      {/* LOW — bass */}
      <InstrumentRing
        radius={1.9 * breath * spread}
        thickness={0.01}
        color="#74e3ff"
        speed={0.25 + danceEnergy * 0.2}
        intensity={low}
        opacity={baseOpacity + beatOpacity}
        y={-0.3 - disassemble * 0.2}
      />

      {/* MID — harmony */}
      <InstrumentRing
        radius={1.9 * breath * (1 + disassemble * 0.4)}
        thickness={0.01}
        color="#1DE9B6"
        speed={0.45 + danceEnergy * 0.35}
        intensity={mid}
        opacity={baseOpacity + beatEnergy * 0.25}
        y={0.2}
      />

      {/* HIGH — melody */}
      <InstrumentRing
        radius={1.4 * breath * (1 + disassemble * 0.3)}
        thickness={0.01}
        color="#6ce2ff"
        speed={0.8 + danceEnergy * 0.5}
        intensity={high}
        opacity={0.35 + beatEnergy * 0.4}
        y={0.7 + disassemble * 0.15}
      />
    </>
  );
}
