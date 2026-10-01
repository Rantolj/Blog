import { NextRequest, NextResponse } from "next/server";
import { sanitizeText, verifyAdminToken } from "@/lib/security";
import { createProduct, listProducts } from "@/lib/store";
import { productSchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  if (!verifyAdminToken(request)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const products = await listProducts(true);
  return NextResponse.json({ products });
}

export async function POST(request: NextRequest) {
  if (!verifyAdminToken(request)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

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

  const product = await createProduct(parsed.data);
  return NextResponse.json({ product }, { status: 201 });
}
