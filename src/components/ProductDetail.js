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
  const { addToCart } = useCart();
  const toast = useToast();
  const brandcapsProduct = producto?.brandcapsProduct ?? false;
  // Variantes y mínimos
  const variants = brandcapsProduct
    ? producto?.products ?? []
    : producto?.variants ?? [];
  const [variant, setVariant] = useState(variants[0] ?? null);

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

  const isDisabled =
    !variant ||
    Number(variant?.stock ?? 0) <= 0 ||
    !Number.isFinite(qtyNum) ||
    qtyStr === "" ||
    qtyNum <= 0;

  const belowMinimum =
    Number.isFinite(qtyNum) && qtyNum > 0 && qtyNum < minimumOrder;

  // Datos varios
  const description = producto.description || "Sin descripción";
  const printingTypes = producto.printing_types?.length
    ?  producto.printing_types.map((py) => py.description).join(", ")
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
        key: variant?.id ?? variant?.sku ?? idx,
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
    const imgData = //product?.images || product?.image;
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
      variant,
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

  return (
    <>
      {/* Galería e info básica */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
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
            Precio sin impuesto: {moneyAR(producto.basePrice)} /por unidad
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

          {!!variants.length && (
            <div className="mb-4">
              <VariantSelect
                className="mt-2"
                variants={variants}
                value={variant}
                onChange={setVariant}
                label="Color / Variante"
                placeholder="Elige una opción"
                IsBrandcapsProduct={brandcapsProduct}
              />
            </div>
          )}

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
              Stock: {variant?.stock ?? 0} un.
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
