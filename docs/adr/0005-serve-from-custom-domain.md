# Polify is served from polify.niekes.com

Polify is a static site published from `main` by a GitHub Actions workflow. Its public address is `https://polify.niekes.com/`: the Cloudflare CNAME record points at GitHub Pages, and the custom domain must be set in the repository's Pages settings. Vite builds with `base: '/'`, so assets and artwork links are served from the root instead of a project subpath.

## Considered Options

- GitHub Pages project address (`https://niekes.github.io/polify/`): rejected. It puts `/polify/` into asset paths and every shared artwork Link, and leaves the app on a GitHub-owned host.
- A CNAME in the repository: rejected. Workflow-based Pages ignores it; the custom domain has to be set in the Pages settings.

## Consequences

- The address appears in `.env.production`, `package.json`, `README.md`, `AGENTS.md` and `vite.config.ts`, so a future move has to update all five together.
- Links made while the app was at the project address carry the old host. They keep working only while that host still redirects to the custom domain; the app does not rewrite old Links.
