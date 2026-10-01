import type { Order, Product } from "@/types";

export const demoProducts: Product[] = [
  {
    id: "prod_coffee",
    name: "Café Signature",
    slug: "cafe-signature",
    description: "Assemblage premium torréfié artisanalement.",
    priceCents: 1590,
    imageUrl: "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=1200&auto=format&fit=crop",
    stock: 25,
    isActive: true,
  },
  {
    id: "prod_mug",
    name: "Mug Minimaliste",
    slug: "mug-minimaliste",
    description: "Mug céramique 35cl, finition mate.",
    priceCents: 1990,
    imageUrl: "https://images.unsplash.com/photo-1577937927133-66ef06acdf18?w=1200&auto=format&fit=crop",
    stock: 40,
    isActive: true,
  },
  {
    id: "prod_notebook",
    name: "Carnet Premium",
    slug: "carnet-premium",
    description: "Carnet A5 relié, papier 120g.",
    priceCents: 1290,
    imageUrl: "https://images.unsplash.com/photo-1531346878377-a5be20888e57?w=1200&auto=format&fit=crop",
    stock: 60,
    isActive: true,
  },
];

export const demoOrders: Order[] = [];
