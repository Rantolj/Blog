import { ProductCard } from "@/components/product-card";
import { listProducts } from "@/lib/store";

export const metadata = {
  title: "Produits | ShopStarter",
  description: "Catalogue produits de la boutique.",
};

export default async function ProductsPage() {
  const products = await listProducts();

  return (
    <section className="space-y-4">
      <h1 className="text-3xl font-bold">Catalogue</h1>
      <div className="grid gap-4 md:grid-cols-3">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
}
