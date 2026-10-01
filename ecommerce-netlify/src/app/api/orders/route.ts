import { NextRequest, NextResponse } from "next/server";
import { createOrder, listOrdersByEmail } from "@/lib/store";
import { checkoutSchema } from "@/lib/validation";

export async function GET(request: NextRequest) {
  const email = request.nextUrl.searchParams.get("email");
  if (!email) {
    return NextResponse.json({ message: "Email requis" }, { status: 400 });
  }

  const orders = await listOrdersByEmail(email);
  return NextResponse.json({ orders });
}

export async function POST(request: NextRequest) {
  const parsed = checkoutSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Invalid payload" }, { status: 400 });
  }

  try {
    const order = await createOrder(parsed.data.email, parsed.data.items);
    return NextResponse.json({ order }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Order failed" }, { status: 400 });
  }
}
