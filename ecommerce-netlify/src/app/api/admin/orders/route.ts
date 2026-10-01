import { NextRequest, NextResponse } from "next/server";
import { verifyAdminToken } from "@/lib/security";
import { listAllOrders } from "@/lib/store";

export async function GET(request: NextRequest) {
  if (!verifyAdminToken(request)) {
    return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
  }

  const orders = await listAllOrders();
  return NextResponse.json({ orders });
}
