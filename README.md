<div align="center">

# TitanGra

**A fluid, interactive Computer Science portfolio.**

[Live Portfolio](https://titangra16.github.io/) · [Source Code](https://github.com/TitanGra16/TitanGra16.github.io)

</div>

## Overview

TitanGra is a personal portfolio built with React, TypeScript, Vite, and the
Canvas API. It presents my path through Computer Science, systems programming,
application development, web technologies, Linux, and network analysis.

The visual direction is intentionally dark and focused: purple and lavender
light move through the first viewport as an organic canvas field that reacts to
the pointer without delaying access to the content.

## Highlights

- Interactive fluid canvas environment with pointer inertia
- Immediate, content-first hero instead of a blocking intro sequence
- Responsive project, capability, process, and contact sections
- Keyboard-friendly mobile navigation and visible focus states
- Reduced-motion support and semantic page structure
- Optimized animation lifecycle when the hero leaves the viewport
- Automated GitHub Pages deployment

## Tech Stack

React · TypeScript · Vite · Canvas API · CSS

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

The production build is deployed to GitHub Pages through the workflow in
`.github/workflows/deploy.yml`.
