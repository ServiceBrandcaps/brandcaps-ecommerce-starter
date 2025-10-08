"use client";
import { useEffect, useState } from "react";
import PriceRangeSlider from "./filters/PriceRangeSlider";
import { FunnelIcon } from "@heroicons/react/24/solid";

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
  const moneyAR = (n) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
    }).format(Number(n || 0));
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

  const onKeyDownCommit = (e) => {
    if (e.key === "Enter") commitPrice(localMin, localMax);
  };

  const Section = ({ title, children }) => (
    <section>
      <h3 className="text-sm font-semibold mb-2">{title}</h3>
      {children}
    </section>
  );

  return (
    <aside className={`w-[280px] shrink-0 ${className} bg-gray-100 p-5 rounded`}>
      <div className="sticky top-20 space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-medium">Filtros</h2>
          <button
            type="button"
            onClick={onClearAll}
            className=" border-black border-1  bg-white hover:bg-gray-200 text-black px-1 py-1 rounded cursor-pointer transition duration-200 flex items-center "
          >
            <FunnelIcon className="h-3 w-3 inline-block" />
          </button>
        </div>

        {/* Precio */}
        <section>
          <h3 className="text-sm font-semibold mb-2">Filtrar por precios</h3>

          <PriceRangeSlider
            min={priceBounds.min}
            max={priceBounds.max}
            step={priceBounds.step}
            valueMin={localMin}
            valueMax={localMax}
            onChange={(a, b) => {
              setLocalMin(clamp(a, priceBounds.min, localMax));
              setLocalMax(clamp(b, localMin, priceBounds.max));
            }}
            onCommit={(a, b) => commitPrice(a, b)}
          />

          <div className="mt-3 flex items-center gap-2">
            <input
              type="number"
              inputMode="numeric"
              min={priceBounds.min}
              max={localMax}
              placeholder="Desde"
              className="w-28 rounded border px-2 py-1 text-sm bg-white"
              value={localMin}
              onChange={(e) => setLocalMin(clamp(Number(e.target.value), priceBounds.min, localMax))}
              onBlur={() => commitPrice(localMin, localMax)}
              onKeyDown={onKeyDownCommit}
            />
            <span className="text-gray-500">—</span>
            <input
              type="number"
              inputMode="numeric"
              min={localMin}
              max={priceBounds.max}
              placeholder="Hasta"
              className="w-28 rounded border px-2 py-1 text-sm  bg-white"
              value={localMax}
              onChange={(e) => setLocalMax(clamp(Number(e.target.value), localMin, priceBounds.max))}
              onBlur={() => commitPrice(localMin, localMax)}
              onKeyDown={onKeyDownCommit}
            />
          </div>

          <p className="mt-2 text-xs text-gray-500">
            Actual: {priceMin === "" ? "—" : moneyAR(priceMin)} — {priceMax === "" ? "—" : moneyAR(priceMax)}
          </p>
        </section>

        {/* Familias */}
        <Section title="Categorías del producto">
          <div className="max-h-64 overflow-auto pr-1 space-y-2">
            {families.length === 0 && (
              <p className="text-xs text-gray-500">
                Sin categorías disponibles.
              </p>
            )}
            {families.map((f) => {
              const id = String(f.id ?? f._id ?? f.value);
              const title = String(f.title ?? f.description);
              const label =
                f.description || f.title || f.name || `Familia ${id}`;
              const checked = selectedFamilies.includes(title);
              return (
                <label key={id} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    className="accent-black"
                    checked={checked}
                    onChange={() => onToggleFamily?.(title)}
                  />
                  <span className="truncate">{label}</span>
                </label>
              );
            })}
          </div>
        </Section>
        {/* Subatributos */}
        {/* <Section title="Subatributos"> */}
          {/* Colores */}
          {/* {facets.colors?.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-medium mb-1 text-gray-600">Color</p>
              <div className="space-y-1 max-h-40 overflow-auto pr-1">
                {facets.colors.map(({ value }) => {
                  const checked = selectedSubattrs.some(
                    (e) => e.key === "colors" && e.value === value
                  );
                  return (
                    <label
                      key={`color-${value}`}
                      className="flex items-center gap-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        className="accent-black"
                        checked={checked}
                        onChange={() => onToggleSubattr?.("colors", value)}
                      />
                      <span className="truncate">{value}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )} */}

          {/* Material */}
          {/* {facets.materials?.length > 0 && (
            <div className="mb-3">
              <p className="text-xs font-medium mb-1 text-gray-600">Material</p>
              <div className="space-y-1 max-h-40 overflow-auto pr-1">
                {facets.materials.map(({ value }) => {
                  const checked = selectedSubattrs.some(
                    (e) => e.key === "material" && e.value === value
                  );
                  return (
                    <label
                      key={`mat-${value}`}
                      className="flex items-center gap-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        className="accent-black"
                        checked={checked}
                        onChange={() => onToggleSubattr?.("material", value)}
                      />
                      <span className="truncate">{value}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )} */}

          {/* Talle/Tamaño */}
          {/* {facets.sizes?.length > 0 && (
            <div className="mb-1">
              <p className="text-xs font-medium mb-1 text-gray-600">
                Talle / Tamaño
              </p>
              <div className="space-y-1 max-h-40 overflow-auto pr-1">
                {facets.sizes.map(({ value }) => {
                  const checked = selectedSubattrs.some(
                    (e) => e.key === "size" && e.value === value
                  );
                  return (
                    <label
                      key={`size-${value}`}
                      className="flex items-center gap-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        className="accent-black"
                        checked={checked}
                        onChange={() => onToggleSubattr?.("size", value)}
                      />
                      <span className="truncate">{value}</span>
                    </label>
                  );
                })}
              </div>
            </div>
          )} */}
        {/* </Section> */}
      </div>
    </aside>
  );
}
