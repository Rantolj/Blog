import { z } from "zod";

export const cartItemSchema = z.object({
  productId: z.string().min(1).max(120),
  name: z.string().min(1).max(120),
  unitPriceCents: z.number().int().min(1).max(100000000),
  quantity: z.number().int().min(1).max(50),
});

export const productSchema = z.object({
  name: z.string().min(2).max(120),
  slug: z
    .string()
    .min(2)
    .max(120)
    .regex(/^[a-z0-9-]+$/),
  description: z.string().min(4).max(1200),
  priceCents: z.number().int().min(100).max(100000000),
  imageUrl: z.string().url(),
  stock: z.number().int().min(0).max(1000000),
  isActive: z.boolean().default(true),
});

export const checkoutSchema = z.object({
  email: z.email().max(120),
  items: z.array(cartItemSchema).min(1),
});

export const reserveStockSchema = z.object({
  items: z.array(z.object({ productId: z.string().min(1), quantity: z.number().int().positive() })).min(1),
});

export const updateOrderStatusSchema = z.object({
  status: z.enum(["pending", "paid", "processing", "shipped", "cancelled"]),
});
