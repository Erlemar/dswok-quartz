# dswok-quartz

Build infrastructure for [dswok.com](https://dswok.com/) — a [Quartz v4](https://quartz.jzhao.xyz/) pipeline that publishes the [DSWoK](https://github.com/Erlemar/dswok) Obsidian vault as a static site.

**Content lives in a separate repo.** This repo contains only the build tooling (Quartz source, config, custom plugins). The actual markdown notes live at [`Erlemar/dswok`](https://github.com/Erlemar/dswok) and are cloned fresh at build time by Cloudflare Pages.

## How it works

1. Edit a note in the DSWoK vault → push to [`Erlemar/dswok`](https://github.com/Erlemar/dswok)
2. A GitHub Action in the DSWoK repo pings a Cloudflare Pages deploy hook
3. Cloudflare Pages runs the build command:
   ```
   git clone --depth 1 https://github.com/Erlemar/dswok.git content && npm ci && npx quartz build
   ```
4. Static HTML in `public/` is deployed to dswok.com

Day-to-day you touch only the DSWoK repo. This repo only needs changes when updating Quartz itself, the layout, or the custom plugins.

## Local preview

```bash
git clone https://github.com/Erlemar/dswok.git content
npm ci
npx quartz build --serve
```

Then open <http://localhost:8080>.

## Custom plugins

- **`quartz.user-plugins.ts` → `NormalizeObsidianBlockMath`** — rewrites single-line `$$...$$` display math (Obsidian convention) into the multi-line form expected by `remark-math` v6. Without this, single-line display formulas render as inline KaTeX.

## Credits

Built on [Quartz v4](https://github.com/jackyzha0/quartz) by Jacky Zhao. See `LICENSE.txt` for the upstream MIT license.
