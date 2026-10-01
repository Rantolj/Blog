import Link from "next/link";

export default async function CheckoutSuccessPage({
  searchParams,
}: {
  searchParams: Promise<{ orderId?: string }>;
}) {
  const params = await searchParams;

  return (
    <section className="space-y-4 rounded-xl border border-emerald-200 bg-emerald-50 p-6">
      <h1 className="text-3xl font-bold text-emerald-900">Commande confirmée</h1>
      <p className="text-emerald-800">Merci pour ton achat. N° commande: {params.orderId ?? "-"}</p>
      <Link href="/account/orders" className="inline-block rounded-md bg-emerald-700 px-4 py-2 text-white">
        Voir mes commandes
      </Link>
    </section>
  );
}
