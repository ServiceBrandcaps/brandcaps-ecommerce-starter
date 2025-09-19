// components/ProductCard.js
"use client";
import React, { useMemo, useState } from "react";
import Link from "next/link";
import { useToast } from "@/components/Toast";
import { useCart } from "../context/CartContext";
import { ChevronDownIcon } from "@heroicons/react/24/solid";

export default function ProductCard({ product: p, producto, variant = "default" }) {
  const compact = variant === "compact";
  const { addToCart } = useCart();
  const toast = useToast();
  const [showStock, setShowStock] = useState(false);

  const product = p || producto;
  if (!product) return null;

  const id = product._id || product.id;
  const name = product.name || product.title || "Producto";
  const minimumOrder = Number(product?.minimum_order_quantity ?? 1);

  const images = Array.isArray(product.images) ? product.images : [];
  const imgData = images.find?.(i => i.main_integrator) || images.find?.(i => i.main) || images[0];
  const imgUrl = imgData?.url || imgData?.image_url || imgData?.src || "";

  const providerItems = product.products ?? [];
  const variants = product.variants ?? [];

  const chosenVariant = useMemo(() => {
    const v = variants?.[0] || null;
    if (v) return v;
    const it = providerItems?.[0] || null;
    return it
      ? { id: it.id || it.sku, sku: it.sku, stock: it.stock, color: it.color || "", size: it.size || "", material: it.material || "", achromatic: !!it.achromatic }
      : null;
  }, [variants, providerItems]);

  const stockShown = providerItems?.[0]?.stock ?? chosenVariant?.stock ?? null;

  const price = Number(product.salePrice ?? product.price ?? product.basePrice ?? 0);
  const moneyAR = (n) => new Intl.NumberFormat("es-AR", { style: "currency", currency: "ARS", maximumFractionDigits: 2 }).format(Number(n || 0));

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
        pricingNote: belowMinimum ? "Precio unitario sujeto a revisión por cantidad menor al mínimo." : null,
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
    <div className={`bg-white rounded-xl border hover:shadow-lg transition overflow-hidden flex flex-col ${compact ? "w-[250px]" : ""} ${compact ? "h-[400px]" : ""}`}>
      <Link href={`/product/${id}`} className="block">
        {/* ⬇️ aspecto compacto en relacionados */}
        <div className={`${compact ? "aspect-square" : "aspect-[4/5]"} bg-gray-50 grid place-items-center`}>
          {imgUrl ? (
            <img src={imgUrl} alt={name} className="h-full w-full object-contain" loading="lazy" />
          ) : (
            <div className="h-full w-full bg-gray-200" />
          )}
        </div>

        <div className={`p-3 ${compact ? "space-y-1" : "sm:p-4 space-y-1.5"}`}>
          <h3 className={`font-medium text-gray-900 line-clamp-2 ${compact ? "text-[13px]" : "text-sm sm:text-base"}`}>{name}</h3>
          {!!product.families?.[0]?.title && (
            <p className={`text-gray-500 ${compact ? "text-[11px]" : "text-xs sm:text-sm"}`}>{product.families[0].title}</p>
          )}
          <p className={`font-semibold text-gray-900 ${compact ? "text-sm" : "text-base sm:text-lg"}`}>{moneyAR(price)}</p>

          {/* En compacto ocultamos el bloque de stock para achicar altura */}
          {!compact && (
            <>
              <button
                onClick={(e) => { e.preventDefault(); setShowStock((v) => !v); }}
                aria-expanded={showStock}
                className="w-full flex justify-between items-center text-xs sm:text-sm text-gray-700 border-t pt-2"
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

      <div className={`p-3 ${compact ? "" : "sm:p-4 pt-0"}`}>
        <button onClick={handleAddToCart} className={`w-full rounded-lg bg-black hover:bg-gray-800 text-white ${compact ? "py-1.5 text-xs" : "py-2 text-sm"} font-medium transition`}>
          Agregar al carrito
        </button>
      </div>
    </div>
  );
}
