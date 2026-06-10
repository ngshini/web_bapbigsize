"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ShoppingCart } from "lucide-react";

const CART_KEY = "bap-bigsize-cart";

type CartItem = {
  quantity: number;
};

function readCartCount() {
  if (typeof window === "undefined") return 0;
  try {
    const items = JSON.parse(window.localStorage.getItem(CART_KEY) ?? "[]") as CartItem[];
    return items.reduce((sum, item) => sum + Number(item.quantity || 0), 0);
  } catch {
    return 0;
  }
}

export function CartIconButton() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    const update = () => setCount(readCartCount());
    update();
    window.addEventListener("storage", update);
    window.addEventListener("cart-updated", update);
    return () => {
      window.removeEventListener("storage", update);
      window.removeEventListener("cart-updated", update);
    };
  }, []);

  return (
    <Link href="/gio-hang" className="relative grid h-10 w-10 place-items-center rounded-md border border-brand-200 bg-white text-brand-700 transition hover:border-brand-700">
      <ShoppingCart size={21} />
      {count > 0 ? <span className="absolute -right-2 -top-2 grid h-5 min-w-5 place-items-center rounded-full bg-brand-700 px-1 text-xs font-bold text-white">{count}</span> : null}
    </Link>
  );
}
