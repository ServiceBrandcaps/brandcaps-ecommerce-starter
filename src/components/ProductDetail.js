// components/ProductDetail.js
import React, { useState, useMemo, useEffect } from "react";
import Head from "next/head";
import { useCart } from "../context/CartContext";
import { useToast } from "@/components/Toast";
import ProductImageGallery from "./ProductImageGallery";
import RelatedProductsCarousel from "../components/RelatedProductsCarousel";
import VariantSelect from "@/components/VariantSelect";
import PriceTiersTable from "@/components/ProductDetailTablePrices";
import { InformationCircleIcon } from "@heroicons/react/24/solid";

export default function ProductDetail({ producto }) {
  // Estados seleccionados (uno por dropdown) y la variante resultante
  const [selColor, setSelColor] = useState(null);
  const [selSize, setSelSize] = useState(null);
  const [variant, setVariant] = useState(null);
  const { addToCart } = useCart();
  const toast = useToast();
  const brandcapsProduct = producto?.brandcapsProduct ?? false;
  // Variantes y mínimos
  // const variants = brandcapsProduct
  //   ? producto?.products ?? []
  //   : producto?.variants ?? [];
  // const [variant, setVariant] = useState(variants[0] ?? null);
  // Variantes crudas (cada item puede tener color/size)

  // Helpers para leer color/talle según origen
  const normText = (s) => (typeof s === "string" ? s.trim() : s ?? "");
  const normKey = (s) =>
    normText(s)
      ?.toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "") || "";
  // --- DICCIONARIO de colores (normalizados, incluye multi-palabra) ---
  const COLOR_WORDS = [
    "blanco",
    "negro",
    "gris",
    "gris oscuro",
    "gris claro",
    "grafito",
    "plateado",
    "plata",
    "dorado",
    "oro",
    "natural",
    "beige",
    "marron",
    "cafe",
    "rojo",
    "bordo",
    "vino",
    "rosa",
    "fucsia",
    "violeta",
    "morado",
    "lila",
    "azul",
    "azul marino",
    "azul francia",
    "celeste",
    "turquesa",
    "verde",
    "verde manzana",
    "verde agua",
    "naranja",
    "amarillo",
    "transparente",
    "transp",
    "kaki",
  ].map((s) => s.toLowerCase());

  // Detecta todas las frases de color presentes en un texto ya normalizado
  const pickColorsFrom = (normalizedText) => {
    if (!normalizedText) return [];
    const found = [];
    for (const w of COLOR_WORDS) {
      if (normalizedText.includes(w) && !found.includes(w)) found.push(w);
    }
    // también soporta combos "blanco/negro", "blanco - negro", etc.
    const tokens = normalizedText.split(/[\s,/;+|-]+/g).filter(Boolean);
    tokens.forEach((tk) => {
      if (COLOR_WORDS.includes(tk) && !found.includes(tk)) found.push(tk);
    });
    return found;
  };

  // Patrones razonables de talles/medidas
  const SIZE_RE = new RegExp(
    [
      "\\b(xs|s|m|l|xl|xxl|xxxl|x small|small|medium|large|x large|xx large|3 x large|4 x large)\\b",
      "\\btalle\\s*\\d{1,3}\\b", // "talle 40"
      "\\b\\d{1,3}\\s*(cm|mm|mts|m)\\b", // "19 cm", "200 mm"
      "\\b\\d{2,4}\\s*(ml|lts|l|oz)\\b", // "500 ml", "1 l", "12 oz"
      "\\b\\d{1,2}\\s*-\\s*\\d{1,2}\\b", // "39-42"
    ].join("|"),
    "i"
  );

  // Parseo robusto desde ED1/ED2/ED3 para Zecat
  const parseZecatVariant = (v) => {
    const ed1 = normText(v?.elementDescription1);
    const ed2 = normText(v?.elementDescription2);
    const ed3 = normText(v?.elementDescription3);
    const n1 = normKey(ed1),
      n2 = normKey(ed2),
      n3 = normKey(ed3);

    // Colores: unión de coincidencias en los tres campos
    const colParts = [
      ...new Set([
        ...pickColorsFrom(n1),
        ...pickColorsFrom(n2),
        ...pickColorsFrom(n3),
      ]),
    ];
    const colorParsed = colParts
      .map((w) => w.replace(/\b\w/g, (m) => m.toUpperCase())) // capitalizar
      .join(" / ");

    // Talle/medida: primer match claro en cualquiera
    const sizeMatch =
      (n1.match(SIZE_RE) && n1.match(SIZE_RE)[0]) ||
      (n2.match(SIZE_RE) && n2.match(SIZE_RE)[0]) ||
      (n3.match(SIZE_RE) && n3.match(SIZE_RE)[0]) ||
      ""; // si nada, vacío

    // Si no encontramos size pero un campo NO parece color y parece ser talla, úsalo crudo
    const fallbackSize =
      !colorParsed && SIZE_RE.test(n1)
        ? ed1
        : !colorParsed && SIZE_RE.test(n2)
        ? ed2
        : !colorParsed && SIZE_RE.test(n3)
        ? ed3
        : "";

    const sizeParsed = sizeMatch || fallbackSize || "";
    return { colorParsed, sizeParsed };
  };

  // Variantes normalizadas: para Brandcaps usamos color/size; para Zecat usamos parseo EDx
  const normalizedVariants = useMemo(() => {
    const base = brandcapsProduct
      ? producto?.products ?? []
      : producto?.variants ?? [];
    if (brandcapsProduct) return base;
    return (base || []).map((v) => {
      const { colorParsed, sizeParsed } = parseZecatVariant(v);
      return { ...v, colorParsed, sizeParsed };
    });
  }, [brandcapsProduct, producto?.products, producto?.variants]);

  // Lectores unificados
  const getColor = (v) =>
    brandcapsProduct ? normText(v?.color) : normText(v?.colorParsed);
  const getSize = (v) =>
    brandcapsProduct ? normText(v?.size) : normText(v?.sizeParsed);
  const rawVariants = normalizedVariants; // ya viene parseado para Zecat

  // tratar valores "no talle" o que son en realidad un color
  const normalizeSizeValue = (s) => {
    const t = normKey(s);
    if (!t || t === "-" || t === "—") return "";
    if (
      [
        "X small",
        "Small",
        "Medium",
        "Large",
        "X Large",
        "XX Large",
        "3 X Large",
        "4 X Large",
        "2 X Large",
      ].includes(t)
    )
      return "";
    if (isLikelyColor(t)) return ""; // si por error vino color, lo sacamos
    return s;
  };

  // — helpers para ocultar LOGO 24 y limpiar textos —
  const _normalize = (s = "") =>
    s
      .toString()
      .trim()
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "");
  const _slugify = (s = "") =>
    _normalize(s)
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");

  const hideLogo24 = (txt = "") => {
    const n = _normalize(txt);
    const sl = _slugify(txt);
    return (
      n.includes("logo 24") ||
      n.includes("logo24") ||
      /logueo\s*en\s*24/.test(n) ||
      sl === "logo-24" ||
      sl === "logo-24hs" ||
      sl === "logo24" ||
      sl.startsWith("logo-24")
    );
  };

  const cleanText = (t = "") =>
    t
      .split(/\r?\n/)
      .filter((line) => !hideLogo24(line))
      .join("\n");

  // Set de colores conocidos = (colores de variantes) + una lista base
  const knownColorSet = useMemo(() => {
    const set = new Set();
    (rawVariants || []).forEach((v) => {
      const c = normKey(getColor(v));
      if (c) set.add(c);
    });
    // fallback común en español
    [
      "blanco",
      "negro",
      "rojo",
      "azul",
      "verde",
      "amarillo",
      "gris",
      "plateado",
      "plata",
      "dorado",
      "oro",
      "marron",
      "cafe",
      "beige",
      "violeta",
      "morado",
      "rosa",
      "fucsia",
      "celeste",
      "turquesa",
      "naranja",
      "transparente",
      "transp",
      "grafito",
      "natural",
      "kaki",
    ].forEach((c) => set.add(c));
    return set;
  }, [rawVariants, brandcapsProduct, getColor, normKey]); // getColor depende de brandcapsProduct

  // pool actual (todas o filtradas por color seleccionado)
  const currentPool = useMemo(() => {
    if (!selColor?.color) return rawVariants || [];
    return (rawVariants || []).filter((v) => getColor(v) === selColor.color);
  }, [rawVariants, selColor, getColor]);

  const isLikelyColor = (val) => {
    const n = normKey(val);
    if (!n) return false;
    if (knownColorSet.has(n)) return true;
    // Maneja combos tipo "blanco/negro", "blanco - negro", etc.
    return n.split(/[\/,\-+,; ]+/).some((tok) => knownColorSet.has(tok));
  };

  // ¿todas/alguna variante es acromática?
  const isAchromaticGlobal = useMemo(() => {
    return (
      Array.isArray(rawVariants) &&
      rawVariants.length > 0 &&
      rawVariants.every((v) => !!v?.achromatic)
    );
  }, [rawVariants]);

  // mapa color -> ¿todas las variantes de ese color son acromáticas?
  const colorAchromaticMap = useMemo(() => {
    const m = new Map();
    const byColor = new Map();
    for (const v of rawVariants || []) {
      const c = getColor(v) || "__no_color__";
      if (!byColor.has(c)) byColor.set(c, []);
      byColor.get(c).push(v);
    }
    for (const [c, arr] of byColor) {
      m.set(c, arr.length > 0 && arr.every((v) => !!v?.achromatic));
    }
    return m;
  }, [rawVariants, getColor]);

  // acromático actual (global o por el color seleccionado)
  const isAchromaticCurrent = useMemo(() => {
    if (isAchromaticGlobal) return true;
    if (!selColor) return false;
    return !!colorAchromaticMap.get(selColor.color || "__no_color__");
  }, [isAchromaticGlobal, colorAchromaticMap, selColor]);

  // Listas unificadas de colores y talles (sin duplicados), agregando stock total
  const colorOptions = useMemo(() => {
    const m = new Map();
    for (const v of rawVariants || []) {
      const c = getColor(v);
      if (!c) continue;

      const base = !brandcapsProduct
        ? {
            id: `color-${c}`,
            color: c,
            stock: 0,
            elementDescription1: normText(v?.elementDescription1),
            elementDescription2: normText(v?.elementDescription2),
            elementDescription3: normText(v?.elementDescription3),
          }
        : { id: `color-${c}`, color: c, stock: 0 };

      const prev = m.get(c) || base;
      prev.stock += Number(v?.stock ?? 0);
      // completa EDx si estaban vacías
      if (!brandcapsProduct) {
        prev.elementDescription1 ||= normText(v?.elementDescription1);
        prev.elementDescription2 ||= normText(v?.elementDescription2);
        prev.elementDescription3 ||= normText(v?.elementDescription3);
      }
      m.set(c, prev);
    }
    return [...m.values()];
  }, [rawVariants, brandcapsProduct, getColor]);

  const sizeOptions = useMemo(() => {
    const m = new Map();
    for (const v of currentPool) {
      const s = normalizeSizeValue(getSize(v)); // <- ya filtra colores/único/etc.
      if (!s) continue;
      const prev = m.get(s) || { id: `size-${s}`, size: s, stock: 0 };
      prev.stock += Number(v?.stock ?? 0);
      m.set(s, prev);
    }
    return [...m.values()];
  }, [currentPool, getSize, normalizeSizeValue]);

  // Preseleccionar la primera opción disponible cuando cambian las listas
  useEffect(() => {
    setSelColor((prev) =>
      prev && colorOptions.find((o) => o.color === prev.color)
        ? prev
        : colorOptions[0] || null
    );
  }, [colorOptions]);
  useEffect(() => {
    setSelSize((prev) =>
      prev && sizeOptions.find((o) => o.size === prev.size)
        ? prev
        : sizeOptions[0] || null
    );
  }, [sizeOptions]);

  // Buscar la variante concreta que matchea color+talle (si existen)
  useEffect(() => {
    const found = (rawVariants || []).find((v) => {
      const cOk =
        !selColor || !selColor.color || getColor(v) === selColor.color;
      const sOk = isAchromaticCurrent
        ? true
        : !selSize || !selSize.size || getSize(v) === selSize.size;
      return cOk && sOk;
    });
    setVariant(found || null);
  }, [rawVariants, selColor, selSize, isAchromaticCurrent, getColor, getSize]);

  const minimumOrder = Number(producto.minimum_order_quantity ?? 1);

  // Cantidad (string libre) + derivado numérico
  const [qtyStr, setQtyStr] = useState(String(minimumOrder));
  useEffect(() => {
    setQtyStr(String(minimumOrder));
  }, [minimumOrder]);

  const qtyNum = Number.parseInt(qtyStr, 10);

  const handleQtyChange = (e) => {
    const v = e.target.value;
    // permite borrar y tipear libre, solo dígitos
    if (/^\d*$/.test(v)) setQtyStr(v);
  };
  const handleQtyBlur = () => {
    const n = Number.parseInt(qtyStr, 10);
    if (!Number.isFinite(n) || n <= 0) {
      setQtyStr("1");
    }
  };

  // Tiers / márgen
  const tiers = producto?.priceTiers ?? [];
  const margin = Number(producto?.marginPercentage ?? 0);

  const sortedTiers = useMemo(
    () => [...tiers].sort((a, b) => (a.min ?? 0) - (b.min ?? 0)),
    [tiers]
  );

  const activeIdx = useMemo(() => {
    if (!Number.isFinite(qtyNum) || !sortedTiers.length) return -1;
    // si piden menos que el primer mínimo, resaltamos el primer tramo
    if (qtyNum < (sortedTiers[0]?.min ?? 0)) return 0;
    const idx = sortedTiers.findIndex(
      (t) => qtyNum >= (t.min ?? 0) && (t.max == null || qtyNum <= t.max)
    );
    if (idx !== -1) return idx;
    return qtyNum > (sortedTiers.at(-1)?.max ?? Infinity)
      ? sortedTiers.length - 1
      : 0;
  }, [sortedTiers, qtyNum]);

  const price = producto.price;

  const unitPrice = useMemo(
    () =>
      activeIdx >= 0 ? Number(sortedTiers[activeIdx]?.price ?? price) : price,
    [activeIdx, sortedTiers, price]
  );

  // const isDisabled =
  //   !variant ||
  //   Number(variant?.stock ?? 0) <= 0 ||
  //   !Number.isFinite(qtyNum) ||
  //   qtyStr === "" ||
  //   qtyNum <= 0;

  // Debe existir una variante válida y cantidad válida
  const needsColor = colorOptions.length > 0;
  //const needsSize = !isAchromaticCurrent && sizeOptions.length > 0;
  const distinctSizesCurrent = useMemo(() => {
    const set = new Set();
    sizeOptions.forEach((o) => set.add(normKey(o.size)));
    return set;
  }, [sizeOptions, normKey]);
  const hasMultipleSizes = distinctSizesCurrent.size > 1;
  const needsSize = !isAchromaticCurrent && hasMultipleSizes;

  const selectionComplete =
    (!needsColor || !!selColor) && (!needsSize || !!selSize) && !!variant;
  const isDisabled =
    !selectionComplete ||
    Number(variant?.stock ?? 0) <= 0 ||
    !Number.isFinite(qtyNum) ||
    qtyStr === "" ||
    qtyNum <= 0;

  const belowMinimum =
    Number.isFinite(qtyNum) && qtyNum > 0 && qtyNum < minimumOrder;

  // Datos varios
  const description = cleanText(producto.description || "Sin descripción");
  const uniq = (arr) => [...new Set(arr)];
  const printingTypes = producto.printing_types?.length
    ? uniq(producto.printing_types.map((py) => py.name))
        .filter(Boolean)
        .join(", ")
    : "No disponible";

  const dims = producto.dimensions || {};
  const altura = dims.height_cm ?? "--";
  const ancho = dims.width_cm ?? "--";
  const largo = dims.length_cm ?? "--";
  const peso = dims.unit_weight_kg ?? "--";
  const empaque = producto.packaging || "—";
  const porCaja = producto.units_per_box ?? "--";
  const infoText =
    producto.supplementary_information_text || "Sin información adicional";
  const sku = producto.sku || null;
  const IVA = 0.21;
  const bruto = Number(producto.basePrice) || 0; // por si viene string o null

  // Si el precio tiene IVA incluido y para los Brandcaps querés mostrar sin IVA:
  const precioBase = brandcapsProduct ? +(bruto / (1 + IVA)).toFixed(2) : bruto;

  const moneyAR = (n) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 2,
    }).format(Number(Math.round(n) || 0));

  const handleAddToCart = () => {
    if (isDisabled) return;

    const Name = (variant, IsBrandcapsProduct) => {
      const parts = [];
      //console.log(v);
      if (IsBrandcapsProduct) {
        if (variant?.color) parts.push(variant.color);
        if (variant?.size) parts.push(variant.size);
        if (variant?.material) parts.push(variant.material);
      } else {
        if (variant?.elementDescription1 != " ")
          parts.push(variant.elementDescription1);
        if (variant?.elementDescription2 != " ")
          parts.push(variant.elementDescription2);
        if (variant?.elementDescription3 != " ")
          parts.push(variant.elementDescription3);
        if (variant?.additionalDescription != " ")
          parts.push(variant.additionalDescription);
      }
      //console.log(parts)
      const uniq = (arr) => [...new Set(arr)];
      const all = uniq(parts.map((p) => p).filter(Boolean));
      return {
        // si la variante no tiene id/sku, concatenamos producto + color + size
        key:
          variant?.id ??
          variant?.sku ??
          `${producto?.id || producto?._id || producto?.sku || "prd"}-${
            getColor(variant) || selColor?.color || ""
          }-${
            isAchromaticCurrent
              ? "no-size"
              : getSize(variant) || selSize?.size || ""
          }`,
        label: `${all.filter(Boolean).join(" - ") || "Variante"}`,
      };
    };

    // Normalizamos imágenes: array => ok, string "image" => [{url}], main_image_url => [{url}]
    const images =
      (Array.isArray(producto.images) &&
        producto.images.length > 0 &&
        producto.images) ||
      (producto.image ? [{ url: producto.image }] : null) ||
      (producto.main_image_url ? [{ url: producto.main_image_url }] : []);

    // console.log(images);

    // Elegimos la principal
    const imgData =
      images.find?.((i) => i.main_integrator) ||
      images.find?.((i) => i.main) ||
      images[0];

    const item = {
      _id: Name(variant, producto.brandcapsProduct).key,
      sku: producto.sku,
      name: `${producto.name} – ${
        Name(variant, producto.brandcapsProduct).label
      }`,
      price: unitPrice, // unitario ya calculado por el tramo
      images: imgData || [],
      variant: {
        ...variant,
        // aseguramos que viajen color/size seleccionados
        color: getColor(variant) || selColor?.color || null,
        size: getSize(variant) || selSize?.size || null,
      },
      qty: qtyNum, // 👈 también dentro del objeto
      belowMinimum, // 👈 marca para el carrito/checkout
      pricingNote: belowMinimum
        ? "Precio unitario sujeto a revisión por cantidad menor al mínimo."
        : null,
    };

    addToCart(item, qtyNum); // 👈 y además como 2º argumento

    // Toast estilo Mercado Libre
    toast.success({
      title: "Agregado al carrito",
      description: producto.name,
      image: imgData?.url || imgData?.image_url || imgData?.src || "",
      action: { label: "Ir al carrito", href: "/cart" },
      duration: 5000,
    });
  };

  console.debug({
    sizesLen: sizeOptions.length,
    isA_global: isAchromaticGlobal,
    selColor: selColor?.color,
    isA_current: isAchromaticCurrent,
  });

  return (
    <>
      {/* Galería e info básica grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12 */}
      <div className="grid gap-6 lg:grid-cols-2">
        <Head>
          <title>{producto.name}</title>
        </Head>
        <ProductImageGallery images={producto.images || []} />
        <div>
          {sku && <p className="text-gray-400 text-xs">SKU: {sku}</p>}
          <h1 className="text-3xl font-bold mb-2">{producto.name}</h1>
          <p className="text-2xl text-gray-600 font-semibold mb-4">
            {moneyAR(unitPrice)}{" "}
            <span className="text-gray-400 text-sm italic mb-4 font-normal">
              /por unidad
            </span>
          </p>
          <p className="text-gray-400 text-sm italic mb-4">
            Precio sin impuesto: {moneyAR(precioBase)} /por unidad
          </p>
          {belowMinimum && (
            <div className="flex space-x-3 mb-4 border rounded-lg border-yellow-400 p-3 bg-yellow-50">
              <InformationCircleIcon className="text-yellow-600 h-8 mt-0.5" />
              <p className="text-yellow-700 text-xs">
                Estás solicitando menos que el mínimo ({minimumOrder} un.). El
                precio unitario mostrado es
                <strong> orientativo</strong> y puede sufrir ajustes por la
                cantidad seleccionada. Nuestro equipo comercial te confirmará el
                valor final.
              </p>
            </div>
          )}
          <div className="flex justify-items-normal space-x-4 mb-6 border rounded-lg border-blue-400 p-3 bg-gray-100">
            <InformationCircleIcon className="text-blue-600 h-8" />
            <p className="text-blue-600 text-xs">
              El precio ya incluye IVA del {producto.tax}%. Precios unitarios
              expresados en PESOS Argentinos. Todos los pedidos están sujetos a
              disponibilidad de stock. Los precios pueden cambiar sin previo
              aviso.
            </p>
          </div>
          <p className="text-gray-700 mb-6">{description}</p>

          <div className="flex items-center space-x-1 mb-2">
            <p className="text-blue-700 text-sm">
              Compra mínima: {minimumOrder} un.
            </p>
            <InformationCircleIcon className="text-blue-700 h-4" />
          </div>
          <p className="text-gray-400 text-xs italic mb-4">
            *Para compras de mayor o menor volumen consultá con nuestro equipo
            comercial.
          </p>

          {/* Dropdowns unificados */}
          <div className="mb-4 space-y-3">
            {/* Color siempre que haya opciones */}
            {!!colorOptions.length && (
              <VariantSelect
                className="mt-2"
                variants={colorOptions}
                value={selColor}
                onChange={setSelColor}
                label="Color"
                placeholder="Elige un color"
                IsBrandcapsProduct={true}
                opt="color"
                // concatena ED1+ED2+ED3 cuando sea Zecat y estemos en modo acromático
                achromaticMode={isAchromaticCurrent && !brandcapsProduct}
              />
            )}

            {/* Talle solo si no es acromático para el color actual */}
            {needsSize && (
              <VariantSelect
                className="mt-2"
                variants={sizeOptions}
                value={selSize}
                onChange={setSelSize}
                label="Talle / Medida"
                placeholder="Elige un talle/medida"
                IsBrandcapsProduct={true}
                opt="size"
              />
            )}
          </div>

          {/* Cantidad + CTA */}
          <div className="flex items-center space-x-4 mb-4">
            <label className="font-medium">Cantidad:</label>
            <input
              type="text"
              inputMode="numeric"
              pattern="[0-9]*"
              value={qtyStr}
              onChange={handleQtyChange}
              onBlur={handleQtyBlur}
              className="w-20 border rounded p-1 text-center"
            />

            <button
              onClick={handleAddToCart}
              disabled={isDisabled}
              className="bg-black hover:bg-gray-700 text-white px-3 py-2 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              AÑADIR A COTIZACIÓN
            </button>

            <span className="text-sm text-gray-600">
              Stock: {Number(variant?.stock ?? 0).toLocaleString("es-AR")} un.
            </span>
          </div>
        </div>
      </div>

      {/* Tabla de precios por escala */}
      <div className="mt-6">
        <PriceTiersTable tiers={sortedTiers} margin={margin} qty={qtyNum} />
      </div>

      {/* Detalles ampliados */}
      <div className="max-w-7xl mx-auto px-4 space-y-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Columna izquierda */}
          <div>
            <h2 className="text-xl font-semibold mb-4">Detalle del producto</h2>
            <p className="text-gray-800 mb-6">{description}</p>

            <h3 className="text-lg font-medium mb-2">Tipos de impresión</h3>
            <p className="text-gray-700 mb-6">{printingTypes}</p>

            <h3 className="text-lg font-medium mb-2">Dimensiones</h3>
            <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-8 gap-y-4 text-gray-700">
              <div>
                <dt className="font-medium">Altura:</dt>
                <dd>{altura} cm</dd>
              </div>
              <div>
                <dt className="font-medium">Longitud:</dt>
                <dd>{largo} cm</dd>
              </div>
              <div>
                <dt className="font-medium">Ancho:</dt>
                <dd>{ancho} cm</dd>
              </div>
              <div>
                <dt className="font-medium">Peso unidad:</dt>
                <dd>{peso} kg</dd>
              </div>
              <div>
                <dt className="font-medium">Empaque:</dt>
                <dd>{empaque}</dd>
              </div>
              <div>
                <dt className="font-medium">Unidades por caja:</dt>
                <dd>{porCaja}</dd>
              </div>
            </dl>
          </div>

          {/* Columna derecha */}
          <div>
            <h2 className="text-xl font-semibold mb-4">
              Información complementaria
            </h2>
            {infoText ? (
              <p className="text-gray-800">{infoText}</p>
            ) : (
              <p className="text-gray-700">Sin información adicional</p>
            )}
          </div>
        </div>

        {/* Productos relacionados */}
        <RelatedProductsCarousel productos={producto.related_products || []} />
      </div>
    </>
  );
}
