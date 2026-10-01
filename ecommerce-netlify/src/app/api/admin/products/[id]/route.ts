import { NextRequest, NextResponse } from "next/server";
import { sanitizeText, verifyAdminToken } from "@/lib/security";
import { deleteProduct, updateProduct } from "@/lib/store";
import { productSchema } from "@/lib/validation";

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!verifyAdminToken(request)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = (await request.json()) as Record<string, unknown>;
  const parsed = productSchema.safeParse({
    ...body,
    name: sanitizeText(String(body.name ?? "")),
    slug: sanitizeText(String(body.slug ?? "")).toLowerCase(),
    description: sanitizeText(String(body.description ?? "")),
  });

  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Invalid input" }, { status: 400 });
  }

  const product = await updateProduct(id, parsed.data);

  if (!product) {
    return NextResponse.json({ message: "Produit introuvable" }, { status: 404 });
  }

  return NextResponse.json({ product });
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!verifyAdminToken(request)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const removed = await deleteProduct(id);

  if (!removed) {
    return NextResponse.json({ message: "Produit introuvable" }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
