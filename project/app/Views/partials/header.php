<!DOCTYPE html>
<html lang="fr">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title><?php echo e($pageTitle); ?></title>
  <meta name="description" content="<?php echo e($pageDescription); ?>">
  <meta property="og:title" content="<?php echo e($pageTitle); ?>">
  <meta property="og:description" content="<?php echo e($pageDescription); ?>">
  <meta property="og:type" content="website">
  <link rel="stylesheet" href="<?php echo e(url('assets/styles.css')); ?>">
</head>
<body>
<header class="site-header">
  <div class="container">
    <h1 class="site-title">Iran Conflict Monitor</h1>
    <p class="site-subtitle">Actualites, analyses et contexte geopolitique</p>
    <nav class="main-nav" aria-label="Navigation principale">
      <a href="<?php echo e(url('')); ?>">Accueil</a>
      <a href="<?php echo e(url(routeNews())); ?>">Actualites</a>
      <a href="<?php echo e(url(routeAdmin())); ?>">BackOffice</a>
    </nav>
  </div>
</header>
<main class="container">
