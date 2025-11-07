import React from 'react';
import { useCart } from '../context/CartContext';
import Link from 'next/link';

export default function CartSummary() {
  const { cart, total, removeFromCart, updateQuantity } = useCart();
  
  const moneyAR = (n) =>
    new Intl.NumberFormat("es-AR", {
      style: "currency",
      currency: "ARS",
      maximumFractionDigits: 2,
    }).format(Number(n || 0));

  const itemCount = cart.reduce((sum, item) => sum + (item.qty || 1), 0);

  return (
    <div className="bg-white rounded-xl shadow-lg border overflow-hidden sticky top-4">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-4">
        <h2 className="text-xl font-bold flex items-center gap-2">
          🛒 Resumen de Cotización
        </h2>
        <p className="text-blue-100 text-sm mt-1">
          {itemCount} {itemCount === 1 ? 'producto' : 'productos'}
        </p>
      </div>

      {/* Content */}
      <div className="p-4">
        {cart.length === 0 ? (
          <div className="text-center py-8">
            <div className="text-4xl mb-3">🛒</div>
            <p className="text-gray-500 mb-4">Tu carrito está vacío</p>
            <Link 
              href="/"
              className="inline-block bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition text-sm"
            >
              Ver productos
            </Link>
          </div>
        ) : (
          <>
            {/* Items list */}
            <ul className="divide-y divide-gray-200 max-h-[400px] overflow-y-auto">
              {cart.map((item, index) => {
                const itemTotal = (item.price || 0) * (item.qty || 1);
                return (
                  <li key={index} className="py-3 flex gap-3">
                    {/* Image */}
                    {item.images?.[0] && (
                      <img 
                        src={item.images[0].url || item.images[0].image_url}
                        alt={item.name}
                        className="w-16 h-16 object-cover rounded-lg border"
                      />
                    )}
                    
                    {/* Info */}
                    <div className="flex-1 min-w-0">
                      <h4 className="text-sm font-medium text-gray-900 truncate">
                        {item.name}
                      </h4>
                      {item.variant && (
                        <p className="text-xs text-gray-500">
                          {[item.variant.color, item.variant.size].filter(Boolean).join(' • ')}
                        </p>
                      )}
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-sm font-semibold text-gray-900">
                          {moneyAR(itemTotal)}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({item.qty || 1} un.)
                        </span>
                      </div>
                      {item.belowMinimum && (
                        <p className="text-xs text-amber-600 mt-1">
                          ⚠️ Cantidad menor al mínimo
                        </p>
                      )}
                    </div>

                    {/* Remove button */}
                    {removeFromCart && (
                      <button
                        onClick={() => removeFromCart(index)}
                        className="text-gray-400 hover:text-red-600 transition"
                        aria-label="Eliminar"
                      >
                        🗑️
                      </button>
                    )}
                  </li>
                );
              })}
            </ul>

            {/* Summary */}
            <div className="mt-4 pt-4 border-t space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Subtotal ({itemCount} items)</span>
                <span className="font-medium">{moneyAR(total)}</span>
              </div>
              <div className="flex justify-between text-lg font-bold text-gray-900 pt-2 border-t">
                <span>Total Estimado</span>
                <span>{moneyAR(total)}</span>
              </div>
              <p className="text-xs text-gray-500 italic">
                * Precio final sujeto a confirmación
              </p>
            </div>

            {/* Actions */}
            <div className="mt-4 space-y-2">
              <Link 
                href="/cart"
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-medium text-center transition"
              >
                Solicitar Cotización
              </Link>
              <Link
                href="/"
                className="block w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2 px-4 rounded-lg font-medium text-center transition text-sm"
              >
                Seguir comprando
              </Link>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
