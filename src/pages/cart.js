// pages/cart.js
import React from "react";
import Head from "next/head";
import { useRouter } from "next/router";
import NavBar from "../components/NavBar";
import Footer from "../components/Footer";
import { useCart } from "../context/CartContext";
import { useToast } from "@/components/Toast";
import Link from "next/link";
import { PlusIcon, MinusIcon, XMarkIcon } from "@heroicons/react/24/outline";

export default function CartPage() {
  const { cart, total, removeFromCart, clearCart, addToCart } = useCart();
  const toast = useToast();
  const router = useRouter();
  const [customer, setCustomer] = React.useState({
    name: "",
    email: "",
    phone: "",
    company: "",
    message: "",
  });
  const [sending, setSending] = React.useState(false);

  const canSend =
    cart.length > 0 && customer.name && customer.email && !sending;

  const updateQty = (item, delta) => {
    const newQty = (item.qty || 1) + delta;
    if (newQty < 1) return;
    removeFromCart(item.id);
    addToCart({ ...item, qty: newQty });
  };

  const sendQuote = async () => {
    try {
      setSending(true);
      // enviamos una versión “compacta” del carrito
      const cartToSend = cart.map((i) => ({
        id: i.id,
        name: i.name || i.title,
        sku: i?.variant?.sku || i?.sku || null,
        qty: Number(i.qty ?? 1),
        unit_price: Number(i.price ?? i.unit_price ?? 0),
        belowMinimum: !!i.belowMinimum,
        pricingNote: i.pricingNote || null,
      }));
      const key = crypto?.randomUUID?.() || `${Date.now()}-${Math.random()}`;
      const res = await fetch("/api/quotes", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Idempotency-Key": key,
        },
        body: JSON.stringify({ customer, cart: cartToSend, total }),
      });
      const ct = res.headers.get("content-type") || "";
      const data = ct.includes("application/json")
        ? await res.json().catch(() => null)
        : null;
      if (!res.ok)
        throw new Error((data && data.error) || `HTTP ${res.status}`);
      toast.success({
        title: "¡Cotización enviada!",
        description: `Te escribiremos a ${customer.email} a la brevedad.`,
      });
      setTimeout(() => {
        // ✅ Vaciar carrito como si se hubiera “cerrado” la compra
        clearCart();
        // ✅ Reset del formulario
        setCustomer({
          name: "",
          email: "",
          phone: "",
          company: "",
          message: "",
        });
        // ✅ Navegar a página de gracias
        router.push("/cotizacion/enviada");
      }, 1200);
    } catch (err) {
      toast.error({
        title: "No se pudo enviar",
        description: err.message || "Intentá nuevamente en unos minutos.",
      });
    } finally {
      setSending(false);
    }
  };

  const faqs = [
    {
      question: "¿Cómo solicito cotización?",
      answer: (
        <div className="text-gray-700">
          <p>
            La solicitud de cotización la podés realizar de la siguiente manera:
          </p>
          <ol className="list-decimal list-inside mt-2">
            <li>
              Usando el carrito de presupuesto de la web y completando los datos
              de tu empresa. Indícanos la cantidad de productos a cotizar.
            </li>
            <li>
              Vía e-mail enviando un mail a{" "}
              <strong>ventas@brandcaps.com.ar</strong> con tu pedido. ¡No te
              olvides de adjuntar el logo!
            </li>
            <li>
              Vía Whatsapp: conversando con un representante de nuestro equipo
              comercial.
            </li>
          </ol>
        </div>
      ),
    },
    {
      question: "¿Cuál es la demora de producción?",
      answer: (
        <div className="text-gray-700">
          <p>
            El trabajo ingresará en producción una vez que se verifique el pago
            de la seña del 50% y la aprobación del preview digital.
          </p>
          <p>
            La demora de producción aproximada es de 7 a 10 días hábiles.
            Dependiendo del producto, cantidad y técnica de aplicación. Si tenés
            una fecha de entrega estipulada informaselo a tu comercial para
            coordinar.
          </p>
          <p>
            Una vez finalizada la producción, se te enviará un email de aviso
            para coordinar la entrega.
          </p>
          <p>
            {" "}
            <strong> Excepciones: </strong>{" "}
          </p>
          <ul className="list-disc list-inside mt-2">
            <li>Cuaderno personalizado: 10 a 15 días hábiles</li>
            <li>Mouse Pad y Cintas/llaveros: 25 días hábiles.</li>
          </ul>
        </div>
      ),
    },
    {
      question: "¿Voy a ver el producto con mi logo antes de imprimirlo?",
      answer: (
        <div className="text-gray-700">
          <p>
            Si, el área de pedidos te enviará por mail un preview digital de
            el/los productos para que nos des tu ok.
          </p>
          <p>
            En este documento podrás corroborar color/es de impresión y de
            material, números telefónicos, abreviaturas, nombres personales,
            errores de ortografía, logotipos y textos en general, su ubicación y
            tamaños.
          </p>
          <p>
            Las aprobaciones o cambios de diseño se realizan exclusivamente vía
            email. Toda modificación que no se haya solicitado por este medio no
            será tomada como válida.
          </p>
        </div>
      ),
    },
    {
      question: "¿Cuáles son las formas de pago?",
      answer: (
        <div className="text-gray-700">
          <ul className="list-disc list-inside mt-2">
            <li>Transferencia bancaria</li>
            <li>
              E-cheqs a 30 días corridos de Fecha de Factura. Consultá más
              opciones de financiación con tu ejecutivo de cuenta
            </li>
            <li>Mercado Pago (*)</li>
            <li>Tarjetas de Crédito y de Débito Corporativas (*)</li>
            <li>Cuenta en dólares en Payoneer/PayPal (**)</li>
            <li>No aceptamos efectivo ni cheques físicos.</li>
          </ul>
          <p>
            Luego de realizar el pago de tu pedido envíanos el comprobante
            administracion@brandcaps.com.ar para que ingrese a producción.
          </p>
          <p>
            (*) Los pagos abonados con Mercado Pago y tarjetas de crédito y
            débito tienen un incremento del 10%. Por favor consultar antes de
            solicitarlo.
          </p>
          <p>
            (**) Los pagos abonados en dólares con Payoneer o PayPal se
            convierten a la cotización del dólar MEP según la fecha en la que se
            abone.
          </p>
        </div>
      ),
    },
    {
      question: "¿Hacen envíos a todo el país?",
      answer: (
        <div className="text-gray-700">
          <p>Si, realizamos envíos a todo el país.</p>
          <p>Realizamos envíos con estas empresas de logística:</p>
          <ul className="list-disc list-inside mt-2">
            <li>OCA</li>
            <li>ANDREANI</li>
            <li>SENDBOX</li>
            <li>VIACARGO</li>
            <li>CREDIFIN</li>
            <li>EXPRESO BICENTENARIO</li>
          </ul>
          <p>
            Todas las empresas de logística cuentan con sistema de tracking de
            pedidos.
          </p>
          <p>
            Nuestra empresa también cuenta con un área de logística que brinda
            soporte adicional para el seguimiento de pedidos.
          </p>
        </div>
      ),
    },
  ];

  return (
    <>
      <Head>
        <title>Carrito</title>
      </Head>
      <NavBar />
      <main className="bg-gray-50 min-h-screen">
        {/* Pasos de cotización */}
        <div className="bg-gray-700 text-white py-4 text-center rounded-b-lg">
          <span className="mx-2">COTIZACIÓN</span>
          <span className="mx-2">→</span>
          <span className="mx-2">ENVIAR COTIZACIÓN</span>
          <span className="mx-2">→</span>
          <span className="mx-2">COTIZACIÓN ENVIADA</span>
        </div>

        <div className="max-w-6xl mx-auto px-4 py-8 grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna izquierda: carrito */}
          <div className="lg:col-span-2 bg-white p-6 rounded-lg shadow">
            {cart.length === 0 ? (
              <p className="text-gray-600">Tu carrito está vacío.</p>
            ) : (
              <>
                {/* Barra de progreso */}
                <div className="mb-4">
                  <p className="text-sm text-gray-700">
                    ¡Agregue $
                    {(1000000 - total).toLocaleString("es-AR", {
                      minimumFractionDigits: 2,
                    })}{" "}
                    al carrito y obtenga envío gratis!
                  </p>
                  <div className="w-full bg-gray-200 h-2 rounded-full overflow-hidden mt-1">
                    <div
                      className="bg-black h-2"
                      style={{
                        width: `${Math.min((total / 1000000) * 100, 100)}%`,
                      }}
                    />
                  </div>
                </div>

                {/* Tabla de productos */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="border-b">
                        <th className="py-2">&nbsp;</th>
                        <th className="py-2">PRODUCTO</th>
                        <th className="py-2">PRECIO</th>
                        <th className="py-2">CANTIDAD</th>
                        <th className="py-2">SUBTOTAL</th>
                      </tr>
                    </thead>
                    <tbody>
                      {cart.map((item) => {
                        // obtenemos la primera imagen si existe
                        const imgUrl = item.images?.image_url;
                        return (
                          <tr
                            key={item.id}
                            className="border-b hover:bg-gray-50"
                          >
                            <td className="py-3">
                              <button onClick={() => removeFromCart(item.id)}>
                                <XMarkIcon className="w-5 h-5 text-red-500" />
                              </button>
                            </td>
                            <td className="py-3 flex items-center">
                              {imgUrl && (
                                <img
                                  src={imgUrl}
                                  alt={item.name || item.title}
                                  className="w-10 h-10 rounded-full object-cover mr-3"
                                />
                              )}
                              <Link
                                href={`/product/${item.id}`}
                                className="hover:underline"
                              >
                                {item.name || item.title}
                              </Link>
                            </td>
                            <td className="py-3">
                              $
                              {(
                                item.price ??
                                item.unit_price ??
                                0
                              ).toLocaleString("es-AR", {
                                minimumFractionDigits: 2,
                              })}
                            </td>
                            <td className="py-3">
                              <div className="inline-flex items-center border rounded">
                                <button
                                  onClick={() => updateQty(item, -1)}
                                  className="px-2 hover:bg-gray-100"
                                >
                                  <MinusIcon className="w-4 h-4" />
                                </button>
                                <span className="px-3">{item.qty || 1}</span>
                                <button
                                  onClick={() => updateQty(item, +1)}
                                  className="px-2 hover:bg-gray-100"
                                >
                                  <PlusIcon className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                            <td className="py-3">
                              $
                              {(
                                (item.price ?? item.unit_price ?? 0) *
                                (item.qty || 1)
                              ).toLocaleString("es-AR", {
                                minimumFractionDigits: 2,
                              })}
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Cupón */}
                <div className="mt-6">
                  <input
                    type="text"
                    placeholder="Código de cupón"
                    className="border p-2 rounded-l w-1/2"
                  />
                  <button className="bg-black text-white px-4 py-2 rounded-r">
                    APLICAR CUPÓN
                  </button>
                </div>
              </>
            )}
          </div>

          {/* Columna derecha: resumen */}
          <aside className="bg-white p-6 rounded-lg shadow">
            <h2 className="text-xl font-semibold mb-4">Resumen</h2>
            <div className="flex justify-between mb-2">
              <span>Subtotal</span>
              <span>
                ${total.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between text-2xl font-bold mb-6">
              <span>Total</span>
              <span>
                ${total.toLocaleString("es-AR", { minimumFractionDigits: 2 })}
              </span>
            </div>
            {/* Datos del cliente */}
            <div className="mt-6 space-y-3">
              <h3 className="font-semibold">Tus datos</h3>
              <input
                className="w-full border rounded p-2"
                placeholder="Nombre y apellido *"
                value={customer.name}
                onChange={(e) =>
                  setCustomer((c) => ({ ...c, name: e.target.value }))
                }
              />
              <input
                className="w-full border rounded p-2"
                placeholder="Email *"
                type="email"
                value={customer.email}
                onChange={(e) =>
                  setCustomer((c) => ({ ...c, email: e.target.value }))
                }
              />
              <input
                className="w-full border rounded p-2"
                placeholder="Teléfono"
                value={customer.phone}
                onChange={(e) =>
                  setCustomer((c) => ({ ...c, phone: e.target.value }))
                }
              />
              <input
                className="w-full border rounded p-2"
                placeholder="Empresa"
                value={customer.company}
                onChange={(e) =>
                  setCustomer((c) => ({ ...c, company: e.target.value }))
                }
              />
              <textarea
                className="w-full border rounded p-2"
                placeholder="Mensaje (opcional)"
                rows={3}
                value={customer.message}
                onChange={(e) =>
                  setCustomer((c) => ({ ...c, message: e.target.value }))
                }
              />
            </div>

            <button
              onClick={sendQuote}
              className="mt-4 w-full bg-black text-white py-3 rounded disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={!canSend}
            >
              {sending ? "Enviando..." : "ENVIAR COTIZACIÓN"}
            </button>

            {/* FAQ placeholder */}
            <div className="mt-8 space-y-2">
              <h3 className="font-semibold">Preguntas Frecuentes</h3>
              {faqs.map(({ question, answer }) => (
                <details key={question} className="bg-gray-100 p-2 rounded">
                  <summary className="cursor-pointer font-medium">
                    {question}
                  </summary>
                  <div className="mt-2 text-gray-700 font-normal text-xs space-y-2">
                    {answer}
                  </div>
                </details>
              ))}
            </div>
          </aside>
        </div>
      </main>
      <Footer />
    </>
  );
}
