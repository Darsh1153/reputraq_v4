#!/bin/bash
# Script to update both Vercel projects' root directories (reputraqs-projects)
# Requires VERCEL_TOKEN from https://vercel.com/account/tokens (use Reputraq account)

TEAM_SLUG="reputraqs-projects"
REPUTRAQ_PROJECT_ID="prj_KbmVDQkajmqxfUSZtZppDmQUTUqG"
WEB_PROJECT_ID="prj_la5pvFkxAquYTTRdWgJl6B9C23BP"

if [ -z "$VERCEL_TOKEN" ]; then
  echo "Error: VERCEL_TOKEN environment variable is required"
  echo "Get your token from: https://vercel.com/account/tokens (log in as Reputraq)"
  exit 1
fi

echo "Updating reputraq (landing) project root directory to apps/landing..."
curl -s -X PATCH "https://api.vercel.com/v9/projects/${REPUTRAQ_PROJECT_ID}?slug=${TEAM_SLUG}" \
  -H "Authorization: Bearer ${VERCEL_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"rootDirectory": "apps/landing"}' \
  -w "\nHTTP Status: %{http_code}\n"

echo ""
echo "Updating web project root directory to apps/web..."
curl -s -X PATCH "https://api.vercel.com/v9/projects/${WEB_PROJECT_ID}?slug=${TEAM_SLUG}" \
  -H "Authorization: Bearer ${VERCEL_TOKEN}" \
  -H "Content-Type: application/json" \
  -d '{"rootDirectory": "apps/web"}' \
  -w "\nHTTP Status: %{http_code}\n"

echo ""
echo "Done! Run ./scripts/deploy-reputraq.sh to deploy."

