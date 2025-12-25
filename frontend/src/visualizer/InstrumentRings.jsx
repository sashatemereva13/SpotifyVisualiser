import InstrumentRing from "./InstrumentRing";

export default function InstrumentRings({ analysis }) {
  //temporary - change later
  const low = analysis?.low?.[0] ?? 0.4;
  const mid = analysis?.mid?.[0] ?? 0.6;
  const high = analysis?.high?.[0] ?? 0.2;

  return (
    <>
      {/*  LOW - bass */}
      <InstrumentRing
        raius={1.6}
        thickness={0.09}
        color="#A6D7C2"
        speed={0.25}
        intensity={low}
        y={-0.3}
      />

      {/* MID - harmony */}
      <InstrumentRing
        radius={1.25}
        thickness={0.06}
        color="#FDC9E9"
        speed={0.45}
        intensity={mid}
        y={0.2}
      />

      {/* HIGH - melody */}
      <InstrumentRing
        radius={0.9}
        thickness={0.035}
        color="#B09EB9"
        speed={0.8}
        intensity={high}
        y={0.7}
      />
    </>
  );
}
