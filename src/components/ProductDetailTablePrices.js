export default function PriceTiersTable({ tiers = [], margin = 0, qty = 0 }) {
  const fmt = (n) =>
    typeof n !== "number"
      ? "—"
      : n.toLocaleString("es-AR", {
          style: "currency",
          currency: "ARS",
          maximumFractionDigits: 0,
        });

  const applyMargin = (p) => {
    const m = Number(margin) || 0;
    return Math.round(p * (1 + m / 100));
  };

  // ordena por mínimo asc
  const sorted = [...tiers].sort((a, b) => (a.min || 0) - (b.min || 0));

  const label = (t) => (t?.max ? `${t.min}–${t.max}` : `${t.min}+`);

  const activeIdx = (() => {
    if (!qty) return 0;
    const firstMin = sorted[0]?.min || 0;
    if (qty < firstMin) return 0;
    const idx = sorted.findIndex(
      (t) => qty >= (t.min || 0) && (t.max == null || qty <= t.max)
    );
    return idx >= 0 ? idx : sorted.length - 1;
  })();

  if (!sorted.length) return null;

  return (
    <div className="-mx-3 md:mx-0 overflow-x-auto md:overflow-visible">
      <table className="min-w-[640px] w-full border border-gray-200 text-sm">
        <thead>
          <tr className="bg-gray-50 text-gray-700">
            <th className="px-3 py-2 text-left font-medium border-r border-gray-200">
              Cantidad
            </th>
            {sorted.map((t, i) => (
              <th
                key={i}
                className={
                  "px-3 py-2 text-center font-semibold border-r border-gray-200 " +
                  (i === activeIdx
                    ? "bg-blue-50 ring-1 ring-inset ring-blue-300"
                    : "")
                }
              >
                {label(t)}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            <td className="px-3 py-2 font-medium border-t border-r border-gray-200">
              Precio por item
            </td>
            {sorted.map((t, i) => (
              <td
                key={i}
                className={
                  "px-3 py-2 text-center border-t border-r border-gray-200 " +
                  (i === activeIdx
                    ? "bg-blue-50 ring-1 ring-inset ring-blue-300"
                    : "")
                }
              >
                {fmt(applyMargin(Number(t.price)))}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}
