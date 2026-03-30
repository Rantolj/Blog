<section>
  <h2><?php echo e($heading); ?></h2>
  <p><?php echo e($message); ?></p>
  <?php if (!empty($backUrl ?? '')): ?>
    <p><a href="<?php echo e($backUrl); ?>"><?php echo e($backLabel ?? 'Retour'); ?></a></p>
  <?php endif; ?>
</section>
