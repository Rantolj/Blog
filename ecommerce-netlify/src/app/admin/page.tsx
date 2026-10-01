"use client";

import { FormEvent, useMemo, useState } from "react";
import type { Order, Product } from "@/types";

type ProductInput = {
  id?: string;
  name: string;
  slug: string;
  description: string;
  priceCents: number;
  imageUrl: string;
  stock: number;
  isActive: boolean;
};

const blank: ProductInput = {
  name: "",
  slug: "",
  description: "",
  priceCents: 100,
  imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&auto=format&fit=crop",
  stock: 0,
  isActive: true,
};

export default function AdminPage() {
  const [adminToken, setAdminToken] = useState("");
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [form, setForm] = useState<ProductInput>(blank);
  const [message, setMessage] = useState<string | null>(null);

  const headers = useMemo(() => ({ "Content-Type": "application/json", "x-admin-token": adminToken }), [adminToken]);

  async function loadData() {
    if (!adminToken) return;

    const [productRes, ordersRes] = await Promise.all([
      fetch("/api/admin/products", { headers }),
      fetch("/api/admin/orders", { headers }),
    ]);

    if (!productRes.ok || !ordersRes.ok) {
      setMessage("Token admin invalide ou expiré.");
      return;
    }

    const productPayload = (await productRes.json()) as { products: Product[] };
    const ordersPayload = (await ordersRes.json()) as { orders: Order[] };
    setProducts(productPayload.products);
    setOrders(ordersPayload.orders);
  }

  async function submitProduct(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!adminToken) return;

    const endpoint = form.id ? `/api/admin/products/${form.id}` : "/api/admin/products";
    const method = form.id ? "PUT" : "POST";

    const response = await fetch(endpoint, {
      method,
      headers,
      body: JSON.stringify(form),
    });

    const payload = (await response.json()) as { message?: string };
    if (!response.ok) {
      setMessage(payload.message ?? "Erreur de sauvegarde");
      return;
    }

    setMessage("Produit enregistré.");
    setForm(blank);
    await loadData();
  }

  async function removeProduct(id: string) {
    const response = await fetch(`/api/admin/products/${id}`, { method: "DELETE", headers });
    if (response.ok) {
      await loadData();
    }
  }

  async function changeStatus(orderId: string, status: Order["status"]) {
    await fetch(`/api/orders/${orderId}/status`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ status }),
    });
    await loadData();
  }

  return (
    <section className="space-y-6">
      <h1 className="text-3xl font-bold">Admin</h1>

      <div className="rounded-xl border border-slate-200 bg-white p-4">
        <label className="block text-sm font-medium">Token admin</label>
        <div className="mt-2 flex gap-2">
          <input
            type="password"
            value={adminToken}
            onChange={(event) => setAdminToken(event.target.value)}
            className="w-full rounded border border-slate-300 px-3 py-2"
            placeholder="ADMIN_TOKEN"
          />
          <button
            type="button"
            onClick={() => void loadData()}
            className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white"
          >
            Charger
          </button>
        </div>
      </div>

      <form onSubmit={submitProduct} className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
        <h2 className="text-xl font-semibold">CRUD Produits</h2>
        <input
          value={form.name}
          onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
          placeholder="Nom"
          className="w-full rounded border border-slate-300 px-3 py-2"
          required
        />
        <input
          value={form.slug}
          onChange={(event) => setForm((current) => ({ ...current, slug: event.target.value }))}
          placeholder="slug-produit"
          className="w-full rounded border border-slate-300 px-3 py-2"
          required
        />
        <textarea
          value={form.description}
          onChange={(event) => setForm((current) => ({ ...current, description: event.target.value }))}
          placeholder="Description"
          className="w-full rounded border border-slate-300 px-3 py-2"
          required
        />
        <input
          type="url"
          value={form.imageUrl}
          onChange={(event) => setForm((current) => ({ ...current, imageUrl: event.target.value }))}
          placeholder="https://..."
          className="w-full rounded border border-slate-300 px-3 py-2"
          required
        />
        <div className="grid gap-3 md:grid-cols-2">
          <input
            type="number"
            min={100}
            value={form.priceCents}
            onChange={(event) => setForm((current) => ({ ...current, priceCents: Number(event.target.value) }))}
            className="w-full rounded border border-slate-300 px-3 py-2"
            required
          />
          <input
            type="number"
            min={0}
            value={form.stock}
            onChange={(event) => setForm((current) => ({ ...current, stock: Number(event.target.value) }))}
            className="w-full rounded border border-slate-300 px-3 py-2"
            required
          />
        </div>
        <label className="inline-flex items-center gap-2 text-sm">
          <input
            type="checkbox"
            checked={form.isActive}
            onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))}
          />
          Produit actif
        </label>
        <button type="submit" className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white">
          {form.id ? "Mettre à jour" : "Créer"}
        </button>
      </form>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Produits existants</h2>
        {products.map((product) => (
          <div key={product.id} className="flex flex-wrap items-center justify-between gap-2 rounded border border-slate-200 bg-white p-3">
            <div>
              <p className="font-medium">{product.name}</p>
              <p className="text-xs text-slate-600">{product.slug}</p>
            </div>
            <div className="flex gap-2">
              <button type="button" onClick={() => setForm({ ...product })} className="rounded border border-slate-300 px-3 py-1 text-sm">
                Éditer
              </button>
              <button
                type="button"
                onClick={() => removeProduct(product.id)}
                className="rounded border border-red-300 px-3 py-1 text-sm text-red-700"
              >
                Supprimer
              </button>
            </div>
          </div>
        ))}
      </section>

      <section className="space-y-3">
        <h2 className="text-xl font-semibold">Gestion commandes</h2>
        {orders.map((order) => (
          <div key={order.id} className="rounded border border-slate-200 bg-white p-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <p className="font-medium">{order.id.slice(0, 8)} • {order.email}</p>
              <select
                value={order.status}
                onChange={(event) => changeStatus(order.id, event.target.value as Order["status"])}
                className="rounded border border-slate-300 px-2 py-1"
              >
                <option value="pending">pending</option>
                <option value="paid">paid</option>
                <option value="processing">processing</option>
                <option value="shipped">shipped</option>
                <option value="cancelled">cancelled</option>
              </select>
            </div>
          </div>
        ))}
      </section>

      {message ? <p className="text-sm text-slate-700">{message}</p> : null}
    </section>
  );
}
