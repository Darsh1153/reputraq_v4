#!/usr/bin/env bash
# Deploy to existing Vercel projects (reputraq + web). Run when logged into correct account.
# One-time: set Root Directory in Vercel for each project (see below).

set -e
REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
REPUTRAQ_ROOT="$REPO_ROOT/reputraq"

# Use scope only if set (for teams); otherwise use current account
SCOPE_ARGS=()
[[ -n "$VERCEL_SCOPE" ]] && SCOPE_ARGS=(--scope "$VERCEL_SCOPE")

echo "Account: $(vercel whoami)"
echo ""
echo "One-time: If builds fail with 'No Next.js version detected', set Root Directory in Vercel:"
echo "  • reputraq project → Root Directory: apps/landing"
echo "  • web project      → Root Directory: apps/web"
echo "  Settings: https://vercel.com/reputraqs-projects/reputraq/settings"
echo ""

# 1) Deploy reputraq (landing) — from monorepo root so install sees full workspace
echo "=== Linking & deploying REPUTRAQ (landing) ==="
cd "$REPUTRAQ_ROOT"
rm -rf .vercel
vercel link "${SCOPE_ARGS[@]}" --project reputraq --yes
vercel --prod "${SCOPE_ARGS[@]}"

# 2) Deploy web — from monorepo root
echo "=== Linking & deploying WEB ==="
rm -rf .vercel
vercel link "${SCOPE_ARGS[@]}" --project web --yes
vercel --prod "${SCOPE_ARGS[@]}"

echo ""
echo "Done."
