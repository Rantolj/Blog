import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/security";
import { updateOrderStatus } from "@/lib/store";
import { updateOrderStatusSchema } from "@/lib/validation";

export async function PATCH(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  if (!verifyAdminToken(request)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const parsed = updateOrderStatusSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Invalid payload" }, { status: 400 });
  }

  const { id } = await params;
  const order = await updateOrderStatus(id, parsed.data.status);

  if (!order) {
    return NextResponse.json({ message: "Commande introuvable" }, { status: 404 });
  }

  return NextResponse.json({ order });
}
