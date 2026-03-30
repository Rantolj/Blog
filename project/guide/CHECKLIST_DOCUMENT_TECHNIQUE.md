# Checklist rapide - Document technique

## A faire en premier
- [ ] Renseigner Nom/Prenom et NUM ETU
- [ ] Renseigner lien du depot public

## Captures ecran
- [ ] Ouvrir FrontOffice liste et prendre capture
- [ ] Ouvrir detail article et prendre capture
- [ ] Ouvrir login BO et prendre capture
- [ ] Ouvrir BO (formulaire TinyMCE) et prendre capture
- [ ] Mettre toutes les captures dans docs/screenshots/

## Modelisation base
- [ ] Copier les tables articles + users dans la section modelisation
- [ ] Verifier que les champs slug/meta/status sont presents

## Login BO
- [ ] Verifier login par defaut admin/admin123
- [ ] Verifier redirection vers /acces-bo si non connecte

## Lighthouse
- [ ] Lancer audit Mobile
- [ ] Lancer audit Desktop
- [ ] Reporter les scores dans le document

## Finalisation
- [ ] Relire orthographe + coherence
- [ ] Exporter le zip du projet
- [ ] Verifier que docker compose up --build -d fonctionne
