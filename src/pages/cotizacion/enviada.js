// pages/cotizacion/enviada.js
import Head from "next/head";
import Link from "next/link";
import NavBar from "@/components/NavBar";
import Footer from "@/components/Footer";

export default function CotizacionEnviada() {
  return (
    <>
      <Head>
        <title>Gracias por tu cotización | Brandcaps</title>
        <meta name="robots" content="noindex" />
        {/* ejemplo válido si necesitás un link en <head> */}
        {/* <link rel="canonical" href="https://tusitio.com/cotizacion/enviada" /> */}
      </Head>

      <NavBar />

      <main className="min-h-[60vh] flex items-center justify-center px-4">
        <div className="max-w-xl w-full text-center">
          <div className="mx-auto mb-6 h-20 w-20 text-green-600">
            <svg viewBox="0 0 72 72" className="h-full w-full">
              <circle cx="36" cy="36" r="34" fill="none" stroke="currentColor" strokeWidth="4" opacity="0.2" />
              <path d="M23 37 l9 9 l18 -18" fill="none" stroke="currentColor" strokeWidth="5" strokeLinecap="round" strokeLinejoin="round" className="check-path" />
            </svg>
          </div>

          <h1 className="text-2xl font-semibold mb-2">¡Gracias por enviar tu cotización!</h1>
          <p className="text-gray-600">
            Ya la hemos recibido. A la brevedad, alguien de nuestro equipo comercial se contactará con usted.
          </p>

          <div className="mt-6 flex items-center justify-center gap-3">
            <Link href="/" className="rounded-lg bg-black text-white px-4 py-2 font-medium hover:opacity-90">
              Ir al inicio
            </Link>
            <Link href="/cart" className="rounded-lg border px-4 py-2 font-medium hover:bg-gray-50">
              Ver carrito
            </Link>
          </div>
        </div>
      </main>

      <Footer />

      <style jsx global>{`
        @keyframes dash { to { stroke-dashoffset: 0; } }
        .check-path { stroke-dasharray: 60; stroke-dashoffset: 60; animation: dash 900ms ease-out forwards 200ms; }
      `}</style>
    </>
  );
}
