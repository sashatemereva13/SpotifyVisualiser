import * as THREE from "three";

export default function EnergyMaterial({ energy, hue }) {
  const color = new THREE.Color().setHSL(hue, 0.6, 0.15);

  return (
    <>
      <meshPhysicalMaterial
        color={color}
        metalness={0.9}
        roughness={0.1}
        clearcoat={0.5}
        clearcoatRoughness={0.05}
        iridescence={0.3}
        iridescenceIOR={2.6}
        iridescenceThicknessRange={[200, 800]}
        emissive="#2f82b5"
        emissiveIntensity={0.4 + energy * 0.8}
        transparent
        opacity={0.7}
        side={THREE.DoubleSide}
      />
    </>
  );
}
