# GitHub Pages deployment

The browser client is deployed by `.github/workflows/pages.yml` when commits reach `main`, or manually through **Actions → Deploy GitHub Pages → Run workflow**.

Expected project site URL:
https://arkansasio.github.io/stargate-ogame-mmor-test/

## Enable Pages once

In the repository settings, open **Settings → Pages** and set **Build and deployment → Source** to **GitHub Actions**. The workflow needs the repository's Pages deployment permission.

## Important: static frontend versus MMO backend

GitHub Pages only hosts static files. It cannot run the Express API, PostgreSQL, sessions, fleet simulation, or other server-side game systems. The UI's API requests need a separately deployed backend and correctly configured API URL/CORS/session settings before account-based and persistent gameplay will work. This workflow deploys the frontend; it does not claim to deploy the backend.
