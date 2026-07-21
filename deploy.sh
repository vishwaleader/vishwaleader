#!/bin/bash
# Exit immediately if a command exits with a non-zero status
set -e

echo "======================================"
echo "Starting Vishwa Leader Deployment Workflow"
echo "======================================"

# Check if force flag is provided
FORCE=false
for arg in "$@"; do
  if [ "$arg" = "--force" ] || [ "$arg" = "-f" ]; then
    FORCE=true
  fi
done

# Check if there are uncommitted changes
# We look at both tracked and untracked files
UNCOMMITTED=$(git status --porcelain)

# Check if local branch is ahead of origin/main
# First fetch origin to be accurate (don't fail if fetch fails, e.g. offline)
echo "Fetching latest status from origin..."
git fetch origin main || echo "Fetch warning: Could not fetch latest remote branch status."
UNPUSHED=$(git log origin/main..main --oneline 2>/dev/null || echo "")

if [ -z "$UNCOMMITTED" ] && [ -z "$UNPUSHED" ] && [ "$FORCE" = false ]; then
  echo "No new changes or unpushed commits detected."
  echo "Everything is up to date."
  echo "If you want to force a deployment anyway, run: ./deploy.sh --force"
  echo "======================================"
  exit 0
fi

# Step 1: Git commit & push for storage and backup
if [ -n "$UNCOMMITTED" ]; then
  echo "Adding files to git..."
  git add .

  echo "Configuring git user..."
  git config --local user.email "iamyashcreator@gmail.com"
  git config --local user.name "Yash Ramteke"

  echo "Committing changes..."
  # Get files changed to create a meaningful commit message
  CHANGED_FILES=$(git status --porcelain | awk '{print $2}' | paste -sd ", " -)
  COMMIT_MSG="update: $CHANGED_FILES"
  if [ -z "$CHANGED_FILES" ]; then
    COMMIT_MSG="update: corporate info & support client styling"
  fi

  git commit -m "$COMMIT_MSG"
fi

echo "Pushing to GitHub..."
git push origin main || echo "Git push warning: Proceeding with Vercel deploy."

# Step 2: Deploy to Vercel via CLI
echo "Deploying to Vercel Production via CLI..."
npx vercel --prod --yes

echo "======================================"
echo "Deployment Completed Successfully!"
echo "======================================"
