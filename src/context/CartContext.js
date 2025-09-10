// context/CartContext.js
import React, { createContext, useContext, useState, useEffect } from "react";

const CartContext = createContext();

export function CartProvider({ children }) {
  const [cart, setCart] = useState([]);

  // Cargar carrito de localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    const stored = localStorage.getItem("cart");
    if (stored) {
      try {
        setCart(JSON.parse(stored));
      } catch {
        localStorage.removeItem("cart");
      }
    }
  }, []);

  // Guardar en localStorage
  useEffect(() => {
    if (typeof window === "undefined") return;
    localStorage.setItem("cart", JSON.stringify(cart));
  }, [cart]);

  const clearCart = () => {
    setCart([]);
    if (typeof window !== "undefined") {
      try {
        // ajustá la key si usás otra
        localStorage.setItem("cart", JSON.stringify([]));
      } catch {}
    }
  };

  const addToCart = (productOrItem, maybeQty) => {
    const qty = Number.isFinite(maybeQty)
      ? Number(maybeQty)
      : Number(productOrItem?.qty ?? 1);

    const product = { ...productOrItem, qty };

    setCart((prev) => [...prev, product]);
  };

  const removeFromCart = (id) => {
    setCart((prev) => prev.filter((item) => item.id !== id));
  };

  const total = cart.reduce(
    (sum, item) => sum + (item.price ?? item.unit_price ?? 0) * (item.qty ?? 1),
    0
  );

  return (
    <CartContext.Provider value={{ cart, addToCart, removeFromCart, clearCart, total }}>
      {children}
    </CartContext.Provider>
  );
}

export function useCart() {
  const context = useContext(CartContext);
  if (!context)
    throw new Error("useCart debe usarse dentro de un CartProvider");
  return context;
}
