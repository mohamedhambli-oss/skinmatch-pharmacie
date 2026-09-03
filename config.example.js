// ─────────────────────────────────────────────────────────────
//  SkinMatch — configuration locale
//
//  À RENOMMER EN  config.js  et à NE JAMAIS versionner.
//  Le dépôt GitHub Pages est public : tout fichier commité est
//  lisible par n'importe qui, et des robots scannent GitHub en
//  continu à la recherche de clés d'API.
//
//  Si ce fichier est absent, l'application fonctionne normalement :
//  seules les fonctions qui utilisent l'IA sont désactivées.
// ─────────────────────────────────────────────────────────────

window.SKINMATCH_GEMINI_KEY = "COLLER_ICI_LA_NOUVELLE_CLE";

// Rappel avant de créer la nouvelle clé, sur console.cloud.google.com :
//   1. Supprimer l'ancienne clé (elle a été publiée, donc compromise).
//   2. Créer une nouvelle clé.
//   3. Restrictions d'application  → Sites web (référents HTTP)
//        https://mohamedhambli-oss.github.io/*
//   4. Restrictions d'API          → Generative Language API uniquement
//   5. Définir un plafond de dépense sur le projet.
