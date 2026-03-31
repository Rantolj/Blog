<article class="article-detail">
  <h2><?php echo e((string) $article['titre']); ?></h2>
  <p class="meta">Slug SEO: <?php echo e((string) $article['slug']); ?> | Publie le <?php echo e((string) $article['created_at']); ?></p>
  <?php if (!empty($article['image_url'])): ?>
    <figure>
      <img 
        src="<?php echo e((string) $article['image_url']); ?>" 
        alt="<?php echo e((string) ($article['image_alt'] ?: $article['titre'])); ?>" 
        class="cover-image"
        loading="lazy"
        decoding="async">
      <figcaption><?php echo e((string) ($article['image_alt'] ?: $article['titre'])); ?></figcaption>
    </figure>
  <?php endif; ?>
  <section>
    <h3>Contexte</h3>
    <div><?php echo (string) $article['contenu']; ?></div>
  </section>
</article>
