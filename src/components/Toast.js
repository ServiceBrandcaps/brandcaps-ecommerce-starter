"use client";
import React, { createContext, useContext, useMemo, useState } from "react";
import { XMarkIcon, CheckCircleIcon, ExclamationTriangleIcon } from "@heroicons/react/24/solid";

const ToastCtx = createContext(null);

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const remove = (id) => setToasts((t) => t.filter((x) => x.id !== id));

  const push = (input) => {
    const id = (typeof crypto !== "undefined" && crypto.randomUUID) ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
    const t = {
      id,
      type: input.type || "success", // success | error | info
      title: input.title || "",
      description: input.description || "",
      image: input.image || null,
      action: input.action || null, // { label, href?, onClick? }
      duration: Number(input.duration ?? 4500),
    };
    setToasts((prev) => [...prev, t]);
    if (t.duration > 0) setTimeout(() => remove(id), t.duration);
    return id;
  };

  const api = useMemo(() => ({
    notify: push,
    success: (opts) => push({ type: "success", ...opts }),
    error: (opts) => push({ type: "error", ...opts }),
    info: (opts) => push({ type: "info", ...opts }),
    close: remove,
  }), []);

  return (
    <ToastCtx.Provider value={api}>
      {children}
      {/* Container */}
      <div className="pointer-events-none fixed top-4 right-4 z-[9999] flex w-full max-w-sm flex-col gap-3">
        {toasts.map((t) => (
          <div
            key={t.id}
            className="pointer-events-auto rounded-xl border shadow-lg bg-white/95 backdrop-blur p-3 animate-[slideIn_.2s_ease-out]"
            style={{ borderColor: t.type === "error" ? "#fecaca" : t.type === "info" ? "#bfdbfe" : "#bbf7d0" }}
          >
            <div className="flex items-start gap-3">
              <div className="mt-0.5">
                {t.type === "error" ? (
                  <ExclamationTriangleIcon className="h-6 w-6 text-red-500" />
                ) : t.type === "info" ? (
                  <ExclamationTriangleIcon className="h-6 w-6 text-blue-500" />
                ) : (
                  <CheckCircleIcon className="h-6 w-6 text-green-500" />
                )}
              </div>

              <div className="min-w-0 flex-1">
                {/* Cabecera */}
                <div className="flex items-start gap-3">
                  {/* Imagen opcional estilo ML */}
                  {t.image && (
                    <img
                      src={t.image}
                      alt=""
                      className="h-12 w-12 rounded-md object-cover ring-1 ring-black/10"
                    />
                  )}
                  <div className="min-w-0">
                    <p className="font-semibold text-gray-900">{t.title}</p>
                    {t.description ? (
                      <p className="text-sm text-gray-600 line-clamp-2">{t.description}</p>
                    ) : null}
                    {t.action ? (
                      <div className="mt-2">
                        {t.action.href ? (
                          <a
                            href={t.action.href}
                            className="inline-flex items-center rounded-lg bg-black px-3 py-2 text-sm font-semibold text-white hover:opacity-90"
                          >
                            {t.action.label}
                          </a>
                        ) : (
                          <button
                            onClick={() => t.action.onClick?.()}
                            className="inline-flex items-center rounded-lg bg-black px-3 py-2 text-sm font-semibold text-white hover:opacity-90"
                          >
                            {t.action.label}
                          </button>
                        )}
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>

              <button
                onClick={() => remove(t.id)}
                className="rounded-md p-1 text-gray-500 hover:bg-gray-100"
                aria-label="Cerrar notificación"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
          </div>
        ))}
      </div>

      <style jsx global>{`
        @keyframes slideIn {
          from { opacity: 0; transform: translateY(-6px) translateX(6px); }
          to   { opacity: 1; transform: translateY(0) translateX(0); }
        }
      `}</style>
    </ToastCtx.Provider>
  );
}

export function useToast() {
  const ctx = useContext(ToastCtx);
  if (!ctx) throw new Error("useToast must be used within ToastProvider");
  return ctx;
}
