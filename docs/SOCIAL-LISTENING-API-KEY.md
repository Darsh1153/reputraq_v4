# How to get the API key for Social Listening Finder (step-by-step)

The **Social Listening Finder** in Reputraq uses the **Ensemble Data** API. When your token is expired or missing, follow these steps to get a new one and add it to the app.

---

## Step 1: Sign up or log in to Ensemble Data

1. Open: **https://dashboard.ensembledata.com/register**
2. If you already have an account, use **Log in** instead of registering.
3. If you are new:
   - Enter your **email** and **password**.
   - Complete sign-up (no credit card for the free trial).
4. Check your email and **verify your address** (click the link they send).  
   The API will not return data until your email is verified.

---

## Step 2: Get your API token from the dashboard

1. After logging in, you are on the **Ensemble Data dashboard**.
2. Your **API token** is shown in the **top-left corner** of the dashboard (often next to your email or profile).
3. **Copy** the token (it looks like a long string, e.g. `QWZp10LXkDheSUQo` or similar).
4. Keep it somewhere safe; you will paste it into your app in the next steps.

---

## Step 3: Add the token to your app (local development)

1. Open **`reputraq/apps/web/.env.local`** in your project.
2. Set or update these two variables:

   ```env
   # Ensemble Social API (used by Social Listening Finder)
   NEXT_PUBLIC_ENSEMBLE_API_URL=https://ensembledata.com/apis
   ENSEMBLE_TOKEN=paste_your_token_here
   ```

   Replace `paste_your_token_here` with the token you copied from the dashboard.

3. If you use **`NEXT_PUBLIC_ENSEMBLE_BASE_URL`** instead of `NEXT_PUBLIC_ENSEMBLE_API_URL` in your codebase, set that as well:

   ```env
   NEXT_PUBLIC_ENSEMBLE_BASE_URL=https://ensembledata.com/apis
   ```

4. Save the file.
5. **Restart** your dev server (e.g. `pnpm dev` or `npm run dev`) so the new env vars are picked up.

---

## Step 4: Add the token in Vercel (production)

So that **Social Listening Finder** works on **app.reputraq.com**:

1. Go to **Vercel** → **reputraq** team → **web** project.
2. Open **Settings** → **Environment Variables**.
3. Add or edit:
   - **Name:** `ENSEMBLE_TOKEN`  
     **Value:** your token from the Ensemble Data dashboard  
     **Environment:** Production (and Preview/Development if you use them).
4. Optionally add:
   - **Name:** `NEXT_PUBLIC_ENSEMBLE_API_URL`  
     **Value:** `https://ensembledata.com/apis`
5. Save.
6. **Redeploy** the **web** project (e.g. trigger a new deployment from the Deployments tab) so the new variables are applied.

---

## Step 5: Test the Social Listening Finder

1. **Locally:** Open the app (e.g. `http://localhost:3001`), go to **Dashboard** → **Social Listening Finder**, run a search (e.g. a keyword). Results should load if the token is valid and email is verified.
2. **Production:** Open **https://app.reputraq.com**, go to **Social Listening Finder**, and run a search again.

If you still see errors:

- Confirm your **email is verified** in the Ensemble Data dashboard.
- Confirm the token is copied **without extra spaces**.
- Check the browser console and (if possible) server logs for the exact error (e.g. 401 = invalid/expired token, 495 = rate limit).

---

## Quick reference

| What              | Where / value |
|-------------------|----------------|
| Sign up / log in  | https://dashboard.ensembledata.com/register |
| API token         | Top-left of dashboard after login |
| API base URL      | `https://ensembledata.com/apis` |
| Env var (token)   | `ENSEMBLE_TOKEN` |
| Env var (URL)     | `NEXT_PUBLIC_ENSEMBLE_API_URL` or `NEXT_PUBLIC_ENSEMBLE_BASE_URL` |

---

## If your token expires or hits limits

- **Expired:** Log in to the dashboard again; you may see an option to regenerate or copy a new token. Replace the value in `.env.local` and in Vercel, then redeploy.
- **Rate limit (e.g. 495):** The app may fall back to mock data when the limit is hit. To get more capacity, check Ensemble Data’s pricing/plans on their site or dashboard.
- **Multiple keys:** You can add more tokens in `reputraq/apps/web/lib/api-fallback.ts` (and use `ENSEMBLE_TOKEN` for the default) so the app can rotate keys when one is limited.
