export type Product = {
  id: string;
  name: string;
  slug: string;
  description: string;
  priceCents: number;
  imageUrl: string;
  stock: number;
  isActive: boolean;
};

export type CartItem = {
  productId: string;
  name: string;
  unitPriceCents: number;
  quantity: number;
};

export type OrderStatus = "pending" | "paid" | "processing" | "shipped" | "cancelled";

export type Order = {
  id: string;
  email: string;
  items: CartItem[];
  totalCents: number;
  status: OrderStatus;
  createdAt: string;
  stripeSessionId?: string;
};
