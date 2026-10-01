import Image from "next/image";
import { notFound } from "next/navigation";
import { AddToCartButton } from "@/components/add-to-cart-button";
import { getProductBySlug } from "@/lib/store";

function toPrice(value: number): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(value / 100);
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) {
    return { title: "Produit introuvable" };
  }
  return {
    title: `${product.name} | ShopStarter`,
    description: product.description,
  };
}

export default async function ProductDetailPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  return (
    <article className="grid gap-8 md:grid-cols-2">
      <div className="relative h-96 w-full overflow-hidden rounded-xl border border-slate-200 bg-white">
        <Image src={product.imageUrl} alt={product.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 50vw" />
      </div>
      <div className="space-y-4">
        <h1 className="text-3xl font-bold">{product.name}</h1>
        <p className="text-slate-600">{product.description}</p>
        <p className="text-2xl font-semibold">{toPrice(product.priceCents)}</p>
        <p className="text-sm text-slate-500">Stock disponible: {product.stock}</p>
        <AddToCartButton
          productId={product.id}
          name={product.name}
          unitPriceCents={product.priceCents}
          disabled={product.stock === 0}
        />
      </div>
    </article>
  );
}
