import Image from "next/image";
import Link from "next/link";
import React from "react";

const FloatingWhatsApp = () => {
  return (
    <div className="fixed bottom-10 right-10 z-50">
      <Link
        href="https://wa.me/919779774529?text=Hi%2C%20I%20want%20to%20know%20more%20about%20Legacis%21"
        target="_blank"
        className=""
      >
        <Image
          src="/icons/whatsapp_icon.svg"
          alt="WhatsApp Icon"
          width={50}
          height={50}
          className="hover:scale-[1.2] transition-transform duration-300"
        />
      </Link>
    </div>
  );
};

export default FloatingWhatsApp;