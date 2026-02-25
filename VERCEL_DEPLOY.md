# Deploy Reputraq to Vercel (New Project)

This repo is a monorepo. The **Reputraq web app** lives in `reputraq/apps/web`. Follow these steps to create a **new** Vercel project and deploy.

**If a project was already created (e.g. `reputraq-app`):** open [Vercel Project Settings](https://vercel.com/darsh1153s-projects/reputraq-app/settings), set **Root Directory** to `reputraq/apps/web`, add the env vars below, then trigger a **Redeploy** from the Deployments tab.

---

## 1. Create a new Vercel project

### Option A: From Vercel Dashboard (recommended)

1. Go to [vercel.com](https://vercel.com) and sign in.
2. Click **Add New…** → **Project**.
3. **Import** your Git repository (GitHub/GitLab/Bitbucket).
4. Choose this repo (`reputraqv3` or your fork).
5. **Before** deploying, set the options below.

### Option B: From CLI (after linking once)

From the **repo root**:

```bash
# Install Vercel CLI if needed: npm i -g vercel
vercel login
vercel link   # when asked "Link to existing project?" choose N to create new
vercel --prod
```

If you use the CLI first, you still must set **Root Directory** and **Environment Variables** in the Vercel project settings (see below).

---

## 2. Project settings (required)

In **Project Settings** → **General**:

| Setting | Value |
|--------|--------|
| **Root Directory** | **`reputraq/apps/web`** (must set this; click Edit next to Root Directory, enter the path, save) |
| **Framework Preset** | Next.js (auto-detected once root is set) |
| **Build Command** | (leave default; `vercel.json` in the web app sets it) |
| **Output Directory** | `.next` |

The app’s `vercel.json` configures install/build to run from the monorepo (`reputraq/`), so **Root Directory must be `reputraq/apps/web`** or the build will fail (Next.js won’t be detected at repo root).

---

## 3. Environment variables to add

In **Project Settings** → **Environment Variables**, add these for **Production** (and optionally Preview/Development). These match what you use under `reputraq/apps/web` plus one extra for the chatbot.

### Supabase

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL (e.g. `https://xxxx.supabase.co`) |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon/publishable key |

### Database (Drizzle – required)

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string. Use the **transaction pooler** URL (e.g. `postgres://postgres.xxx:6543/postgres?sslmode=require`). For Supabase: Project Settings → Database → Connection string → “Transaction” pooler, port 6543. |

### API keys and external services

| Variable | Description |
|----------|-------------|
| `GEMINI_API_KEY` | **Add this for Vercel.** Google Gemini API key for the dashboard AI chatbot. Get from [Google AI Studio](https://aistudio.google.com/apikey). If missing, the chatbot returns a clear error. |
| `ENSEMBLE_TOKEN` | Token for Ensemble Data APIs (YouTube/social). |
| `NEXT_PUBLIC_ENSEMBLE_API_URL` | Ensemble API base URL (e.g. `https://ensembledata.com/apis`; replace `your-actual-api-url.com` for production). |
| `NEXT_PUBLIC_ENSEMBLE_BASE_URL` | Same as above if your code uses this name. |
| `APITUBE_KEY` | Apitube API key for news/competitor data. |

### Optional

| Variable | Description |
|----------|-------------|
| `NEXT_PUBLIC_BACKEND_URL` | Your app URL after deploy (e.g. `https://reputraq-app-xxx.vercel.app`) so frontend can call your API. |
| `BASE_URL` | Same as above for scripts/cron. |
| `ENABLE_DB_KEEPALIVE` | Set to `false` to disable DB keep-alive. |

---

## 4. Summary: copy from your .env to Vercel

From your `reputraq/apps/web` .env, add the **same names and values** in Vercel for:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `DATABASE_URL` (transaction pooler, `aws-1-ap-southeast-1.pooler.supabase.com:6543`)
- `NEXT_PUBLIC_ENSEMBLE_API_URL` (use real URL in production, not `your-actual-api-url.com`)
- `ENSEMBLE_TOKEN`
- `APITUBE_KEY`

**Also add in Vercel (not in your current .env):**

- `GEMINI_API_KEY` — required for the dashboard AI chatbot to work.

After adding variables, trigger a **Redeploy** from the Deployments tab so the new env is picked up.

---

## 5. Deploy

- **From Git:** Push to your linked branch (e.g. `main`); Vercel will build and deploy automatically.
- **From CLI (repo root):**
  ```bash
  vercel --prod
  ```

---

## 6. Verify

1. Open your deployment URL (e.g. `https://your-project.vercel.app`).
2. Check **Sign in** and **Sign up** (they use `DATABASE_URL`).
3. If you added `GEMINI_API_KEY`, open the dashboard and test the **AI chatbot**.
4. Check **Health**: `/api/health/db` (or your health route) to confirm DB connectivity.

If the chatbot returns “Chatbot is not configured”, add `GEMINI_API_KEY` in Vercel and redeploy.
