# Guide d'upload d'images pour articles

## À propos

Le formulaire d'édition des articles accepte maintenant des **uploads de fichier** au lieu de simples URLs.

## Comment ça marche

### 1. Nouveau formulaire
- **Ancien champ** : `Image URL` (texte)
- **Nouveau champ** : Sélecteur de fichier (upload)

### 2. Formats acceptés
- ✅ **JPG / JPEG**
- ✅ **PNG** 
- ✅ **WebP** (recommandé pour le web)

### 3. Limites
- Taille maximale : **2 MB**
- Aucune image n'est obligatoire (optionnel)

### 4. Fonctionnement
1. Sélectionnez une image depuis votre ordinateur
2. Le fichier est uploadé et stocké dans `/storage/images/`
3. Un nom unique est généré automatiquement
4. Le chemin est enregistré en base de données

### 5. Édition d'un article
- **Nouvelle image** : Sélectionnez un fichier pour remplacer l'ancienne
- **Garder l'image** : Laissez le champ vide pour conserver l'image actuelle
- **L'image existante** s'affiche comme aperçu dans le formulaire

## Exemple de chemin stocké
```
/storage/images/img_1711900000_a1b2c3d4.jpg
```

## Affichage dans les articles
L'image sera affichée automatiquement si elle existe dans les vues front-end.

## Notes de sécurité
- Validation du type MIME 
- Validation de l'extension
- Limitation de taille
- Noms de fichiers générés automatiquement (sécurité)
- Dossier accessible en lecture publique via web

## En cas de problème

**"Erreur d'upload"** → Vérifiez la taille du fichier (max 2MB)

**"Format d'image non autorisé"** → Utilisez JPG, PNG ou WebP

**"Impossible de sauvegarder l'image"** → Le serveur n'a pas les droits d'écriture. Contactez l'admin.
