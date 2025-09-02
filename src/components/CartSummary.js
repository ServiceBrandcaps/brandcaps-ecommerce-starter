import React from 'react';
import { useCart } from '../context/CartContext';

export default function CartSummary() {
  const { cart, total } = useCart();

  return (
    <div className="bg-white shadow rounded p-4 mt-8">
      <h2 className="text-xl font-bold mb-4">🛒 Tu carrito</h2>
      {cart.length === 0 ? (
        <p className="text-gray-500">El carrito está vacío.</p>
      ) : (
        <>
          <ul className="divide-y divide-gray-200">
            {cart.map((item, index) => (
              <li key={index} className="py-2 flex justify-between">
                <span>{item.nombre}</span>
                <span>${item.precio}</span>
              </li>
            ))}
          </ul>
          <div className="mt-4 font-semibold text-lg">Total: ${total}</div>
          <button
            onClick={() => alert('Compra simulada')}
            className="mt-4 w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded"
          >
            Finalizar compra
          </button>
        </>
      )}
    </div>
  );
}
