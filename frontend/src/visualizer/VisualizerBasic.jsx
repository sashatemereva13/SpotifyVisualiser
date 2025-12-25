import { useEffect, useRef } from "react";

export default function VisualizerBasic({ data }) {
  const canvasRef = useRef();

  useEffect(() => {
    if (!data) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const bands = [
      { label: "low", color: "#ff4d4d" },
      { label: "mid", color: "#4dff88" },
      { label: "high", color: "#4da6ff" },
    ];

    bands.forEach(
      (band, i) => {
        const values = data[band.label];
        if (!values) return;

        const avg = values.reduce((a, b) => a + b, 0) / values.length;

        ctx.fillStyle = band.color;
        ctx.fillRect(100 + i * 150, canvas.height - avg * 200, 80, avg * 200);
      },
      [data]
    );
  });

  return (
    <>
      <canvas ref={canvasRef} width={600} height={400}></canvas>
    </>
  );
}
