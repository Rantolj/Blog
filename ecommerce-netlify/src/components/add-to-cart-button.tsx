"use client";

import { useState } from "react";
import { useCart } from "@/components/cart-provider";

export function AddToCartButton({
  productId,
  name,
  unitPriceCents,
  disabled,
}: {
  productId: string;
  name: string;
  unitPriceCents: number;
  disabled?: boolean;
}) {
  const { addItem } = useCart();
  const [added, setAdded] = useState(false);

  return (
    <button
      type="button"
      disabled={disabled}
      onClick={() => {
        addItem({ productId, name, unitPriceCents }, 1);
        setAdded(true);
        setTimeout(() => setAdded(false), 1000);
      }}
      className="rounded-md bg-slate-900 px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:bg-slate-400"
    >
      {added ? "Ajouté" : "Ajouter au panier"}
    </button>
  );
}
