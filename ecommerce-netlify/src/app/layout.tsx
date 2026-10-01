import type { Metadata } from "next";
import { CartProvider } from "@/components/cart-provider";
import { SiteHeader } from "@/components/site-header";
import "./globals.css";

export const metadata: Metadata = {
  title: "ShopStarter - E-commerce Next.js",
  description: "Starter e-commerce prêt pour Netlify avec Next.js, Stripe et Supabase.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className="min-h-screen bg-slate-50 text-slate-900">
        <CartProvider>
          <SiteHeader />
          <main className="mx-auto w-full max-w-6xl px-4 py-8">{children}</main>
          <footer className="border-t border-slate-200 bg-white py-6 text-center text-sm text-slate-600">
            ShopStarter • Déployable sur Netlify
          </footer>
        </CartProvider>
      </body>
    </html>
  );
}
