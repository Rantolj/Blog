<?php

declare(strict_types=1);

require_once __DIR__ . '/../app/Controllers/ArticleController.php';

function e(string $value): string
{
    return htmlspecialchars($value, ENT_QUOTES, 'UTF-8');
}

function currentRoute(): string
{
    $route = (string) ($_GET['route'] ?? '');
  return trim(trim($route), '/');
}

function baseUrl(): string
{
    $basePath = rtrim(str_replace('\\', '/', dirname((string) ($_SERVER['SCRIPT_NAME'] ?? '/'))), '/');
    return $basePath === '' ? '' : $basePath;
}

function url(string $path = ''): string
{
    $base = baseUrl();
    $normalized = trim($path, '/');
    if ($normalized === '') {
        return $base !== '' ? $base . '/' : '/';
    }
    return ($base !== '' ? $base : '') . '/' . $normalized;
}

function renderPage(
    string $view,
    string $title,
    string $description,
    array $data = [],
    ?int $statusCode = null,
    string $pageScripts = ''
): void
{
    if ($statusCode !== null) {
        http_response_code($statusCode);
    }

    $viewPath = __DIR__ . '/../app/Views/' . $view . '.php';
    if (!is_file($viewPath)) {
        throw new RuntimeException('Vue introuvable: ' . $view);
    }

    $pageTitle = $title;
    $pageDescription = $description;
    extract($data, EXTR_SKIP);

    require __DIR__ . '/../app/Views/partials/header.php';
    require $viewPath;
    require __DIR__ . '/../app/Views/partials/footer.php';
}

function redirectTo(string $path): void
{
    header('Location: ' . url($path));
    exit;
}

try {
    ensureArticlesSchema();
} catch (Throwable $exception) {
  renderPage(
    'errors/message',
    'Erreur serveur',
    'Une erreur de base de donnees est survenue.',
    [
      'heading' => 'Erreur serveur',
      'message' => $exception->getMessage(),
    ],
    500
  );
    exit;
}

$route = currentRoute();

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $route === 'admin/articles/save') {
    try {
        $id = isset($_POST['id']) && $_POST['id'] !== '' ? (int) $_POST['id'] : null;
        saveArticle($_POST, $id);
        redirectTo('admin/articles');
    } catch (Throwable $exception) {
    renderPage(
      'errors/message',
      'Erreur de saisie',
      'Verifier les donnees du formulaire.',
      [
        'heading' => 'Erreur de validation',
        'message' => $exception->getMessage(),
        'backUrl' => url('admin/articles'),
        'backLabel' => 'Retour au BackOffice',
      ],
      422
    );
        exit;
    }
}

if ($_SERVER['REQUEST_METHOD'] === 'POST' && $route === 'admin/articles/delete') {
    $id = (int) ($_POST['id'] ?? 0);
    if ($id > 0) {
        try {
            deleteArticle($id);
        } catch (Throwable $exception) {
            renderPage(
                'errors/message',
                'Erreur suppression',
                'Impossible de supprimer le contenu.',
                [
                    'heading' => 'Suppression echouee',
                    'message' => $exception->getMessage(),
                    'backUrl' => url('admin/articles'),
                    'backLabel' => 'Retour au BackOffice',
                ],
                500
            );
            exit;
        }
    }
    redirectTo('admin/articles');
}

if ($route === '' || $route === 'actualites') {
    $articles = getPublishedArticles();
    renderPage(
        'front/list',
        'Actualites sur la guerre en Iran',
        'Suivi des faits, analyses et chronologie sur la guerre en Iran.',
        ['articles' => $articles]
    );
    exit;
}

if (preg_match('#^article/([a-z0-9\-]+)$#', $route, $matches) === 1) {
    $slug = $matches[1];
    $article = getPublishedArticleBySlug($slug);
    if ($article === null) {
        renderPage(
            'errors/message',
            'Article introuvable',
            'Le contenu demande n existe pas.',
            [
                'heading' => '404 - Article introuvable',
                'message' => 'Ce contenu est indisponible.',
                'backUrl' => url(''),
                'backLabel' => 'Retour a l accueil',
            ],
            404
        );
        exit;
    }

    $metaTitle = (string) ($article['meta_title'] ?: $article['titre']);
    $metaDescription = (string) ($article['meta_description'] ?: $article['resume']);
    renderPage('front/detail', $metaTitle, $metaDescription, ['article' => $article]);
    exit;
}

if ($route === 'admin/articles') {
    $editingId = isset($_GET['edit']) ? (int) $_GET['edit'] : null;
    $editingArticle = $editingId ? getArticleById($editingId) : null;
    $articles = getAllArticlesAdmin();

    $tinyMceScript = <<<'HTML'
<script src="https://cdn.tiny.cloud/1/okqm4tc4351myg2o3d0kze1dq8ggl3gnb4y8875yfizyj42o/tinymce/6/tinymce.min.js"></script>
<script>
tinymce.init({
  selector: '#contenu',
  height: 360,
  menubar: false,
  plugins: 'lists link image table code',
  toolbar: 'undo redo | styles | bold italic underline | alignleft aligncenter alignright | bullist numlist | link image | code',
  block_formats: 'Paragraphe=p; Titre 2=h2; Titre 3=h3; Titre 4=h4; Titre 5=h5; Titre 6=h6'
});
</script>
HTML;

    renderPage(
        'admin/articles',
        'BackOffice - Gestion des contenus',
        'Creation, mise a jour et publication des contenus.',
        [
            'editingArticle' => $editingArticle,
            'articles' => $articles,
        ],
        null,
        $tinyMceScript
    );
    exit;
}

renderPage(
    'errors/message',
    'Page introuvable',
    'La page demandee est indisponible.',
    [
        'heading' => '404',
        'message' => 'URL inconnue.',
        'backUrl' => url(''),
        'backLabel' => 'Retour a l accueil',
    ],
    404
);
