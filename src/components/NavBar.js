"use client";

import Link from "next/link";
import { useState } from "react";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import CategoriesMenu from "@/components/CategoriesMenu";
import MobileCategories from "@/components/MobileCategories";
import SearchBar from "@/components/SearchBar";

export default function NavBar() {
  const [catOpen, setCatOpen] = useState(false);
  const { cart } = useCart();
  const { usuario, rol, logout } = useAuth();
  const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL;

  // helper simple para el link de login (interno/externo)
  const LoginLink = () =>
    adminUrl ? (
      <Link href={adminUrl} className="hover:underline">Ingresar</Link>
    ) : (
      <Link href="/login" className="hover:underline">Ingresar</Link>
    );

  return (
    <header className="sticky top-0 left-0 z-50 w-full bg-black text-white">
      <div className="max-w-7xl mx-auto px-3 sm:px-4">
        {/* Fila principal */}
        <div className="py-2 sm:py-3 flex items-center gap-2">
          {/* Hamburguesa (solo mobile) */}
          <button
            className="md:hidden p-2 -ml-1"
            aria-label="Menú categorías"
            onClick={() => setCatOpen(true)}
          >
            ☰
          </button>

          {/* Logo + Categorías (desktop: categorías debajo) */}
          <div className="flex flex-col items-start gap-2 min-w-[140px]">
            <Link href="/">
              <img src="/jnc.png" alt="Logo" className="w-16 h-16 sm:w-20 sm:h-20" />
            </Link>
            <CategoriesMenu className="hidden md:inline-flex -ml-1" />
          </div>

          {/* Buscador (solo desktop en esta fila) */}
          <div className="hidden md:flex relative flex-1 max-w-2xl mx-4">
            <svg
              className="w-5 h-5 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              xmlns="http://www.w3.org/2000/svg"
              fill="none" viewBox="0 0 24 24" stroke="currentColor"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z" />
            </svg>
            <div className="flex-1"><SearchBar /></div>
          </div>

          {/* Acciones derecha */}
          <nav className="ml-auto flex items-center gap-4 sm:gap-6 text-sm font-medium">
            {usuario ? (
              <>
                <span className="hidden sm:inline">Hola, {usuario}</span>
                {rol === "admin" && (
                  <Link href="/admin" className="hover:underline">Panel Admin</Link>
                )}
                {rol === "cliente" && (
                  <Link href="/cuenta" className="hover:underline">Mi cuenta</Link>
                )}
                <button onClick={logout} className="text-red-100 hover:underline">
                  Cerrar sesión
                </button>
              </>
            ) : (
              <LoginLink />
            )}
            <Link href="/cart" className="hover:underline">
              🛒 Carrito ({cart.length})
            </Link>
          </nav>
        </div>

        {/* Buscador (mobile: va debajo de la fila principal) */}
        <div className="md:hidden pb-3">
          <SearchBar />
        </div>
      </div>

      {/* Drawer categorías mobile */}
      <MobileCategories open={catOpen} onClose={() => setCatOpen(false)} />
    </header>
  );
}
