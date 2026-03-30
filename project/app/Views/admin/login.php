<section>
  <h2>Connexion BackOffice</h2>
  <p>Connecte-toi pour gerer les contenus du site.</p>
</section>

<section class="admin-form-wrap">
  <?php if (!empty($loginError ?? '')): ?>
    <p><?php echo e((string) $loginError); ?></p>
  <?php endif; ?>

  <form method="POST" action="<?php echo e(url(routeLogin())); ?>">
    <label for="username">Utilisateur</label>
    <input id="username" name="username" type="text" required>

    <label for="password">Mot de passe</label>
    <input id="password" name="password" type="password" required>

    <button type="submit">Se connecter</button>
  </form>

  <p>Identifiants par defaut (table users): admin / admin123</p>
</section>
