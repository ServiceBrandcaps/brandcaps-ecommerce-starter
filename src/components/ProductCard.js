// components/ProductCard.js
"use client";

import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useToast } from "@/components/Toast";
import { useCart } from "../context/CartContext";
import { ChevronDownIcon } from "@heroicons/react/24/solid";

export default function ProductCard({ product: p, producto, variant = "default" }) {
  const compact = variant === "compact";

  // Hooks SIEMPRE arriba y sin condiciones
  const { addToCart } = useCart();
  const toast = useToast();
  const [showStock, setShowStock] = useState(false);

  // Nunca retornamos antes de los hooks: usamos default {}
  const product = p || producto || {};
  const hasProduct = Boolean(product?._id || product?.id || product?.sku || product?.name);

  const id = product._id || product.id || product.sku || "unknown";
  const name = product.name || product.title || product.sku || "Producto";
  const minimumOrder = Number(product?.minimum_order_quantity ?? 1);

  const images = Array.isArray(product.images) ? product.images : [];
  const imgData =
    images.find?.(i => i.main_integrator) ||
    images.find?.(i => i.main) ||
    images[0];
  const imgUrl = imgData?.url || imgData?.image_url || imgData?.src || "";

  const providerItems = Array.isArray(product.products) ? product.products : [];
  const variants = Array.isArray(product.variants) ? product.variants : [];

  const sStock = useMemo(() => {
    let s = 0;
    providerItems.forEach(i => {
      s = s + i.stock
    });
    return s ? s : 0;
  }, [providerItems]);

  // Hook estable (no condicional)
  const chosenVariant = useMemo(() => {
    const v = variants[0];
    if (v) return v;
    const it = providerItems[0];
    return it
      ? {
          id: it.id || it.sku,
          sku: it.sku,
          stock: it.stock,
          color: it.color || "",
          size: it.size || "",
          material: it.material || "",
          achromatic: !!it.achromatic,
        }
      : null;
  }, [variants, providerItems]);

  // A partir de acá, si no hay data suficiente, cortamos
  if (!hasProduct) return null;

  const stockShown = sStock ?? providerItems?.[0]?.stock ?? chosenVariant?.stock ?? null;

  const price = Number(product.salePrice ?? product.price ?? product.basePrice ?? 0);
  const moneyAR = (n) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 2,
    }).format(Number(n || 0));

  const qtyNum = 1;
  const belowMinimum = qtyNum > 0 && qtyNum < minimumOrder;

  const handleAddToCart = () => {
    addToCart(
      {
        _id: chosenVariant?.id || id,
        sku: chosenVariant?.sku || product.sku,
        name,
        price,
        images: imgData ? [imgData] : [],
        variant: chosenVariant || undefined,
        qty: qtyNum,
        belowMinimum,
        pricingNote: belowMinimum
          ? "Precio unitario sujeto a revisión por cantidad menor al mínimo."
          : null,
      },
      qtyNum
    );

    toast.success({
      title: "Agregado al carrito",
      description: name,
      image: imgUrl,
      action: { label: "Ir al carrito", href: "/cart" },
      duration: 5000,
    });
  };

  return (
<div
  className={`bg-white rounded-xl border hover:shadow-lg transition overflow-hidden flex flex-col ${compact ?  "w-[250px] h-[400px]": "max-w-[320px] w-full mx-auto"}`}
>
  <Link href={`/product/${id}`} className="flex-1 flex flex-col">
    <div className={`${compact ? "aspect-square" : "aspect-[4/5]"} max-h-72 bg-gray-50 grid place-items-center`}>
      {imgUrl ? (
        <img
          src={imgUrl}
          alt={name}
          className="h-full w-full object-contain"
          loading="lazy"
        />
      ) : (
        <div className="h-full w-full bg-gray-200" />
      )}
    </div>

    <div className={`p-3 flex-1 flex flex-col ${compact ? "space-y-1" : "sm:p-4 space-y-1.5"}`}>
      <h3 className={`font-medium text-gray-900 line-clamp-2 ${compact ? "text-[13px]" : "text-sm sm:text-base"}`}>
        {name}
      </h3>
      {!!product.families?.[0]?.title && (
        <p className={`text-gray-500 ${compact ? "text-[11px]" : "text-xs sm:text-sm"}`}>
          {product.families[0].title}
        </p>
      )}
      <p className={`font-semibold text-gray-900 ${compact ? "text-sm" : "text-base sm:text-lg"}`}>
        {moneyAR(price)}
      </p>

      {!compact && (
        <>
          <button
            onClick={(e) => {
              e.preventDefault();
              setShowStock((v) => !v);
            }}
            aria-expanded={showStock}
            className="w-full flex justify-between items-center text-xs sm:text-sm text-gray-700 border-t pt-2 mt-auto"
          >
            <span>Stock online</span>
            <span className="flex items-center">
              {Number.isFinite(stockShown) ? `${stockShown.toLocaleString()} un.` : "—"}
              <ChevronDownIcon className={`w-4 h-4 ml-1 transform transition-transform ${showStock ? "rotate-180" : ""}`} />
            </span>
          </button>
          {showStock && <div className="text-xs text-gray-600">Cantidad sujeta a cambios sin previo aviso.</div>}
        </>
      )}
    </div>
  </Link>

  {/* Este bloque queda siempre abajo */}
  <div className={`p-3 ${compact ? "" : "sm:p-4 pt-0"} mt-auto`}>
    <button
      onClick={handleAddToCart}
      className={`w-full rounded-lg bg-black hover:bg-gray-800 text-white ${compact ? "py-1.5 text-xs" : "py-2 text-sm"} font-medium transition`}
    >
      Agregar al carrito
    </button>
  </div>
</div>
  );
}
