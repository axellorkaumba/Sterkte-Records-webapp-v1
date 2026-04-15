# Sterkte Records – Web App

Label musical indépendant basé à Lubumbashi, RDC.  
Production, distribution digitale, management & booking.

## 🚀 Démarrage rapide

```bash
# 1. Installer les dépendances
npm install

# 2. Lancer en développement (localhost:5173)
npm run dev

# 3. Build pour production
npm run build

# 4. Preview du build
npm run preview
```

## 📦 Déploiement sur Vercel

### Méthode 1 — Via GitHub (recommandé)

1. Crée un repo sur GitHub : `sterkte-records-webapp`
2. Push ce projet :
   ```bash
   git init
   git add .
   git commit -m "Initial commit - Sterkte Records webapp"
   git branch -M main
   git remote add origin https://github.com/axellorkaumba/sterkte-records-webapp.git
   git push -u origin main
   ```
3. Va sur [vercel.com/new](https://vercel.com/new)
4. Importe le repo `sterkte-records-webapp`
5. Vercel détecte Vite automatiquement → clique **Deploy**
6. Ton site est live sur `sterkte-records-webapp.vercel.app`

### Méthode 2 — Vercel CLI

```bash
npm i -g vercel
vercel
```

## 🎨 Personnalisation

### Logos
Les logos sont dans `/public/` :
- `logo-dark.jpg` — Logo fond clair (texte noir + rouge)
- `logo-light.jpg` — Logo fond sombre (texte blanc + rouge)

> **Note** : Remplace par des fichiers PNG avec fond transparent pour un meilleur rendu.

### Images artistes
Les images des artistes sont actuellement des placeholders Unsplash.  
Pour les remplacer, modifie les URLs dans `ARTISTS_DATA` dans `src/App.jsx`.

### Couleurs
Toutes les couleurs sont centralisées dans l'objet `COLORS` en haut de `src/App.jsx` :
- Fond : `#0A0A0F`
- Titres or : `#F5C518`
- Accents rouge : `#E63946`
- Liens bleu : `#4FC3F7`

### Polices
Montserrat (titres) + Raleway (corps) — chargées via Google Fonts.

## 📁 Structure

```
sterkte-records-webapp/
├── public/
│   ├── favicon.svg
│   ├── logo-dark.jpg
│   └── logo-light.jpg
├── src/
│   ├── App.jsx          ← Composant principal (toutes les pages)
│   └── main.jsx         ← Point d'entrée React
├── index.html
├── package.json
├── vite.config.js
└── README.md
```

## 📄 Pages

| Page | Description |
|------|-------------|
| Accueil | Hero, services, roster, CTA |
| À propos | Vision, mission, équipe |
| Artistes | Grille filtrable style Totem Production |
| Distribution | Process 4 étapes, features |
| Studio | Tarification, formulaire réservation |
| Booking | Réservation artistes & lieux |
| Featurings | Demande de collaboration |
| Consulting | Services management & stratégie |
| Contact | Formulaire + informations |
| Espace Artiste | Connexion / Inscription |
| Dashboard | Stats, upload, gestion titres |

---

© 2025 Sterkte Records SARL — Lubumbashi, RDC
