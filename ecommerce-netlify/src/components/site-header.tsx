"use client";

import Link from "next/link";
import { useCart } from "@/components/cart-provider";

export function SiteHeader() {
  const { itemCount } = useCart();

  return (
    <header className="border-b border-slate-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-4">
        <Link href="/" className="text-lg font-bold text-slate-900">
          ShopStarter
        </Link>
        <nav className="flex items-center gap-4 text-sm font-medium text-slate-700">
          <Link href="/products">Produits</Link>
          <Link href="/account/orders">Mes commandes</Link>
          <Link href="/admin">Admin</Link>
          <Link href="/cart">Panier ({itemCount})</Link>
        </nav>
      </div>
    </header>
  );
}
