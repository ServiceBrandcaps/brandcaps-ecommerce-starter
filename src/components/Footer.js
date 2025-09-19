// components/Footer.js
import React from 'react';
import Link from 'next/link';

export default function Footer() {
  return (
    <footer className="bg-black text-gray-200 pt-10 pb-5">
      <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-4 gap-8">
        {/* Columna 1: Logo & Descripción */}
        <div>
          <h3 className="text-2xl font-bold text-white mb-3">Brandcaps</h3>
          <p className="text-sm">
            Tu tienda online de confianza. Calidad y envío rápido a todo el país.
          </p>
        </div>

        {/* Columna 2: Enlaces */}
        <div>
          <h4 className="font-semibold mb-2">Enlaces</h4>
          <ul className="space-y-1 text-sm">
            <li>
              <Link href="/" className="hover:underline">
                Inicio
              </Link>
            </li>
            <li>
              <Link href="/categoria/drinkware" className="hover:underline">
                Drinkware
              </Link>
            </li>
            <li>
              <Link href="/categoria/apparel" className="hover:underline">
                Apparel
              </Link>
            </li>
            <li>
              <Link href="/contacto" className="hover:underline">
                Contacto
              </Link>
            </li>
          </ul>
        </div>

        {/* Columna 3: Soporte */}
        <div>
          <h4 className="font-semibold mb-2">Soporte</h4>
          <ul className="space-y-1 text-sm">
            <li>
              <a href="tel:+5493518765221" className="hover:underline">
                +5493518765221
              </a>
            </li>
            <li>
              <a href="mailto:contacto@brandcaps.com.ar" className="hover:underline">
                contacto@brandcaps.com.ar
              </a>
            </li>
            <li>
              <Link href="/ayuda" className="hover:underline">
                Ayuda
              </Link>
            </li>
            <li>
              <Link href="/politicas" className="hover:underline">
                Políticas
              </Link>
            </li>
          </ul>
        </div>

        {/* Columna 4: Redes sociales */}
        <div>
          <h4 className="font-semibold mb-2">Seguinos</h4>
          <div className="flex space-x-4">
            <a
              href="https://www.facebook.com/BrandcapsArgentina"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src="/icons/facebook.svg" alt="Facebook" className="w-6 h-6" />
            </a>
            <a
              href="https://www.instagram.com/brandcapsargentina"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src="/icons/instagram.svg" alt="Instagram" className="w-6 h-6" />
            </a>
            <a
              href="https://www.linkedin.com/company/brandcaps"
              target="_blank"
              rel="noopener noreferrer"
            >
              <img src="/icons/linkedin.svg" alt="LinkedIn" className="w-6 h-6" />
            </a>
          </div>
        </div>
      </div>

      <div className="mt-8 border-t border-gray-700 pt-4 text-center text-sm">
        © {new Date().getFullYear()} Brandcaps. Todos los derechos reservados.
      </div>
    </footer>
  );
}
