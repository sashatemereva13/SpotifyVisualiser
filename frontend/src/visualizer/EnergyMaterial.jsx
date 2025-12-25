import * as THREE from "three";

export default function EnergyMaterial() {
  return (
    <>
      <meshPhysicalMaterial
        color="#F5C77A"
        metalness={0.9}
        roughness={0.1}
        clearcoat={0.5}
        clearcoatRoughness={0.05}
        iridescence={1.9}
        iridescenceIOR={3.2}
        iridescenceThicknessRange={[100, 900]}
        emissive="#ffce46"
        emissiveIntensity={0.6}
        transparent
        opacity={0.9}
        side={THREE.DoubleSide}
      />
    </>
  );
}
