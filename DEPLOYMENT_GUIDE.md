# 🚀 Deployment Guide for Reputraq

This guide will walk you through deploying both applications to Vercel with custom domain mappings:
- **Landing App** → `reputraq.com`
- **Web App** → `app.reputraq.com`

## Deploy using Reputraq (not darsh1153)

To deploy to the **reputraq** Vercel team/account (not your personal darsh1153 account):

1. **Log in as reputraq**
   ```bash
   vercel logout
   vercel login
   ```
   Use the email/password or method for the **reputraq** account that owns the "reputraq" and "web" projects.

2. **Confirm scope**
   ```bash
   vercel whoami
   ```
   You should see the reputraq team/account, not darsh1153.

3. **Deploy both projects**
   ```bash
   ./scripts/deploy-reputraq.sh
   ```
   Or set the scope explicitly: `VERCEL_SCOPE=reputraq ./scripts/deploy-reputraq.sh`

4. **Root Directory in Vercel**  
   In the Vercel dashboard, for each project set:
   - **reputraq** project → **Root Directory**: `apps/landing`
   - **web** project → **Root Directory**: `apps/web`  
   (Settings → General → Root Directory, relative to the repo/monorepo root.)

5. **Production login (fix "Network error" on sign-in)**  
   For the **web** project, add environment variables in Vercel so the sign-in API can reach the database:
   - **Vercel** → **web** project → **Settings** → **Environment Variables**
   - Add at least: **`DATABASE_URL`** (your Supabase/postgres connection string, same as in `reputraq/apps/web/.env.local`)
   - Add any other vars from `reputraq/apps/web/.env.local` that the app needs (e.g. `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `ENSEMBLE_TOKEN`, `APITUBE_KEY`, etc.)
   - Redeploy the **web** project after adding or changing env vars.

---

## Prerequisites

1. **Vercel Account**: Sign up at [vercel.com](https://vercel.com) if you don't have one
2. **Domain Access**: You need access to DNS settings for `reputraq.com`
3. **GitHub/GitLab/Bitbucket**: Your code should be in a Git repository
4. **Environment Variables**: Prepare all required environment variables for both apps

---

## Step 1: Prepare Your Repository

### 1.1 Ensure Code is Committed
```bash
git add .
git commit -m "Prepare for deployment"
git push origin main
```

### 1.2 Verify Build Commands Work Locally
```bash
# Test landing app build
cd reputraq/apps/landing
pnpm install
pnpm build

# Test web app build
cd ../web
pnpm install
pnpm build
```

---

## Step 2: Deploy Landing App to Vercel

### 2.1 Create New Project in Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Import your Git repository
4. Configure the project:
   - **Project Name**: `reputraq-landing` (or your preferred name)
   - **Root Directory**: `reputraq/apps/landing`
   - **Framework Preset**: Next.js (should auto-detect)
   - **Build Command**: `cd ../.. && pnpm install --frozen-lockfile && pnpm --filter landing build`
   - **Output Directory**: `.next`
   - **Install Command**: `cd ../.. && pnpm install --frozen-lockfile`

### 2.2 Configure Environment Variables

Add all required environment variables in the Vercel project settings:
- Go to **Settings** → **Environment Variables**
- Add variables needed for the landing app
- Set them for **Production**, **Preview**, and **Development** environments as needed

### 2.3 Deploy

1. Click **"Deploy"**
2. Wait for the build to complete
3. Note the deployment URL (e.g., `reputraq-landing.vercel.app`)

---

## Step 3: Deploy Web App to Vercel

### 3.1 Create Second Project in Vercel

1. In Vercel Dashboard, click **"Add New..."** → **"Project"** again
2. Import the **same Git repository**
3. Configure the project:
   - **Project Name**: `reputraq-web` (or your preferred name)
   - **Root Directory**: `reputraq/apps/web`
   - **Framework Preset**: Next.js (should auto-detect)
   - **Build Command**: `cd ../.. && pnpm install --frozen-lockfile && pnpm --filter web build`
   - **Output Directory**: `.next`
   - **Install Command**: `cd ../.. && pnpm install --frozen-lockfile`

### 3.2 Configure Environment Variables

Add all required environment variables for the web app:
- **Database URL** (PostgreSQL)
- **API Keys**
- **Any other secrets**
- Set them for **Production**, **Preview**, and **Development** environments

### 3.3 Deploy

1. Click **"Deploy"**
2. Wait for the build to complete
3. Note the deployment URL (e.g., `reputraq-web.vercel.app`)

---

## Step 4: Configure Custom Domains

### 4.1 Add Domain to Landing App

1. Go to your **Landing App** project in Vercel
2. Navigate to **Settings** → **Domains**
3. Click **"Add Domain"**
4. Enter: `reputraq.com`
5. Click **"Add"**

### 4.2 Add Domain to Web App

1. Go to your **Web App** project in Vercel
2. Navigate to **Settings** → **Domains**
3. Click **"Add Domain"**
4. Enter: `app.reputraq.com`
5. Click **"Add"**

### 4.2.1 Fix "Verification Needed" / "Domain linked to another Vercel account"

If Vercel shows **Verification Needed** and says *"This domain is linked to another Vercel account"*, you must add a **TXT** record to prove ownership:

1. In Vercel → **web** project → **Settings** → **Domains**, find the orange alert for `app.reputraq.com` and the **TXT** record details.
2. Copy the exact **Name** and **Value** from that page (they are project-specific). They look like:
   - **Type:** `TXT`
   - **Name:** `_vercel` (for the subdomain `_vercel.reputraq.com`)
   - **Value:** `vc-domain-verify=app.reputraq.com,xxxxxxxxxx` (your value will have a different hash)
3. In your **DNS provider** (where `reputraq.com` is managed — e.g. Cloudflare, GoDaddy, Namecheap, Google Domains):
   - Add a new record:
     - **Type:** TXT  
     - **Name/Host:** `_vercel` (or `_vercel.app` if your provider uses full subdomain; some use `_vercel.reputraq.com`)
     - **Value/Content:** paste the full value from Vercel (e.g. `vc-domain-verify=app.reputraq.com,acf9d6ceed3a2501f127`)
     - **TTL:** 3600 or default
   - Save the record.
4. Wait for DNS to propagate (from a few minutes up to 48 hours). In Vercel → **Domains**, click **Refresh** next to `app.reputraq.com` to re-check.
5. After verification, Vercel will show **Valid Configuration**. You can then remove the TXT record if you want; the domain will stay verified.

**Also ensure** `app.reputraq.com` points to Vercel for traffic. Add (or keep) a **CNAME** record:
- **Name:** `app`
- **Value:** `cname.vercel-dns.com`  
(or the CNAME target shown in Vercel for this project).

#### Hostinger DNS (reputraq.com)

In **Hostinger** → **Domains** → **reputraq.com** → **DNS / Nameservers**, ensure you have:

| Type  | Name    | Value / Content |
|-------|---------|-----------------|
| **CNAME** | `app` | Use the value from Vercel (e.g. `cname.vercel-dns.com` or project-specific like `xxxxx.vercel-dns-017.com`) |
| **TXT**   | `_vercel` | Exact value from Vercel Domains for `app.reputraq.com` (e.g. `vc-domain-verify=app.reputraq.com,xxxxxxxxxx`) |

- You can have multiple TXT records with Name `_vercel` (e.g. one for `app.reputraq.com`, one for `www.reputraq.com`); Hostinger lists them separately.
- After adding or editing, wait a few minutes, then in **Vercel** → **web** → **Domains** click **Refresh** next to `app.reputraq.com`.
- The **CNAME target** must match what Vercel shows for the **web** project. If you previously pointed `app` to another project’s URL, update it to the current project’s target.

### 4.3 Configure DNS Records

Vercel will provide you with DNS records to add. You'll need to add these in your domain registrar's DNS settings:

#### For `reputraq.com`:
- **Type**: `A` or `CNAME`
- **Name**: `@` (or root domain)
- **Value**: Provided by Vercel (usually a CNAME to `cname.vercel-dns.com`)

#### For `app.reputraq.com`:
- **Type**: `CNAME`
- **Name**: `app`
- **Value**: Provided by Vercel (usually a CNAME to `cname.vercel-dns.com`)

**Example DNS Configuration:**
```
Type    Name    Value
A       @       76.76.21.21        (or use CNAME as Vercel suggests)
CNAME   app     cname.vercel-dns.com
```

### 4.4 Verify DNS Configuration

1. Go to your domain registrar (e.g., GoDaddy, Namecheap, Cloudflare)
2. Navigate to DNS Management
3. Add the records provided by Vercel
4. Wait for DNS propagation (can take a few minutes to 48 hours)
5. Vercel will automatically verify the domain once DNS propagates

---

## Step 5: SSL Certificate Setup

Vercel automatically provisions SSL certificates for your domains:
- SSL certificates are **automatically generated** once DNS is verified
- This usually happens within **24 hours** of DNS verification
- Your sites will be accessible via HTTPS automatically

---

## Step 6: Verify Deployment

### 6.1 Test Landing App
1. Visit `https://reputraq.com`
2. Verify all pages load correctly
3. Test navigation and functionality

### 6.2 Test Web App
1. Visit `https://app.reputraq.com`
2. Verify authentication works
3. Test core features
4. Check API endpoints

---

## Step 7: Configure Automatic Deployments

Vercel automatically deploys on every push to your main branch:
- **Production**: Deploys from `main` or `master` branch
- **Preview**: Deploys from pull requests and other branches
- You can configure branch settings in **Settings** → **Git**

---

## Troubleshooting

### Build Failures

**Issue**: Build fails with "Cannot find module"
- **Solution**: Ensure `vercel.json` has correct paths and build commands

**Issue**: Build fails with pnpm errors
- **Solution**: Verify `pnpm-lock.yaml` is committed and up to date

### Domain Issues

**Issue**: Domain not verifying
- **Solution**: 
  - Double-check DNS records are correct
  - Wait for DNS propagation (can take up to 48 hours)
  - Verify records using `dig` or `nslookup` commands

**Issue**: SSL certificate not provisioning
- **Solution**: 
  - Ensure DNS is correctly configured
  - Wait up to 24 hours after DNS verification
  - Contact Vercel support if issues persist

### Environment Variables

**Issue**: App works locally but fails in production
- **Solution**: 
  - Verify all environment variables are set in Vercel
  - Check variable names match exactly (case-sensitive)
  - Ensure variables are set for the correct environment (Production/Preview/Development)

---

## Additional Configuration

### Custom Headers (if needed)

You can add custom headers in `vercel.json`:

```json
{
  "headers": [
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        }
      ]
    }
  ]
}
```

### Redirects (if needed)

Add redirects in `vercel.json`:

```json
{
  "redirects": [
    {
      "source": "/old-path",
      "destination": "/new-path",
      "permanent": true
    }
  ]
}
```

---

## Monitoring and Analytics

1. **Vercel Analytics**: Enable in project settings for performance monitoring
2. **Logs**: View deployment and function logs in the Vercel dashboard
3. **Alerts**: Set up email notifications for deployment status

---

## Next Steps

- ✅ Set up monitoring and error tracking (e.g., Sentry)
- ✅ Configure CDN caching if needed
- ✅ Set up staging environment
- ✅ Implement CI/CD best practices
- ✅ Set up database backups for production

---

## Quick Reference

### Landing App
- **Project Root**: `reputraq/apps/landing`
- **Domain**: `reputraq.com`
- **Build Command**: `cd ../.. && pnpm install --frozen-lockfile && pnpm --filter landing build`

### Web App
- **Project Root**: `reputraq/apps/web`
- **Domain**: `app.reputraq.com`
- **Build Command**: `cd ../.. && pnpm install --frozen-lockfile && pnpm --filter web build`

---

## Support

- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **Vercel Support**: [vercel.com/support](https://vercel.com/support)
- **Domain Issues**: Contact your domain registrar

---

**Last Updated**: $(date)

