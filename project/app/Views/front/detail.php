<article class="article-detail">
  <?php $imgSources = getResponsiveImageSources((string) ($article['image_url'] ?? '')); ?>
  <h2><?php echo e((string) $article['titre']); ?></h2>
  <p class="meta">Slug SEO: <?php echo e((string) $article['slug']); ?> | Publie le <?php echo e((string) $article['created_at']); ?></p>
  <?php if (!empty($imgSources['large'])): ?>
    <figure>
      <img 
        src="<?php echo e((string) $imgSources['large']); ?>"
        srcset="<?php echo e((string) $imgSources['small']); ?> 640w, <?php echo e((string) $imgSources['large']); ?> 1200w"
        sizes="(max-width: 700px) 92vw, 900px"
        alt="<?php echo e((string) ($article['image_alt'] ?: $article['titre'])); ?>" 
        class="cover-image"
        loading="eager"
        decoding="async"
        fetchpriority="high"
        width="1200"
        height="675">
      <figcaption><?php echo e((string) ($article['image_alt'] ?: $article['titre'])); ?></figcaption>
    </figure>
  <?php endif; ?>
  <section>
    <h3>Contexte</h3>
    <div><?php echo (string) $article['contenu']; ?></div>
  </section>
</article>
