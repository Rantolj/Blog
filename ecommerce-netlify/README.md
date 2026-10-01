# ShopStarter — E-commerce A à Z (Netlify)

Starter e-commerce complet construit avec **Next.js App Router**, prêt à être déployé sur **Netlify**.

## Stack

- Frontend: Next.js + Tailwind CSS
- Paiement: Stripe Checkout + webhook
- Base de données: Supabase (fallback mémoire si non configuré)
- Hébergement: Netlify

## Fonctionnalités livrées

- Home, catalogue, fiche produit
- Panier client
- Checkout + confirmation
- Compte client (consultation commandes)
- API produits, commandes, stock, checkout, webhook Stripe
- Admin minimal: CRUD produits + changement de statut commandes
- Validation des payloads (Zod)
- Protection admin par token (`x-admin-token`)
- Métadonnées SEO de base

## Variables d'environnement

Copier dans Netlify > Site configuration > Environment variables:

- `NEXT_PUBLIC_SITE_URL`
- `ADMIN_TOKEN`
- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`

## Schéma Supabase recommandé

Table `products`:
- `id uuid primary key`
- `name text`
- `slug text unique`
- `description text`
- `price_cents int`
- `image_url text`
- `stock int`
- `is_active boolean`

Table `orders`:
- `id uuid primary key`
- `email text`
- `items jsonb`
- `total_cents int`
- `status text`
- `stripe_session_id text null`
- `created_at timestamptz default now()`

## Lancer en local

```bash
npm install
npm run dev
```

## Déploiement Netlify

1. Push du dossier `ecommerce-netlify`.
2. Dans Netlify, sélectionner ce dossier comme base.
3. Build command: `npm run build`
4. Publish directory: `.next`
5. Ajouter les variables d'environnement.
6. Configurer le webhook Stripe: `https://<votre-site>/api/webhooks/stripe`
