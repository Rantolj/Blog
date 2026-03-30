# 📘 Guide complet : TinyMCE + PHP + MySQL

---

# 🧠 1. Introduction

**TinyMCE** est un éditeur de texte riche (comme Word) qui fonctionne dans le navigateur.

👉 Il permet à l’utilisateur :

* d’écrire du texte
* ajouter du gras, images, liens…

👉 MAIS :

* il ne stocke rien
* il génère du **HTML**

---

# 🔄 2. Fonctionnement global

```text
Utilisateur écrit → TinyMCE → HTML → Formulaire → PHP → MySQL → Affichage
```

---

# 🧱 3. Base de données (MySQL)

```sql
CREATE DATABASE blog;
USE blog;

CREATE TABLE articles (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titre VARCHAR(255),
    contenu LONGTEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
```

👉 `contenu` contient du HTML

---

# 📁 4. Structure du projet

```
/project
 ├── db.php
 ├── create.php
 ├── save.php
 ├── index.php
 └── uploads/
```

---

# 🔌 5. Connexion à la base (`db.php`)

```php
<?php
$conn = new mysqli("localhost", "root", "", "blog");

if ($conn->connect_error) {
    die("Erreur connexion");
}
?>
```

---

# 📝 6. Page de création (`create.php`)

```html
<!DOCTYPE html>
<html>
<head>
  <script src="https://cdn.tiny.cloud/1/no-api-key/tinymce/6/tinymce.min.js"></script>

  <script>
  tinymce.init({
    selector: '#contenu',
    height: 400,
    plugins: 'lists link image table code',
    toolbar: 'undo redo | bold italic | alignleft aligncenter alignright | code'
  });
  </script>
</head>
<body>

<form method="POST" action="save.php">
  <input type="text" name="titre" placeholder="Titre">

  <textarea id="contenu" name="contenu"></textarea>

  <button type="submit">Enregistrer</button>
</form>

</body>
</html>
```

---

# 🔄 7. Ce que fait TinyMCE

Tu écris :

```
Bonjour mon ami
```

👉 TinyMCE transforme en :

```html
<p>Bonjour mon ami</p>
```

---

# 💾 8. Enregistrement (`save.php`)

```php
<?php
require 'db.php';

$titre = $_POST['titre'];
$contenu = $_POST['contenu'];

$titre = $conn->real_escape_string($titre);
$contenu = $conn->real_escape_string($contenu);

$sql = "INSERT INTO articles (titre, contenu)
        VALUES ('$titre', '$contenu')";

$conn->query($sql);

header("Location: index.php");
?>
```

---

# 📤 9. Affichage (`index.php`)

```php
<?php
require 'db.php';

$result = $conn->query("SELECT * FROM articles");

while($row = $result->fetch_assoc()){
    echo "<h2>" . htmlspecialchars($row['titre']) . "</h2>";
    echo $row['contenu'];
}
?>
```

---

# 🔐 10. Sécurité

⚠️ TinyMCE envoie du HTML → risque XSS

## ✔️ Solution simple

```php
$contenu = strip_tags($contenu, '<p><b><strong><i><ul><li><a><img>');
```

---

# 🖼️ 11. Upload d’image (optionnel)

### Configuration TinyMCE

```javascript
tinymce.init({
  selector: '#contenu',
  plugins: 'image',
  toolbar: 'image',
  images_upload_url: 'upload.php'
});
```

---

### `upload.php`

```php
<?php
move_uploaded_file($_FILES['file']['tmp_name'], "uploads/" . $_FILES['file']['name']);

echo json_encode([
  "location" => "uploads/" . $_FILES['file']['name']
]);
?>
```

---

# 🔄 12. Flux complet détaillé

1. L’utilisateur écrit dans TinyMCE
2. TinyMCE génère du HTML
3. Le formulaire envoie les données
4. PHP récupère avec `$_POST`
5. PHP enregistre dans MySQL
6. Les données sont stockées
7. Lors de l’affichage → HTML interprété

---

# ❗ 13. Erreurs fréquentes

❌ Penser que TinyMCE enregistre automatiquement
✔️ Faux → il faut PHP

❌ Utiliser `htmlspecialchars()` sur le contenu
✔️ Faux → casse le HTML

❌ Oublier la sécurité
✔️ Risque XSS

---

# 🎯 14. Conclusion

* TinyMCE = éditeur visuel
* PHP = traitement
* MySQL = stockage

👉 Ensemble → tu peux créer :

* un blog
* un CMS
* un mini WordPress

---

# 🚀 15. Prochaines améliorations

* Modifier un article (UPDATE)
* Supprimer (DELETE)
* Routing avec `.htaccess`
* Architecture MVC

---

# 🧩 Résumé final

```
TinyMCE → HTML → PHP → MySQL → Affichage
```

---
