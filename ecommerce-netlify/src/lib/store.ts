import crypto from "node:crypto";
import { demoOrders, demoProducts } from "@/lib/mock-data";
import { hasSupabaseConfig, supabase } from "@/lib/supabase";
import type { CartItem, Order, OrderStatus, Product } from "@/types";

type MemoryStore = {
  products: Product[];
  orders: Order[];
};

declare global {
  var __ECOM_STORE__: MemoryStore | undefined;
}

function getMemoryStore(): MemoryStore {
  if (!global.__ECOM_STORE__) {
    global.__ECOM_STORE__ = {
      products: structuredClone(demoProducts),
      orders: structuredClone(demoOrders),
    };
  }
  return global.__ECOM_STORE__;
}

export async function listProducts(includeInactive = false): Promise<Product[]> {
  if (hasSupabaseConfig && supabase) {
    const query = supabase.from("products").select("*").order("name", { ascending: true });
    const { data, error } = includeInactive ? await query : await query.eq("is_active", true);
    if (error) throw error;
    return (data ?? []).map(mapSupabaseProduct);
  }

  const { products } = getMemoryStore();
  return products.filter((p) => includeInactive || p.isActive);
}

export async function getProductBySlug(slug: string): Promise<Product | null> {
  if (hasSupabaseConfig && supabase) {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .eq("slug", slug)
      .limit(1)
      .maybeSingle();
    if (error) throw error;
    return data ? mapSupabaseProduct(data) : null;
  }

  return getMemoryStore().products.find((p) => p.slug === slug) ?? null;
}

export async function getProductById(id: string): Promise<Product | null> {
  if (hasSupabaseConfig && supabase) {
    const { data, error } = await supabase.from("products").select("*").eq("id", id).limit(1).maybeSingle();
    if (error) throw error;
    return data ? mapSupabaseProduct(data) : null;
  }

  return getMemoryStore().products.find((p) => p.id === id) ?? null;
}

export async function createProduct(input: Omit<Product, "id">): Promise<Product> {
  const product: Product = { ...input, id: crypto.randomUUID() };

  if (hasSupabaseConfig && supabase) {
    const payload = mapProductToSupabase(product);
    const { data, error } = await supabase.from("products").insert(payload).select("*").single();
    if (error) throw error;
    return mapSupabaseProduct(data);
  }

  getMemoryStore().products.push(product);
  return product;
}

export async function updateProduct(id: string, input: Omit<Product, "id">): Promise<Product | null> {
  if (hasSupabaseConfig && supabase) {
    const payload = mapProductToSupabase({ ...input, id });
    const { data, error } = await supabase.from("products").update(payload).eq("id", id).select("*").single();
    if (error) return null;
    return mapSupabaseProduct(data);
  }

  const store = getMemoryStore();
  const index = store.products.findIndex((p) => p.id === id);
  if (index === -1) return null;
  store.products[index] = { ...input, id };
  return store.products[index];
}

export async function deleteProduct(id: string): Promise<boolean> {
  if (hasSupabaseConfig && supabase) {
    const { error } = await supabase.from("products").delete().eq("id", id);
    return !error;
  }

  const store = getMemoryStore();
  const before = store.products.length;
  store.products = store.products.filter((p) => p.id !== id);
  return store.products.length !== before;
}

export async function reserveStock(items: Array<{ productId: string; quantity: number }>): Promise<boolean> {
  const products = await listProducts(true);
  return items.every((item) => {
    const product = products.find((p) => p.id === item.productId);
    return !!product && product.stock >= item.quantity;
  });
}

export async function createOrder(email: string, items: CartItem[], stripeSessionId?: string): Promise<Order> {
  const products = await listProducts(true);

  for (const item of items) {
    const product = products.find((p) => p.id === item.productId);
    if (!product || product.stock < item.quantity || !product.isActive) {
      throw new Error(`Produit indisponible: ${item.name}`);
    }
  }

  const totalCents = items.reduce((sum, item) => sum + item.unitPriceCents * item.quantity, 0);
  const order: Order = {
    id: crypto.randomUUID(),
    email,
    items,
    totalCents,
    status: "pending",
    createdAt: new Date().toISOString(),
    stripeSessionId,
  };

  if (hasSupabaseConfig && supabase) {
    const { data, error } = await supabase
      .from("orders")
      .insert({
        id: order.id,
        email,
        items,
        total_cents: totalCents,
        status: order.status,
        stripe_session_id: stripeSessionId ?? null,
      })
      .select("*")
      .single();

    if (error) throw error;

    for (const item of items) {
      const product = products.find((p) => p.id === item.productId)!;
      await supabase.from("products").update({ stock: product.stock - item.quantity }).eq("id", product.id);
    }

    return mapSupabaseOrder(data);
  }

  const store = getMemoryStore();
  for (const item of items) {
    const product = store.products.find((p) => p.id === item.productId)!;
    product.stock -= item.quantity;
  }
  store.orders.unshift(order);
  return order;
}

export async function listOrdersByEmail(email: string): Promise<Order[]> {
  if (hasSupabaseConfig && supabase) {
    const { data, error } = await supabase
      .from("orders")
      .select("*")
      .eq("email", email)
      .order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapSupabaseOrder);
  }

  return getMemoryStore().orders.filter((order) => order.email === email);
}

export async function listAllOrders(): Promise<Order[]> {
  if (hasSupabaseConfig && supabase) {
    const { data, error } = await supabase.from("orders").select("*").order("created_at", { ascending: false });
    if (error) throw error;
    return (data ?? []).map(mapSupabaseOrder);
  }

  return getMemoryStore().orders;
}

export async function updateOrderStatus(id: string, status: OrderStatus): Promise<Order | null> {
  if (hasSupabaseConfig && supabase) {
    const { data, error } = await supabase.from("orders").update({ status }).eq("id", id).select("*").single();
    if (error) return null;
    return mapSupabaseOrder(data);
  }

  const order = getMemoryStore().orders.find((entry) => entry.id === id);
  if (!order) return null;
  order.status = status;
  return order;
}

function mapSupabaseProduct(data: Record<string, unknown>): Product {
  return {
    id: String(data.id),
    name: String(data.name),
    slug: String(data.slug),
    description: String(data.description ?? ""),
    priceCents: Number(data.price_cents),
    imageUrl: String(data.image_url),
    stock: Number(data.stock),
    isActive: Boolean(data.is_active),
  };
}

function mapProductToSupabase(product: Product): Record<string, unknown> {
  return {
    id: product.id,
    name: product.name,
    slug: product.slug,
    description: product.description,
    price_cents: product.priceCents,
    image_url: product.imageUrl,
    stock: product.stock,
    is_active: product.isActive,
  };
}

function mapSupabaseOrder(data: Record<string, unknown>): Order {
  return {
    id: String(data.id),
    email: String(data.email),
    items: (data.items as CartItem[]) ?? [],
    totalCents: Number(data.total_cents),
    status: data.status as OrderStatus,
    createdAt: String(data.created_at ?? new Date().toISOString()),
    stripeSessionId: data.stripe_session_id ? String(data.stripe_session_id) : undefined,
  };
}
