import { NextRequest, NextResponse } from "next/server";
import { stripe } from "@/lib/stripe";
import { createOrder } from "@/lib/store";
import { checkoutSchema } from "@/lib/validation";

export async function POST(request: NextRequest) {
  const parsed = checkoutSchema.safeParse(await request.json());

  if (!parsed.success) {
    return NextResponse.json({ message: parsed.error.issues[0]?.message ?? "Invalid payload" }, { status: 400 });
  }

  const { email, items } = parsed.data;

  try {
    const origin = request.nextUrl.origin;

    if (stripe && process.env.STRIPE_WEBHOOK_SECRET) {
      const session = await stripe.checkout.sessions.create({
        mode: "payment",
        customer_email: email,
        line_items: items.map((item) => ({
          quantity: item.quantity,
          price_data: {
            currency: "eur",
            unit_amount: item.unitPriceCents,
            product_data: { name: item.name },
          },
        })),
        success_url: `${origin}/checkout/success?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${origin}/cart`,
      });

      const order = await createOrder(email, items, session.id);
      return NextResponse.json({ url: session.url, orderId: order.id });
    }

    const order = await createOrder(email, items);
    return NextResponse.json({ orderId: order.id });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Checkout impossible" }, { status: 400 });
  }
}
