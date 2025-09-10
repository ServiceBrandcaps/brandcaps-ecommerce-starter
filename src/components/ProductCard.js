// components/ProductCard.js
import React, { useState } from "react";
import Link from "next/link";
import { useToast } from "@/components/Toast";
import { useCart } from "../context/CartContext";
import { ChevronDownIcon } from "@heroicons/react/24/solid";

export default function ProductCard({ product: p, producto }) {
  const { addToCart } = useCart();
  const toast = useToast();
  const [showStock, setShowStock] = useState(false);
  //console.log(p);
  //console.log(producto);
  // Soportar ambas props (por si la grilla aún envía "producto")
  const product = p || producto;
  if (!product) return null;
  const minimumOrder = Number(product?.minimum_order_quantity ?? 1);
  //console.log(product);
  // Normalizamos imágenes: array => ok, string "image" => [{url}], main_image_url => [{url}]
  const images =
    (Array.isArray(product.images) &&
      product.images.length > 0 &&
      product.images) ||
    (product.image ? [{ url: product.image }] : null) ||
    (product.main_image_url ? [{ url: product.main_image_url }] : []);

  // console.log(images);

  // Elegimos la principal
  const imgData = //product?.images || product?.image;
    images.find?.((i) => i.main_integrator) ||
    images.find?.((i) => i.main) ||
    images[0];
  //console.log(imgData);

  const imgUrl = imgData?.url || imgData?.image_url || imgData?.src || "";

  const id = product._id || product.id;
  const name = product.name || product.title || "Producto";
  const price = product.salePrice ?? product.price ?? 0;
  const families = product.families ?? [];
  const products = product.products ?? [];

  const moneyAR = (n) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 2,
    }).format(Number(Math.round(n) || 0));

  const qtyNum = 1;
  const belowMinimum =
    Number.isFinite(qtyNum) && qtyNum > 0 && qtyNum < minimumOrder;

  const handleAddToCart = () => {
    //if (isDisabled) return;

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

    const item = {
      _id: Name(product.variants[0], product.brandcapsProduct).key,
      sku: product.sku,
      name: `${product.name} – ${
        Name(product.variants[0], product.brandcapsProduct).label
      }`,
      price: price, // unitario ya calculado por el tramo
      images: imgData || [],
      variant: product.variants[0],
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
      description: product.name,
      image: imgData?.url || imgData?.image_url || imgData?.src || "",
      action: { label: "Ir al carrito", href: "/cart" },
      duration: 5000,
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden relative w-[250px] h-[380px]">
      {/* Envolvemos imagen y detalles en un Link clickeable */}
      <Link href={`/product/${id}`} className="block h-full">
        {/* Imagen */}
        <div className="h-48 flex items-center justify-center bg-gray-50">
          {imgUrl ? (
            <img
              src={imgUrl}
              alt={name}
              className="max-h-full object-contain"
            />
          ) : (
            <div className="w-full h-48 bg-gray-200" />
          )}
        </div>

        {/* Contenido */}
        <div className="p-4 space-y-2">
          <h3 className="text-lg font-medium text-gray-900 truncate">{name}</h3>
          <p className="text-sm text-gray-500">
            {families?.[0]?.title || "Sin categoría"}
          </p>
          <p className="text-xl font-bold text-gray-900">{moneyAR(price)}</p>

          {/* Stock toggle */}
          <button
            onClick={(e) => {
              e.preventDefault();
              setShowStock((v) => !v);
            }}
            className="w-full flex justify-between items-center text-sm text-gray-700 border-t pt-2"
          >
            <span>Stock online</span>
            <span className="flex items-center">
              {products?.[0]?.stock?.toLocaleString() || "—"} un.
              <ChevronDownIcon
                className={`w-4 h-4 ml-1 transform transition-transform ${
                  showStock ? "rotate-180" : ""
                }`}
              />
            </span>
          </button>
        </div>
      </Link>

      {/* Botón circular carrito */}
      <button
        onClick={handleAddToCart}
        className="absolute top-3 right-3 bg-black hover:bg-gray-700 text-white p-2 rounded-full shadow-lg focus:outline-none cursor-pointer transition-transform transform hover:scale-110"
      >
        <svg
          className="w-5 h-5"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13l-1.6 8M17 13l1.6 8"
          />
          <circle cx="9" cy="21" r="1" />
          <circle cx="20" cy="21" r="1" />
        </svg>
      </button>
    </div>
  );
}
