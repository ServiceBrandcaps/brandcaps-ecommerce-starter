import Link from "next/link";
import { useCart } from "../context/CartContext";
import { useAuth } from "../context/AuthContext";
import SearchBar from '@/components/SearchBar'

export default function NavBar() {
  const { cart } = useCart();
  const { usuario, rol, logout } = useAuth();
  const adminUrl = process.env.NEXT_PUBLIC_ADMIN_URL;

  return (
    <header className="top-0 left-0 w-full bg-black p-4 text-white z-50">
      <div className="max-w-7xl mx-auto flex items-center">
        <Link href="/">
          <span className="text-2xl font-bold hover:underline cursor-pointer">
            <img
              src="/jnc.png"
              alt="Logo"
              className="inline-block w-20 h-20 mr-2"
            />
          </span>
        </Link>

        {/* Buscador con borde redondeado e icono */}
        <div className="relative w-[500px] mx-auto">
          {/* Icono de lupa */}
          <svg
            className="w-5 h-5 text-gray-500 absolute left-3 top-1/2 transform -translate-y-1/2 pointer-events-none"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M21 21l-4.35-4.35M17 11a6 6 0 11-12 0 6 6 0 0112 0z"
            />
          </svg>
          {/* Input con padding para el icono y borde redondeado */}
        <SearchBar/>
        </div>

        {/* Enlaces de usuario/carrito */}
        <div className="flex gap-6 items-center text-sm font-medium">
          {usuario ? (
            <>
              <span>Hola, {usuario}</span>

              {rol === "admin" && (
                <Link href="/admin" className="hover:underline">
                  Panel Admin
                </Link>
              )}
              {rol === "cliente" && (
                <Link href="/cuenta" className="hover:underline">
                  Mi cuenta
                </Link>
              )}

              <button onClick={logout} className="text-red-100 hover:underline">
                Cerrar sesión
              </button>
            </>
          ) : (
            // <Link href={adminUrl} className="hover:underline">
            //   Registrarse
            // </Link>
            
            <Link href={adminUrl} className="hover:underline">
              Ingresar
            </Link>
          )}

          <Link href="/cart" className="hover:underline">
            🛒 Carrito ({cart.length})
          </Link>
        </div>
      </div>
    </header>
  );
}
