"use client";
import { useEffect } from "react";

export default function ConsoleMessage() {
  useEffect(() => {
    console.log(
      "%cBytes with Bits",
      "color: #fff; background: linear-gradient(90deg,#7f5af0,#2cb67d); font-size: 3rem; font-weight: bold; padding: 12px 32px; border-radius: 8px;"
    );
    console.log(
      "%cAI-powered software solutions for your business.",
      "color: #7f5af0; font-size: 1.2rem; font-weight: 500;"
    );
    console.log(
      "%cGet your own software like Legacis: www.byteswithbits.com",
      "color: #2cb67d; font-size: 1.2rem; font-weight: 600;"
    );
  }, []);
  return null;
}