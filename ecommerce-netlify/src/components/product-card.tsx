import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/types";

function toPrice(value: number): string {
  return new Intl.NumberFormat("fr-FR", { style: "currency", currency: "EUR" }).format(value / 100);
}

export function ProductCard({ product }: { product: Product }) {
  return (
    <article className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <Link href={`/products/${product.slug}`}>
        <div className="relative h-52 w-full">
          <Image src={product.imageUrl} alt={product.name} fill className="object-cover" sizes="(max-width: 768px) 100vw, 33vw" />
        </div>
      </Link>
      <div className="space-y-2 p-4">
        <h3 className="text-lg font-semibold text-slate-900">{product.name}</h3>
        <p className="line-clamp-2 text-sm text-slate-600">{product.description}</p>
        <div className="flex items-center justify-between">
          <span className="font-semibold text-slate-900">{toPrice(product.priceCents)}</span>
          <span className="text-xs text-slate-500">Stock: {product.stock}</span>
        </div>
      </div>
    </article>
  );
}
