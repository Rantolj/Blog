"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/components/cart-provider";

export default function CheckoutPage() {
  const router = useRouter();
  const { items, clearCart } = useCart();
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, items }),
      });

      const payload = (await response.json()) as { url?: string; orderId?: string; message?: string };

      if (!response.ok) {
        setError(payload.message ?? "Une erreur est survenue.");
        return;
      }

      clearCart();
      if (payload.url) {
        window.location.href = payload.url;
      } else if (payload.orderId) {
        router.push(`/checkout/success?orderId=${payload.orderId}`);
      }
    } catch {
      setError("Impossible de lancer le paiement.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="mx-auto max-w-xl space-y-4">
      <h1 className="text-3xl font-bold">Checkout</h1>
      <p className="text-slate-600">Finalise ta commande. Paiement Stripe si configuré, sinon mode démo.</p>
      <form onSubmit={onSubmit} className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
        <label className="block text-sm font-medium" htmlFor="email">
          Email de commande
        </label>
        <input
          id="email"
          type="email"
          required
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          className="w-full rounded border border-slate-300 px-3 py-2"
        />

        <button
          type="submit"
          disabled={loading || items.length === 0}
          className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          {loading ? "Traitement..." : "Payer"}
        </button>

        {items.length === 0 ? <p className="text-sm text-amber-700">Ajoute d&apos;abord des produits au panier.</p> : null}
        {error ? <p className="text-sm text-red-700">{error}</p> : null}
      </form>
    </section>
  );
}
