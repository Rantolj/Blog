"use client";

import Link from "next/link";
import { useCart } from "@/components/cart-provider";

function toPrice(value: number): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(value / 100);
}

export default function CartPage() {
  const { items, subtotalCents, removeItem, updateQuantity } = useCart();

  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-bold">Panier</h1>
      {items.length === 0 ? (
        <p className="text-slate-600">Ton panier est vide.</p>
      ) : (
        <>
          <ul className="space-y-3">
            {items.map((item) => (
              <li key={item.productId} className="rounded-xl border border-slate-200 bg-white p-4">
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <p className="font-semibold">{item.name}</p>
                    <p className="text-sm text-slate-600">{toPrice(item.unitPriceCents)} / unité</p>
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="number"
                      min={1}
                      max={50}
                      value={item.quantity}
                      onChange={(event) => updateQuantity(item.productId, Number(event.target.value))}
                      className="w-20 rounded border border-slate-300 px-2 py-1"
                    />
                    <button
                      type="button"
                      onClick={() => removeItem(item.productId)}
                      className="rounded border border-slate-300 px-3 py-1 text-sm"
                    >
                      Retirer
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
          <div className="space-y-2 rounded-xl border border-slate-200 bg-white p-4">
            <p className="text-lg font-semibold">Sous-total: {toPrice(subtotalCents)}</p>
            <Link href="/checkout" className="inline-block rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
              Passer au checkout
            </Link>
          </div>
        </>
      )}
    </section>
  );
}
