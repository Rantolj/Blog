import { NextResponse } from "next/server";
import { getProductById, getProductBySlug } from "@/lib/store";

export async function GET(_: Request, { params }: { params: Promise<{ identifier: string }> }) {
  const { identifier } = await params;
  const product = (await getProductById(identifier)) ?? (await getProductBySlug(identifier));

  if (!product) {
    return NextResponse.json({ message: "Produit introuvable" }, { status: 404 });
  }

  return NextResponse.json({ product });
}
