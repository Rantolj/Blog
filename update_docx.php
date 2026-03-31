<?php
/**
 * Script pour enrichir le DOCUMENT_TECHNIQUE.docx avec la modélisation des tables
 * Il va extraire le XML, ajouter la section complète des tables, et recompiler le DOCX
 */

$docxPath = __DIR__ . '/project/docsTechnique/DOCUMENT_TECHNIQUE.docx';
$extractPath = __DIR__ . '/project/docsTechnique/docx_work';
$outputPath = __DIR__ . '/project/docsTechnique/DOCUMENT_TECHNIQUE_UPDATED.docx';

// Nettoyage dossier de travail s'il existe
if (is_dir($extractPath)) {
    exec("rmdir /s /q \"$extractPath\" 2>nul");
}

// Créer le dossier de travail
mkdir($extractPath);

// Extraire le DOCX (c'est un ZIP)
$zip = new ZipArchive();
$zip->open($docxPath);
$zip->extractTo($extractPath);
$zip->close();

// Lire le document.xml
$docXmlPath = $extractPath . '/word/document.xml';
$xmlContent = file_get_contents($docXmlPath);

// Charger le XML
$dom = new DOMDocument();
$dom->preserveWhiteSpace = false;
$dom->load($docXmlPath);

// Namespace pour Word
$namespaces = [
    'w' => 'http://schemas.openxmlformats.org/wordprocessingml/2006/main',
    'r' => 'http://schemas.openxmlformats.org/officeDocument/2006/relationships',
];

// Créer un XPath pour rechercher les éléments
$xpath = new DOMXPath($dom);
foreach ($namespaces as $prefix => $uri) {
    $xpath->registerNamespace($prefix, $uri);
}

// Chercher le paragraphe contenant "8. Modelisation base de donnees"
$paragraphs = $xpath->query('.//w:p');
$insertAfterParagraph = null;
$modelizationSectionIndex = -1;

foreach ($paragraphs as $index => $para) {
    $textContent = $xpath->query('.//w:t', $para);
    $fullText = '';
    foreach ($textContent as $textNode) {
        $fullText .= $textNode->nodeValue;
    }
    
    if (strpos($fullText, '8. Modelisation base de donnees') !== false) {
        $modelizationSectionIndex = $index;
        $insertAfterParagraph = $para;
        break;
    }
}

if ($insertAfterParagraph === null) {
    die("Section 'Modelisation' non trouvée!");
}

// Créer de nouveaux paragraphes avec le contenu des tables
$body = $dom->getElementsByTagNameNS('http://schemas.openxmlformats.org/wordprocessingml/2006/main', 'body')->item(0);

// Aide : créer un paragraphe avec du texte simple
function createParagraph($dom, $text, $bold = false, $isBullet = false) {
    $ns = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';
    
    $p = $dom->createElementNS($ns, 'w:p');
    
    if ($isBullet) {
        $pPr = $dom->createElementNS($ns, 'w:pPr');
        $pStyle = $dom->createElementNS($ns, 'w:pStyle');
        $pStyle->setAttribute($ns . ':val', 'ListBullet');
        $pPr->appendChild($pStyle);
        $p->appendChild($pPr);
    }
    
    $r = $dom->createElementNS($ns, 'w:r');
    
    if ($bold) {
        $rPr = $dom->createElementNS($ns, 'w:rPr');
        $b = $dom->createElementNS($ns, 'w:b');
        $rPr->appendChild($b);
        $r->appendChild($rPr);
    }
    
    $t = $dom->createElementNS($ns, 'w:t');
    $t->setAttribute('xml:space', 'preserve');
    $t->nodeValue = $text;
    $r->appendChild($t);
    $p->appendChild($r);
    
    return $p;
}

// Texte sur les tables
$tableInfo = [
    "Tables principales :" => true,
    "" => false,
    "1. categories" => true,
    "- Table des catégories d'articles" => false,
    "- Colonnes : id (PK), name (VARCHAR 100), slug (VARCHAR 100, UNIQUE), created_at, updated_at" => false,
    "" => false,
    "2. users" => true,
    "- Table des utilisateurs avec authentification et rôles" => false,
    "- Colonnes : id (PK), username (UNIQUE), email (UNIQUE), password_hash, role (ENUM: admin/editor/author), active, created_at, updated_at" => false,
    "" => false,
    "3. articles" => true,
    "- Table principale avec contenu, métadonnées SEO et relations" => false,
    "- Colonnes principales :" => false,
    "  * id (PK)" => false,
    "  * author_id (FK → users)" => false,
    "  * category_id (FK → categories, nullable)" => false,
    "  * titre, slug (UNIQUE), resume, contenu (LONGTEXT)" => false,
    "  * meta_title, meta_description (pour SEO)" => false,
    "  * image_url, image_alt (pour la couverture et accessibilité)" => false,
    "  * status (ENUM: draft, published, archived)" => false,
    "  * created_at, updated_at, deleted_at (soft delete)" => false,
    "" => false,
    "Contraintes de clés étrangères :" => true,
    "- articles.author_id → users(id) : ON DELETE RESTRICT" => false,
    "- articles.category_id → categories(id) : ON DELETE SET NULL" => false,
    "" => false,
    "Indexes pour optimisation :" => true,
    "- idx_status (articles.status)" => false,
    "- idx_created_at (articles.created_at)" => false,
    "" => false,
    "Soft Delete :" => true,
    "- Les articles supprimés ne sont pas effacés physiquement" => false,
    "- deleted_at IS NULL pour filtrer les articles actifs" => false,
    "- Permet la récupération d'articles supprimés si nécessaire" => false,
];

// Ajouter les nouveaux paragraphes après la section de modélisation
foreach ($tableInfo as $text => $isBold) {
    if ($text === '') {
        $newPara = $dom->createElementNS('http://schemas.openxmlformats.org/wordprocessingml/2006/main', 'w:p');
    } else {
        $newPara = createParagraph($dom, $text, $isBold, false);
    }
    $body->insertBefore($newPara, $insertAfterParagraph->nextSibling);
    $insertAfterParagraph = $newPara;
}

// Sauvegarder le document.xml modifié
$dom->save($docXmlPath);

// Recompiler le DOCX (ZIP)
$zipOut = new ZipArchive();
$zipOut->open($outputPath, ZipArchive::CREATE);

// Ajouter tous les fichiers du dossier de travail
$files = new RecursiveIteratorIterator(new RecursiveDirectoryIterator($extractPath));
foreach ($files as $file) {
    if (!$file->isDir()) {
        $relativePath = substr($file->getPathname(), strlen($extractPath) + 1);
        $zipOut->addFile($file->getPathname(), $relativePath);
    }
}
$zipOut->close();

echo "✓ Fichier DOCX mis à jour avec succès : $outputPath\n";
echo "✓ Copie de sauvegarde : renommez DOCUMENT_TECHNIQUE_UPDATED.docx en DOCUMENT_TECHNIQUE.docx\n";

// Nettoyage dossier temporaire
exec("rmdir /s /q \"$extractPath\" 2>nul");
?>
