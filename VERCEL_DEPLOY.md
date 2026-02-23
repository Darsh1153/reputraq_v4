# Deploy to Vercel

This repo contains the **Reputraq web app** in a monorepo. The app lives in `reputraq/apps/web`.

## One-time setup: Set Root Directory

The project is already linked to **reputraqv3** on Vercel. For the build to succeed:

1. Open **Project Settings**: https://vercel.com/darsh1153s-projects/reputraqv3/settings
2. Go to **General** → **Root Directory**.
3. Click **Edit**, set to **`reputraq/apps/web`**, and save.
4. (Optional) Add **Environment Variables** (e.g. `DATABASE_URL`, API keys) under **Environment Variables**.
5. Go to **Deployments**, open the **⋯** on the latest deployment, and click **Redeploy**.

After that, every push to `main` will deploy automatically.

## Deploy from CLI

From the repo root:

```bash
vercel --prod
```

Make sure **Root Directory** is set to `reputraq/apps/web` in the project settings (see above) so the monorepo install and build run correctly.
