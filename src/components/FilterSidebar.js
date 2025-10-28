"use client";
import { useEffect, useState } from "react";
import Slider from "rc-slider";
import { FunnelIcon } from "@heroicons/react/24/solid";
import "rc-slider/assets/index.css";

export default function FilterSidebar({
  families = [],
  facets = { colors: [], materials: [], sizes: [] },
  selectedFamilies = [],
  selectedSubattrs = [], // [{ key:'colors'|'material'|'size', value:string }]
  priceMin = "", // estado “fuente de verdad” en el page
  priceMax = "",
  priceBounds = { min: 0, max: 100000, step: 10 },
  onCommitPrice, // (min,max) -> aplica filtros
  onToggleFamily,
  onToggleSubattr,
  onClearAll,
  className = "",
}) {
  // --- estado local de inputs/slider (edición sin aplicar) ---
  const [localMin, setLocalMin] = useState(
    priceMin === "" ? priceBounds.min : Number(priceMin)
  );
  const [localMax, setLocalMax] = useState(
    priceMax === "" ? priceBounds.max : Number(priceMax)
  );

  // si cambian desde afuera (limpiar filtros o nueva búsqueda), sincroniza
  useEffect(() => {
    setLocalMin(priceMin === "" ? priceBounds.min : Number(priceMin));
  }, [priceMin, priceBounds.min]);

  useEffect(() => {
    setLocalMax(priceMax === "" ? priceBounds.max : Number(priceMax));
  }, [priceMax, priceBounds.max]);

  const clamp = (v, a, b) => Math.min(Math.max(v, a), b);

  const commitPrice = (minV, maxV) => {
    // si coincide con límites, consideramos “vacío” para no mandar filtros inútiles
    const sendMin = minV <= priceBounds.min ? "" : String(minV);
    const sendMax = maxV >= priceBounds.max ? "" : String(maxV);
    onCommitPrice?.(sendMin, sendMax);
  };

  const Section = ({ title, children }) => (
    <section>
      <h3 className="text-sm font-semibold mb-2">{title}</h3>
      {children}
    </section>
  );

  // --- helpers para normalizar/slugificar y ocultar LOGO 24 ---
  const _normalize = (s = "") =>
    s
      .toString()
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, ""); // quita tildes

  const _slugify = (s = "") =>
    _normalize(s)
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  function hideFamily(titleOrSlug = "") {
    const n = _normalize(titleOrSlug); // ej: "logo 24 hs"
    const sl = _slugify(titleOrSlug); // ej: "logo-24hs"
    return (
      n.includes("logo 24") ||
      n.includes("logo24") ||
      sl === "logo-24" ||
      sl === "logo-24hs" ||
      sl === "logo24" ||
      sl.startsWith("logo-24")
    );
  }

  return (
    <aside
      className={`w-full md:w-[280px] shrink-0 ${className} bg-gray-100 p-4 md:p-5 md:mt-7 rounded md:rounded`}
    >
      <div className="md:sticky md:top-20 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Filtros</h2>
          <button
            type="button"
            onClick={onClearAll}
            className="border-black border-1 bg-white hover:bg-gray-200 text-black px-1 py-1 rounded cursor-pointer transition duration-200 flex items-center"
          >
            <FunnelIcon className="h-3 w-3 inline-block" />
          </button>
        </div>

        {/* Precio */}
        <section>
          <p className="text-sm font-medium mb-2">Filtrar por precios</p>

          {/* inputs numéricos: editan local y confirman con Enter/Blur */}
          <div className="flex items-center gap-2 mb-3">
            <input
              type="number"
              inputMode="numeric"
              className="w-full border rounded px-2 py-1 text-sm"
              placeholder="Desde"
              value={localMin}
              onChange={(e) => {
                const v = Number(e.target.value || 0);
                // no permitir pasar el max
                setLocalMin(clamp(v, priceBounds.min, localMax));
              }}
              onBlur={() => commitPrice(localMin, localMax)}
              onKeyDown={(e) =>
                e.key === "Enter" && commitPrice(localMin, localMax)
              }
            />
            <span className="text-gray-400">—</span>
            <input
              type="number"
              inputMode="numeric"
              className="w-full border rounded px-2 py-1 text-sm"
              placeholder="Hasta"
              value={localMax}
              onChange={(e) => {
                const v = Number(e.target.value || 0);
                // no permitir bajar del min
                setLocalMax(clamp(v, localMin, priceBounds.max));
              }}
              onBlur={() => commitPrice(localMin, localMax)}
              onKeyDown={(e) =>
                e.key === "Enter" && commitPrice(localMin, localMax)
              }
            />
          </div>

          {/* slider (dual-handle): mueve local; confirma al SOLTAR */}
          <div className="px-1 md:px-0">
            <Slider
              range
              allowCross={false}
              step={1}
              min={priceBounds?.min ?? 0}
              max={priceBounds?.max ?? 100000}
              value={[localMin, localMax]}
              onChange={(vals) => {
                const [min, max] = vals;
                setLocalMin(min);
                setLocalMax(max);
              }}
              onChangeComplete={(vals) => {
                const [min, max] = vals;
                commitPrice(min, max);
              }}
              handleStyle={[
                { borderColor: "#000", backgroundColor: "#000" },
                { borderColor: "#000", backgroundColor: "#000" },
              ]}
              trackStyle={[{ backgroundColor: "#000", height: 6 }]}
              railStyle={{ backgroundColor: "#e5e7eb", height: 6 }}
              className="py-2"
            />
            <div className="mt-1 text-xs text-gray-500">
              Actual: ${localMin.toLocaleString()} — $
              {localMax.toLocaleString()}
            </div>
          </div>
        </section>

        {/* Familias */}
        <Section title="Categorías del producto">
          <div className="h-full overflow-auto pr-1 space-y-2">
            {families.length === 0 && (
              <p className="text-xs text-gray-500">
                Sin categorías disponibles.
              </p>
            )}
            {families
              .filter((f) => {
                const title = String(f.title ?? f.description ?? f.name ?? "");
                const slug = String(f.slug ?? "");
                return !hideFamily(title || slug);
              })
              .map((f) => {
                const id = String(f.id ?? f._id ?? f.value);
                const title = String(
                  f.title ?? f.description ?? f.name ?? `Familia ${id}`
                );
                const checked = selectedFamilies.includes(title);
                return (
                  <label key={id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      className="accent-black"
                      checked={checked}
                      onChange={() => onToggleFamily?.(title)}
                    />
                    <span className="truncate">{title}</span>
                  </label>
                );
              })}
          </div>
        </Section>

        {/* (Subatributos comentados como en tu archivo) */}
      </div>
    </aside>
  );
}
