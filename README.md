# VS Arena

VS Arena is a Next.js MVP for fast A/B voting, comment watching, and lightweight debate participation.

## Official Production URL

Use this URL as the single official production address:

https://vs-arena-two.vercel.app/

## Deployment Source

- GitHub repo: `J-Jerry1031/vs-arena`
- Production branch: `main`
- Vercel project: `vs-arena`

The local workspace should be linked to the Vercel project `vs-arena`. Avoid creating or deploying to duplicate Vercel projects for the same GitHub repository.

## Local Development

```bash
pnpm install
pnpm dev
```

Open `http://localhost:3000` in the browser.

## Checks

```bash
pnpm exec tsc --noEmit
pnpm exec eslint
pnpm build
```
