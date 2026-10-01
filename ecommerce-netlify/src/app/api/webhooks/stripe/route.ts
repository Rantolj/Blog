import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { updateOrderStatus } from "@/lib/store";
import { stripe } from "@/lib/stripe";

export async function POST(request: Request) {
  if (!stripe || !process.env.STRIPE_WEBHOOK_SECRET) {
    return NextResponse.json({ message: "Stripe non configuré" }, { status: 400 });
  }

  const body = await request.text();
  const signature = (await headers()).get("stripe-signature");

  if (!signature) {
    return NextResponse.json({ message: "Signature absente" }, { status: 400 });
  }

  try {
    const event = stripe.webhooks.constructEvent(body, signature, process.env.STRIPE_WEBHOOK_SECRET);

    if (event.type === "checkout.session.completed") {
      const session = event.data.object;
      const orderId = session.metadata?.orderId;
      if (orderId) {
        await updateOrderStatus(orderId, "paid");
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    return NextResponse.json({ message: error instanceof Error ? error.message : "Webhook invalide" }, { status: 400 });
  }
}
