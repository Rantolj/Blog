<section>
  <h2>Dernieres publications</h2>
  <p>Le front office affiche uniquement les contenus publies et optimises pour le referencement.</p>
</section>

<?php if (count($articles) === 0): ?>
  <section>
    <h3>Aucun article publie</h3>
    <p>Publie un contenu depuis le BackOffice.</p>
  </section>
<?php endif; ?>

<?php foreach ($articles as $article): ?>
  <?php $imgSources = getResponsiveImageSources((string) ($article['image_url'] ?? '')); ?>
  <article class="article-card">
    <h3>
      <a href="<?php echo e(url(routeArticle((string) $article['slug']))); ?>">
        <?php echo e((string) $article['titre']); ?>
      </a>
    </h3>
    <p class="meta">Publie le <?php echo e((string) $article['created_at']); ?></p>
    <?php if (!empty($imgSources['large'])): ?>
      <img 
        src="<?php echo e((string) $imgSources['small']); ?>"
        srcset="<?php echo e((string) $imgSources['small']); ?> 640w, <?php echo e((string) $imgSources['large']); ?> 1200w"
        sizes="(max-width: 700px) 92vw, (max-width: 1100px) 46vw, 360px"
        alt="<?php echo e((string) ($article['image_alt'] ?: $article['titre'])); ?>" 
        class="cover-image"
        loading="lazy"
        decoding="async"
        fetchpriority="low"
        width="640"
        height="360">
    <?php endif; ?>
    <p><?php echo e((string) ($article['resume'] ?: mb_substr(strip_tags((string) $article['contenu']), 0, 220))); ?>...</p>
    <p><a href="<?php echo e(url(routeArticle((string) $article['slug']))); ?>">Lire l'article</a></p>
  </article>
<?php endforeach; ?>
