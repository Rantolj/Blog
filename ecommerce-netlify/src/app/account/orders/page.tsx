"use client";

import { FormEvent, useState } from "react";
import type { Order } from "@/types";

function toPrice(value: number): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(value / 100);
}

export default function AccountOrdersPage() {
  const [email, setEmail] = useState("");
  const [orders, setOrders] = useState<Order[]>([]);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError(null);

    const response = await fetch(`/api/orders?email=${encodeURIComponent(email)}`);
    const payload = (await response.json()) as { orders?: Order[]; message?: string };

    if (!response.ok) {
      setError(payload.message ?? "Impossible de charger les commandes");
      return;
    }

    setOrders(payload.orders ?? []);
  }

  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-bold">Mes commandes</h1>
      <form onSubmit={onSubmit} className="flex flex-wrap gap-3 rounded-xl border border-slate-200 bg-white p-4">
        <input
          type="email"
          required
          placeholder="ton-email@exemple.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="flex-1 rounded border border-slate-300 px-3 py-2"
        />
        <button type="submit" className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
          Rechercher
        </button>
      </form>

      {error ? <p className="text-sm text-red-700">{error}</p> : null}

      <ul className="space-y-3">
        {orders.map((order) => (
          <li key={order.id} className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-semibold">Commande {order.id.slice(0, 8)}</p>
              <span className="rounded-full bg-slate-100 px-3 py-1 text-xs uppercase">{order.status}</span>
            </div>
            <p className="mt-1 text-sm text-slate-600">Total: {toPrice(order.totalCents)}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
