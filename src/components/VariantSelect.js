"use client";

import { useEffect, useMemo, useState } from "react";

/**
 * Variants (ejemplo) esperadas:
 * [
 *   { id, sku, stock, color, size, material?, achromatic? }
 * ]
 */
export default function VariantSelect({
  variants = [],
  value, // variante seleccionada (obj) opcional
  onChange, // (variant) => void
  className = "",
  label = "Color / Variante",
  placeholder = "Elige una opción",
  IsBrandcapsProduct,
}) {
  const [selected, setSelected] = useState(value || null);

  // Elige la primera variante con stock>0 por defecto
  useEffect(() => {
    if (!variants?.length) {
      setSelected(null);
      return;
    }
    if (!selected) {
      const withStock = variants.find((v) => Number(v?.stock) > 0);
      setSelected(withStock || variants[0]);
      onChange?.(withStock || variants[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [variants]);

  // Mapea las etiquetas de las variantes
  const options = useMemo(() => {
    return (variants || []).map((v, idx) => {
      const parts = [];
      //console.log(v);
      if (IsBrandcapsProduct) {
        if (v?.color) parts.push(v.color);
        if (v?.size) parts.push(v.size);
        if (v?.material) parts.push(v.material);
      } else {
        if (v?.elementDescription1  != ' ') parts.push(v.elementDescription1);
        if (v?.elementDescription2  != ' ') parts.push(v.elementDescription2);
        if (v?.elementDescription3 != ' ') parts.push(v.elementDescription3);
        if (v?.additionalDescription != ' ') parts.push(v.additionalDescription);
      }

      const stockTxt =
        typeof v?.stock === "number"
          ? `${v.stock.toLocaleString("es-AR")} un.`
          : v?.stock
          ? `${v.stock} un.`
          : "—";
      //console.log(parts)
      const uniq = (arr) => [...new Set(arr)];
      const all = uniq(parts.map(p => p).filter(Boolean));
      return {
        key: v?.id ?? v?.sku ?? idx,
        label: `${
          all.filter(Boolean).join(" - ") || "Variante"
        } - ${stockTxt}`, //v?.sku ||
        value: idx, // usamos el índice para luego recuperar el objeto
        disabled: Number(v?.stock) <= 0,
        raw: v,
      };
    });
  }, [variants, IsBrandcapsProduct]);

  const handleChange = (e) => {
    const idx = Number(e.target.value);
    const v = variants[idx] || null;
    setSelected(v);
    onChange?.(v);
  };

  //console.log(options);

  return (
    <div className={className}>
      <label className="block mb-2 font-medium">{label}</label>
      <select
        className="w-full border rounded p-2"
        value={selected ? variants.findIndex((v) => v === selected) ?? "" : ""}
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

      {/* Info auxiliar */}
      {selected && (
        <p className="text-sm text-gray-600 mt-2">
          SKU: <span className="font-mono">{selected.sku || "—"}</span> · Stock:{" "}
          {Number(selected.stock || 0).toLocaleString("es-AR")}
        </p>
      )}
    </div>
  );
}
