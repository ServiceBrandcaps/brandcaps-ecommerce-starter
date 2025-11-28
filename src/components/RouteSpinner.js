// components/RouteSpinner.js
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/router";

export default function RouteSpinner({ text = "Cargando…" }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let timeout; // evita parpadeo en navegaciones ultrarrápidas

    const start = (url) => {
      // ignorar si es la misma url (shallow) o anclas
      if (url === router.asPath) return;
      timeout = setTimeout(() => setLoading(true), 120);
    };
    const end = () => {
      clearTimeout(timeout);
      setLoading(false);
    };

    router.events.on("routeChangeStart", start);
    router.events.on("routeChangeComplete", end);
    router.events.on("routeChangeError", end);
    return () => {
      router.events.off("routeChangeStart", start);
      router.events.off("routeChangeComplete", end);
      router.events.off("routeChangeError", end);
    };
  }, [router]);

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
