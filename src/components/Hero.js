export default function Hero() {
  return (
    <section className="relative bg-gradient-to-r from-black to-gray-600 text-white py-20 px-6 text-center">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-4xl md:text-5xl font-extrabold mb-4">
          Bienvenido a Brandcaps Store
        </h1>
        <p className="text-lg md:text-xl mb-6">
          Tu tienda online de confianza. Calidad y envío rápido a todo el país.
        </p>
        <a
          href="#productos"
          className="inline-block bg-white text-gray-600 font-semibold py-3 px-6 rounded shadow hover:bg-gray-100 transition"
        >
          Explorar productos
        </a>
      </div>
    </section>
  );
}
