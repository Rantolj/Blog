# Realisation du cahier des charges

## Objectifs livres

1. Site d informations sur la guerre en Iran: oui, front office avec pages de liste et detail.
2. Base de donnees: oui, schema avec slug, meta, image alt, statut draft/published.
3. FrontOffice: oui, routes publiques pour listing et detail.
4. BackOffice: oui, gestion complete des contenus (creation, edition, suppression, publication).
5. Optimisation SEO: oui, meta title, meta description, structure titres et alt images.

## URL normalisees avec rewriting

Fichier [project/.htaccess](project/.htaccess):
- redirige toutes les routes non-fichier vers [project/public/index.php](project/public/index.php)

Fichier [project/public/.htaccess](project/public/.htaccess):
- convertit URL propre vers parametre route interne

Exemples d URL:
- /actualites
- /article/slug-de-l-article
- /admin/articles

## Verification des points demandes

1. URL normalise rewriting: implemente.
2. Structure h1-h6: h1/h2/h3/h4/h5/h6 utilises dans les pages et TinyMCE configure pour h2-h6.
3. Titres de page: balise title dynamique selon page/article.
4. Balises meta: description + Open Graph title/description.
5. Alt images: champ image_alt en backoffice et rendu cote front.
6. Lighthouse local: a lancer dans Chrome DevTools (mobile + desktop).

## Checklist Lighthouse locale

1. Ouvrir la page accueil ou detail article.
2. Ouvrir DevTools puis onglet Lighthouse.
3. Cocher Performance, Accessibility, Best Practices, SEO.
4. Lancer en mode Mobile puis Desktop.
5. Corriger ensuite les recommandations (poids image, contraste, cache, etc.).

## Notes d execution

- La migration de schema est aussi geree automatiquement par [project/app/Controllers/ArticleController.php](project/app/Controllers/ArticleController.php) au chargement.
- Pour Docker, la commande correcte est:
  docker compose up --build -d
- Si besoin de reinitialiser la base:
  docker compose down -v
  docker compose up --build -d
