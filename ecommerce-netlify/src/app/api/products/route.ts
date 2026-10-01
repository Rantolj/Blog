import { NextResponse } from "next/server";
import { listProducts } from "@/lib/store";

export async function GET() {
  const products = await listProducts(false);
  return NextResponse.json({ products });
}
