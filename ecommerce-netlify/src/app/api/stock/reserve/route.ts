import { NextRequest, NextResponse } from "next/server";
import { reserveStock } from "@/lib/store";
import { reserveStockSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  const parsed = reserveStockSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Invalid payload" }, { status: 400 });
  }

  const available = await reserveStock(parsed.data.items);
  return NextResponse.json({ available });
}
