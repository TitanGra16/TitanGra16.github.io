# TitanGra Portfolio

Homepage React + Vite + TypeScript per GitHub Pages, con intro cinematic full-screen su canvas. L'animazione genera particelle neon da una maschera offscreen del testo `TitanGra`, le fa convergere verso il logo e mantiene la scena viva dopo lo shockwave finale.

## Setup locale

```bash
npm install
npm run dev
```

Il server Vite mostrerà l'URL locale in terminale, di solito `http://localhost:5173`.

## Build

```bash
npm run build
npm run preview
```

La build di produzione viene generata in `dist/`.

## Deploy su GitHub Pages

Questo repository ha un nome adatto a una GitHub Pages root (`TitanGra16.github.io`), quindi Vite può usare la base `/`.

Il sito non deve essere pubblicato direttamente dalla root del repository, perche `index.html` punta a file TypeScript sorgenti che funzionano solo nel dev server Vite. La workflow in `.github/workflows/deploy.yml` compila il progetto e pubblica automaticamente la cartella `dist/`.

1. Vai su GitHub in `Settings > Pages`.
2. In `Build and deployment`, imposta `Source` su `GitHub Actions`.
3. Fai push su `main`.
4. Apri la tab `Actions` e aspetta che `Deploy to GitHub Pages` finisca.

Se in futuro sposti il progetto in un repository diverso da `username.github.io`, aggiungi `base: "/nome-repository/"` in `vite.config.ts`.

## Accessibilità e motion

La hero include il testo accessibile nascosto `TitanGra Portfolio`. Se il dispositivo usa `prefers-reduced-motion: reduce`, l'intro viene saltata e viene mostrata una versione statica del logo particellare.
