function ParallaxController({ targetRef, parallaxRef, strength = 1 }) {
  useFrame((_, delta) => {
    parallaxRef.current.x = THREE.MathUtils.damp(
      parallaxRef.current.x,
      targetRef.current.x * strength,
      6,
      delta
    );

    parallaxRef.current.y = THREE.MathUtils.damp(
      parallaxRef.current.y,
      targetRef.current.y * strength,
      6,
      delta
    );
  });

  return null;
}

export default ParallaxController;
