<section>
  <h2>BackOffice</h2>
  <p>Utilise ce formulaire pour creer ou modifier un article (TinyMCE + SEO + slug).</p>
</section>

<section class="admin-form-wrap">
  <h3><?php echo $editingArticle ? 'Modifier un article' : 'Nouvel article'; ?></h3>
  <form method="POST" action="<?php echo e(url(routeSave())); ?>">
    <input type="hidden" name="id" value="<?php echo e((string) ($editingArticle['id'] ?? '')); ?>">

    <label for="titre">Titre (h1 de la page)</label>
    <input id="titre" type="text" name="titre" required value="<?php echo e((string) ($editingArticle['titre'] ?? '')); ?>">

    <label for="slug">Slug URL normalise</label>
    <input id="slug" type="text" name="slug" placeholder="ex: tensions-iran-2026" value="<?php echo e((string) ($editingArticle['slug'] ?? '')); ?>">

    <label for="resume">Resume</label>
    <textarea id="resume" name="resume" rows="3"><?php echo e((string) ($editingArticle['resume'] ?? '')); ?></textarea>

    <label for="meta_title">Meta title</label>
    <input id="meta_title" type="text" name="meta_title" value="<?php echo e((string) ($editingArticle['meta_title'] ?? '')); ?>">

    <label for="meta_description">Meta description (160 max recommande)</label>
    <textarea id="meta_description" name="meta_description" rows="2"><?php echo e((string) ($editingArticle['meta_description'] ?? '')); ?></textarea>

    <label for="image_url">Image URL</label>
    <input id="image_url" type="text" name="image_url" value="<?php echo e((string) ($editingArticle['image_url'] ?? '')); ?>">

    <label for="image_alt">Texte alternatif image (alt)</label>
    <input id="image_alt" type="text" name="image_alt" value="<?php echo e((string) ($editingArticle['image_alt'] ?? '')); ?>">

    <label for="status">Statut</label>
    <select id="status" name="status">
      <option value="draft" <?php echo (($editingArticle['status'] ?? '') === 'draft') ? 'selected' : ''; ?>>Brouillon</option>
      <option value="published" <?php echo (($editingArticle['status'] ?? 'published') === 'published') ? 'selected' : ''; ?>>Publie</option>
    </select>

    <label for="contenu">Contenu (structure h2-h6 dans l'editeur)</label>
    <textarea id="contenu" name="contenu"><?php echo e((string) ($editingArticle['contenu'] ?? '')); ?></textarea>

    <button type="submit">Enregistrer</button>
  </form>
</section>

<section>
  <h3>Contenus existants</h3>
  <?php foreach ($articles as $item): ?>
    <article class="admin-card">
      <h4><?php echo e((string) $item['titre']); ?></h4>
      <h5>URL</h5>
      <?php if (!empty($item['slug'])): ?>
        <p><a href="<?php echo e(url(routeArticle((string) $item['slug']))); ?>"><?php echo e(url(routeArticle((string) $item['slug']))); ?></a></p>
      <?php else: ?>
        <p>Slug non defini</p>
      <?php endif; ?>
      <h6>Statut: <?php echo e((string) $item['status']); ?></h6>
      <p>
        <a href="<?php echo e(url(routeAdmin()) . '?edit=' . (string) $item['id']); ?>">Modifier</a>
      </p>
      <form method="POST" action="<?php echo e(url(routeDelete())); ?>" onsubmit="return confirm('Supprimer cet article ?');">
        <input type="hidden" name="id" value="<?php echo e((string) $item['id']); ?>">
        <button type="submit">Supprimer</button>
      </form>
    </article>
  <?php endforeach; ?>
</section>
