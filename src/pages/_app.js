import "../styles/globals.css";
import { AuthProvider } from "../context/AuthContext";
import { CartProvider } from "../context/CartContext";
import { ToastProvider } from "@/components/Toast";
import RouteSpinner from "@/components/RouteSpinner";
import Head from "next/head";

export default function MyApp({ Component, pageProps }) {
  return (
    <AuthProvider>
      <CartProvider>
        <ToastProvider>
          <Head>
            <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
            <link rel="icon" href="/favicon.ico" sizes="any" />
            <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
            <meta name="theme-color" content="#000000" />
          </Head>
          <RouteSpinner text="Cargando…" />
          <Component {...pageProps} />
        </ToastProvider>
      </CartProvider>
    </AuthProvider>
  );
}
