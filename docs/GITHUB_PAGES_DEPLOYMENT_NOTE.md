# GitHub Pages note

This repository is a full-stack React/Vite + Node.js/Express application. GitHub Pages can host only the built static frontend; it cannot execute the Express API, WebSocket server, or database. The production game therefore still requires a separately deployed backend and a configured API URL.

## Recommended deployment

- Keep the existing application deployment on a Node-compatible host (for example, the repository's existing Docker/Railway/Render/Fly configuration).
- If publishing a static showcase/demo on GitHub Pages, create a separate frontend build workflow and configure Vite's `base` for the selected Pages URL.
- Do not point a Pages build at the repository root `index.html` without reviewing it: the root file references `/src/main.tsx`, which is not the app's configured Vite root. The configured app entry is `client/index.html`.
- The repository contains a `CNAME` for `universe-civilization-empires.com`; domain DNS and Pages custom-domain settings must be verified before using it with Pages.
