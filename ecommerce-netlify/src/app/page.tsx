import Link from "next/link";
import { ProductCard } from "@/components/product-card";
import { listProducts } from "@/lib/store";

export default async function HomePage() {
  const products = await listProducts();
  const featured = products.slice(0, 3);

  return (
    <div className="space-y-10">
      <section className="rounded-2xl bg-slate-900 p-8 text-white">
        <p className="text-sm uppercase tracking-wide text-slate-300">Starter e-commerce complet</p>
        <h1 className="mt-2 text-4xl font-bold">Lance ta boutique rapidement sur Netlify</h1>
        <p className="mt-4 max-w-2xl text-slate-200">
          Stack: Next.js, Stripe, Supabase et API serverless. Pages catalogue, panier, checkout, compte client et admin minimal.
        </p>
        <Link href="/products" className="mt-6 inline-block rounded-md bg-white px-4 py-2 font-semibold text-slate-900">
          Voir les produits
        </Link>
      </section>

      <section className="space-y-4">
        <h2 className="text-2xl font-semibold">Produits mis en avant</h2>
        <div className="grid gap-4 md:grid-cols-3">
          {featured.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      </section>
    </div>
  );
}
