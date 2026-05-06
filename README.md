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

1. Esegui `npm run build`.
2. Pubblica il contenuto di `dist/` su GitHub Pages.
3. In alternativa, configura una GitHub Action che installa le dipendenze, esegue `npm run build` e pubblica `dist/`.

Se in futuro sposti il progetto in un repository diverso da `username.github.io`, aggiungi `base: "/nome-repository/"` in `vite.config.ts`.

## Accessibilità e motion

La hero include il testo accessibile nascosto `TitanGra Portfolio`. Se il dispositivo usa `prefers-reduced-motion: reduce`, l'intro viene saltata e viene mostrata una versione statica del logo particellare.
