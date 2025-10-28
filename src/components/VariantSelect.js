"use client";

import { useEffect, useMemo, useState } from "react";

export default function VariantSelect({
  variants = [],
  value,                 // objeto seleccionado (del padre)
  onChange,              // (variant) => void
  className = "",
  label = "Variante",
  placeholder = "Elige una opción",
  IsBrandcapsProduct,
  opt = "color",         // "color" | "size" | "material"
  achromaticMode = false,
}) {
  // Guardamos el ÍNDICE seleccionado (no el objeto)
  const [selectedIdx, setSelectedIdx] = useState(-1);

  // Armar etiquetas visibles
  const options = useMemo(() => {
    return (variants || []).map((v, idx) => {
      const parts = [];
      if (!IsBrandcapsProduct) {
        if (opt === "color" && v?.colorParsed) parts.push(v.colorParsed);
        if (opt === "size"  && v?.sizeParsed)  parts.push(v.sizeParsed);
        if (opt === "material" && v?.material) parts.push(v.material);
      } else {
        if (opt === "color" && v?.color) parts.push(v.color);
        if (opt === "size"  && v?.size)  parts.push(v.size);
        if (opt === "material" && v?.material) parts.push(v.material);
      }

      const stockTxt =
        typeof v?.stock === "number"
          ? `${v.stock.toLocaleString("es-AR")} un.`
          : v?.stock ? `${v.stock} un.` : "—";

      const uniq = (arr) => [...new Set(arr)];
      const all = uniq(parts.filter(Boolean));

      return {
        key: v?.id ?? v?.sku ?? idx,
        label: `${all.join(" - ") || "Variante"} - ${stockTxt}`,
        value: String(idx),   // el select trabaja mejor con string
        raw: v,
        disabled: Number(v?.stock) <= 0,
      };
    });
  }, [variants, opt, IsBrandcapsProduct]);

  // Buscar índice del "value" que viene del padre (por id/sku/campo lógico)
  const computeIndexFromValue = () => {
    if (!value || !variants?.length) return -1;

    const same = (a, b) => {
      if (!a || !b) return false;
      if (a.id && b.id && a.id === b.id) return true;
      if (a.sku && b.sku && a.sku === b.sku) return true;
      // comparación por campo lógico
      if (opt === "color" && a.color && b.color && a.color === b.color) return true;
      if (opt === "size"  && a.size  && b.size  && a.size  === b.size)  return true;
      if (opt === "material" && a.material && b.material && a.material === b.material) return true;
      return false;
    };

    const idx = variants.findIndex((v) => same(v, value));
    return idx >= 0 ? idx : -1;
  };

  // Sincronizar cuando cambian `value` o `variants`
  useEffect(() => {
    const idx = computeIndexFromValue();
    setSelectedIdx(idx);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, variants, opt]);

  // Manejar cambio del select
  const handleChange = (e) => {
    const idx = Number(e.target.value);
    setSelectedIdx(idx);
    onChange?.(variants[idx] || null);
  };

  const current = selectedIdx >= 0 ? variants[selectedIdx] : null;

  return (
    <div className={className}>
      <label className="block mb-2 font-medium">{label}</label>
      <select
        className="w-full border rounded p-2"
        value={selectedIdx >= 0 ? String(selectedIdx) : ""}
        onChange={handleChange}
      >
        <option value="" disabled>
          {placeholder}
        </option>
        {options.map((opt) => (
          <option key={opt.key} value={opt.value} disabled={opt.disabled}>
            {opt.label}
          </option>
        ))}
      </select>

      {current && (
        <p className="text-sm text-gray-600 mt-2">
          SKU: <span className="font-mono">{current.sku || "—"}</span> · Stock:{" "}
          {Number(current.stock || 0).toLocaleString("es-AR")}
        </p>
      )}
    </div>
  );
}
