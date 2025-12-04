// components/RouteSpinner.js
"use client";
import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/router";

export default function RouteSpinner({ text = "Cargando…" }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  // refs para no depender de re-renders
  const delayTimeoutRef = useRef(null);
  const safetyTimeoutRef = useRef(null);
  const activeTransitionsRef = useRef(0);

  useEffect(() => {
    const start = (url) => {
      // ignorar navegación a la misma ruta exacta
      if (url === router.asPath) return;

      // incrementamos el contador de transiciones activas
      activeTransitionsRef.current += 1;

      // si ya estaba cargando, no hace falta reprogramar nada
      if (loading) return;

      // delay corto para evitar parpadeo en navegaciones instantáneas
      clearTimeout(delayTimeoutRef.current);
      delayTimeoutRef.current = setTimeout(() => {
        setLoading(true);
      }, 120);

      // "failsafe": apagar spinner como máximo a los 10 segundos
      clearTimeout(safetyTimeoutRef.current);
      safetyTimeoutRef.current = setTimeout(() => {
        activeTransitionsRef.current = 0;
        setLoading(false);
      }, 10000);
    };

    const end = () => {
      // una transición terminó
      if (activeTransitionsRef.current > 0) {
        activeTransitionsRef.current -= 1;
      }

      // si ya no queda ninguna transición pendiente, apagamos el spinner
      if (activeTransitionsRef.current === 0) {
        clearTimeout(delayTimeoutRef.current);
        clearTimeout(safetyTimeoutRef.current);
        setLoading(false);
      }
    };

    router.events.on("routeChangeStart", start);
    router.events.on("routeChangeComplete", end);
    router.events.on("routeChangeError", end);

    return () => {
      router.events.off("routeChangeStart", start);
      router.events.off("routeChangeComplete", end);
      router.events.off("routeChangeError", end);
      clearTimeout(delayTimeoutRef.current);
      clearTimeout(safetyTimeoutRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]); // router es estable, así que el efecto se monta una sola vez

  if (!loading) return null;

  return (
    <div className="fixed inset-0 z-[9999] bg-black/40 backdrop-blur-sm flex items-center justify-center">
      <div className="rounded-xl bg-white px-6 py-4 shadow-xl flex items-center gap-3">
        <span className="inline-block h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-gray-800" />
        <span className="font-medium text-gray-800">{text}</span>
      </div>
    </div>
  );
}
