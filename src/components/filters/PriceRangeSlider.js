"use client";
import { useMemo } from "react";

export default function PriceRangeSlider({
  min = 0,
  max = 100000,
  step = 10,
  valueMin,
  valueMax,
  onChange,     // (min,max) mientras se mueve
  onCommit,     // (min,max) al soltar/terminar
  className = "",
}) {
  const clamp = (v, a, b) => Math.min(Math.max(v, a), b);

  const pct = useMemo(() => {
    const p1 = ((valueMin - min) * 100) / (max - min || 1);
    const p2 = ((valueMax - min) * 100) / (max - min || 1);
    return [Math.max(0, p1), Math.min(100, p2)];
  }, [valueMin, valueMax, min, max]);

  const bg = `linear-gradient(90deg,
      #e5e7eb ${pct[0]}%, #111 ${pct[0]}%,
      #111 ${pct[1]}%, #e5e7eb ${pct[1]}%)`;

  const handleMin = (e) => {
    const v = clamp(Number(e.target.value), min, valueMax);
    onChange?.(v, valueMax);
  };
  const handleMax = (e) => {
    const v = clamp(Number(e.target.value), valueMin, max);
    onChange?.(valueMin, v);
  };
  const commit = () => onCommit?.(valueMin, valueMax);

  return (
    <div className={`relative h-8 ${className}`}>
      {/* pista coloreada */}
      <div className="absolute left-0 right-0 top-3 h-2 rounded-full" style={{ background: bg }} />
      {/* dos sliders superpuestos */}
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={valueMin}
        onChange={handleMin}
        onMouseUp={commit}
        onTouchEnd={commit}
        className="absolute left-0 right-0 top-2 h-3 w-full appearance-none bg-transparent pointer-events-auto"
        style={{ WebkitAppearance: "none" }}
      />
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={valueMax}
        onChange={handleMax}
        onMouseUp={commit}
        onTouchEnd={commit}
        className="absolute left-0 right-0 top-2 h-3 w-full appearance-none bg-transparent pointer-events-auto"
        style={{ WebkitAppearance: "none" }}
      />
      {/* estilos del thumb (Tailwind no aplica a pseudo-elementos) */}
      <style jsx>{`
        input[type="range"]::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 16px;
          height: 16px;
          border-radius: 9999px;
          background: #111;
          border: 2px solid white;
          box-shadow: 0 0 0 1px #111;
          cursor: pointer;
          margin-top: -6px;
        }
        input[type="range"]::-moz-range-thumb {
          width: 16px;
          height: 16px;
          border-radius: 9999px;
          background: #111;
          border: 2px solid white;
          box-shadow: 0 0 0 1px #111;
          cursor: pointer;
        }
      `}</style>
    </div>
  );
}
