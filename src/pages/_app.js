import "../styles/globals.css";
import { AuthProvider } from "../context/AuthContext";
import { CartProvider } from "../context/CartContext";
import { ToastProvider } from "@/components/Toast";

export default function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <CartProvider>
        <ToastProvider>
          <Component {...pageProps} />
        </ToastProvider>
      </CartProvider>
    </AuthProvider>
  );
}
