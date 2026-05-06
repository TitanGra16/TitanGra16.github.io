<div align="center">

# TitanGra

**A cinematic developer portfolio born from particles, neon light, and motion.**

[Live Portfolio](https://titangra16.github.io/) | [Source Code](https://github.com/TitanGra16/TitanGra16.github.io)

</div>

## Overview

TitanGra is a dark cyber portfolio homepage built with React, Vite, and TypeScript. The first screen opens with a full-canvas digital birth sequence: neon particles drift out of the dark, converge into the TitanGra wordmark, pulse through a glitch shockwave, and settle into a living hero section.

The goal is not to feel like a template. It is designed as a recognizable visual identity for a developer portfolio: elegant, technical, atmospheric, and fast enough to run directly on GitHub Pages.

## Highlights

- Full-screen canvas intro powered by `requestAnimationFrame`
- Offscreen text mask used to generate particle target positions
- Neon purple, lilac, and fuchsia particle system
- Glitch burst, scanner lines, glow trails, and shockwave effects
- Smooth idle state after the intro, with subtle particle motion
- Responsive layout with device pixel ratio handling
- Reduced-motion support for accessibility
- Minimal navbar with About, Projects, and Contact anchors
- Automated GitHub Pages deployment through GitHub Actions

## Tech Stack

React | Vite | TypeScript | Canvas API | CSS

## Project Structure

```text
src/
  App.tsx
  main.tsx
  styles.css
  components/
    Navbar.tsx
    TitanGraIntro.tsx
```

## Local Development

```bash
npm install
npm run dev
```

Production build:

```bash
npm run build
```

## Deployment

The site is deployed to GitHub Pages from the production build in `dist/`.

Deployment is handled by `.github/workflows/deploy.yml`. In the repository settings, GitHub Pages should use **GitHub Actions** as the source.

## Motion And Accessibility

The hero includes hidden accessible text for screen readers and respects `prefers-reduced-motion`. When reduced motion is enabled, the intro is skipped and a static TitanGra scene is shown instead.
