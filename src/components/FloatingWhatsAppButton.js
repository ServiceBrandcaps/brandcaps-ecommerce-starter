// components/FloatingWhatsAppButton.js
import React from 'react';
import Link from 'next/link';

export default function FloatingWhatsAppButton() {
  return (
    <Link
      href="https://wa.me/5493518765221?text=Hola,%20me%20interesa%20un%20producto%20de%20Brandcaps."
      target="_blank"
      className="fixed bottom-6 right-6 bg-green-500 hover:bg-green-600 text-white p-4 rounded-full shadow-lg z-50 flex items-center justify-center"
    >
      <img src="/icons/whatsapp.svg" alt="WhatsApp" className="w-6 h-6" />
      {/* <ChatBubbleLeftRightIcon className="w-6 h-6" /> */}
    </Link>
  );
}