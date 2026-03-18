# Update Root Directories for Vercel Projects (Reputraq)

Both projects need their root directories set so the monorepo builds correctly.

## Option 1: Via Vercel Dashboard (Easiest)

1. **reputraq (landing):**
   - Visit: https://vercel.com/reputraqs-projects/reputraq/settings
   - Under **Build and Development**, find **Root Directory**
   - Set to: `apps/landing` (or click Edit and enter it)
   - Save

2. **web:**
   - Visit: https://vercel.com/reputraqs-projects/web/settings
   - Under **Build and Development**, find **Root Directory**
   - Set to: `apps/web`
   - Save

## Option 2: Via API (Requires Token)

1. Get a token from https://vercel.com/account/tokens (log in as Reputraq).
2. Run from repo root: `VERCEL_TOKEN=your_token ./reputraq/update-both-projects.sh`

## Project IDs (reputraqs-projects)
- reputraq: prj_KbmVDQkajmqxfUSZtZppDmQUTUqG
- web: prj_la5pvFkxAquYTTRdWgJl6B9C23BP
