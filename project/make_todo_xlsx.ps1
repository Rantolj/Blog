$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$excelDir = Join-Path $root "excel"
if (!(Test-Path $excelDir)) { New-Item -ItemType Directory -Path $excelDir | Out-Null }

$out = Join-Path $excelDir "TODO_PERSO_RENDU.xlsx"
if (Test-Path $out) { Remove-Item $out -Force }

Add-Type -AssemblyName System.IO.Compression
Add-Type -AssemblyName System.IO.Compression.FileSystem

$sheetXml = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<worksheet xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main">
  <sheetViews><sheetView workbookViewId="0"/></sheetViews>
  <sheetFormatPr defaultRowHeight="15"/>
  <cols>
    <col min="1" max="1" width="18" customWidth="1"/>
    <col min="2" max="2" width="95" customWidth="1"/>
    <col min="3" max="3" width="12" customWidth="1"/>
  </cols>
  <sheetData>
    <row r="1"><c r="A1" t="inlineStr"><is><t>Section</t></is></c><c r="B1" t="inlineStr"><is><t>Tache</t></is></c><c r="C1" t="inlineStr"><is><t>Statut</t></is></c></row>
    <row r="2"><c r="A2" t="inlineStr"><is><t>Fait</t></is></c><c r="B2" t="inlineStr"><is><t>Le projet tourne en Docker (web + mysql)</t></is></c><c r="C2" t="inlineStr"><is><t>DONE</t></is></c></row>
    <row r="3"><c r="A3" t="inlineStr"><is><t>Fait</t></is></c><c r="B3" t="inlineStr"><is><t>FrontOffice en place (liste + detail)</t></is></c><c r="C3" t="inlineStr"><is><t>DONE</t></is></c></row>
    <row r="4"><c r="A4" t="inlineStr"><is><t>Fait</t></is></c><c r="B4" t="inlineStr"><is><t>BackOffice en place (create, edit, delete)</t></is></c><c r="C4" t="inlineStr"><is><t>DONE</t></is></c></row>
    <row r="5"><c r="A5" t="inlineStr"><is><t>Fait</t></is></c><c r="B5" t="inlineStr"><is><t>TinyMCE integre dans le BO</t></is></c><c r="C5" t="inlineStr"><is><t>DONE</t></is></c></row>
    <row r="6"><c r="A6" t="inlineStr"><is><t>Fait</t></is></c><c r="B6" t="inlineStr"><is><t>URL rewriting actif</t></is></c><c r="C6" t="inlineStr"><is><t>DONE</t></is></c></row>
    <row r="7"><c r="A7" t="inlineStr"><is><t>Fait</t></is></c><c r="B7" t="inlineStr"><is><t>Login BO avec session</t></is></c><c r="C7" t="inlineStr"><is><t>DONE</t></is></c></row>
    <row r="8"><c r="A8" t="inlineStr"><is><t>Fait</t></is></c><c r="B8" t="inlineStr"><is><t>Login BO verifie en base (table users)</t></is></c><c r="C8" t="inlineStr"><is><t>DONE</t></is></c></row>
    <row r="9"><c r="A9" t="inlineStr"><is><t>A faire</t></is></c><c r="B9" t="inlineStr"><is><t>Faire les tests Lighthouse en mobile</t></is></c><c r="C9" t="inlineStr"><is><t>TODO</t></is></c></row>
    <row r="10"><c r="A10" t="inlineStr"><is><t>A faire</t></is></c><c r="B10" t="inlineStr"><is><t>Faire les tests Lighthouse en desktop</t></is></c><c r="C10" t="inlineStr"><is><t>TODO</t></is></c></row>
    <row r="11"><c r="A11" t="inlineStr"><is><t>A faire</t></is></c><c r="B11" t="inlineStr"><is><t>Captures ecran FO et BO</t></is></c><c r="C11" t="inlineStr"><is><t>TODO</t></is></c></row>
    <row r="12"><c r="A12" t="inlineStr"><is><t>A faire</t></is></c><c r="B12" t="inlineStr"><is><t>Verifier login admin/admin123</t></is></c><c r="C12" t="inlineStr"><is><t>TODO</t></is></c></row>
    <row r="13"><c r="A13" t="inlineStr"><is><t>A faire</t></is></c><c r="B13" t="inlineStr"><is><t>Generer zip final et lien depot public</t></is></c><c r="C13" t="inlineStr"><is><t>TODO</t></is></c></row>
  </sheetData>
</worksheet>
'@

$contentTypes = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">
  <Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>
  <Default Extension="xml" ContentType="application/xml"/>
  <Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>
  <Override PartName="/xl/worksheets/sheet1.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>
</Types>
'@

$rels = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" Target="xl/workbook.xml"/>
</Relationships>
'@

$workbook = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<workbook xmlns="http://schemas.openxmlformats.org/spreadsheetml/2006/main" xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships">
  <sheets>
    <sheet name="TODO perso" sheetId="1" r:id="rId1"/>
  </sheets>
</workbook>
'@

$workbookRels = @'
<?xml version="1.0" encoding="UTF-8" standalone="yes"?>
<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">
  <Relationship Id="rId1" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/worksheet" Target="worksheets/sheet1.xml"/>
</Relationships>
'@

$fs = [System.IO.File]::Open($out, [System.IO.FileMode]::Create)
$zip = New-Object System.IO.Compression.ZipArchive($fs, [System.IO.Compression.ZipArchiveMode]::Create, $false)

function Add-Entry([System.IO.Compression.ZipArchive]$z, [string]$name, [string]$content) {
    $entry = $z.CreateEntry($name)
    $stream = $entry.Open()
    $writer = New-Object System.IO.StreamWriter($stream, (New-Object System.Text.UTF8Encoding($false)))
    $writer.Write($content)
    $writer.Dispose()
    $stream.Dispose()
}

Add-Entry $zip '[Content_Types].xml' $contentTypes
Add-Entry $zip '_rels/.rels' $rels
Add-Entry $zip 'xl/workbook.xml' $workbook
Add-Entry $zip 'xl/_rels/workbook.xml.rels' $workbookRels
Add-Entry $zip 'xl/worksheets/sheet1.xml' $sheetXml

$zip.Dispose()
$fs.Dispose()
