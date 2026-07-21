#!/bin/bash
# Exit immediately if a command exits with a non-zero status
set -e

echo "======================================"
echo "Starting Vishwa Leader Deployment Workflow"
echo "======================================"

# Initialize parameters
COMMIT_MSG=""
FORCE=false

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    -m|--message)
      COMMIT_MSG="$2"
      shift 2
      ;;
    -f|--force)
      FORCE=true
      shift
      ;;
    *)
      shift
      ;;
  esac
done

# Check if there are uncommitted changes
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

  # Prompt for commit message if empty and running interactively
  if [ -z "$COMMIT_MSG" ]; then
    if [ -t 0 ]; then
      echo -n "Enter commit message: "
      read -r COMMIT_MSG
    fi
  fi

  # Fallback automatic commit message if still empty
  if [ -z "$COMMIT_MSG" ]; then
    CHANGED_FILES=$(git status --porcelain | awk '{print $2}' | paste -sd ", " -)
    COMMIT_MSG="update: $CHANGED_FILES"
    if [ -z "$CHANGED_FILES" ]; then
      COMMIT_MSG="update: corporate info & support client styling"
    fi
  fi

  echo "Committing changes with message: '$COMMIT_MSG'..."
  git commit -m "$COMMIT_MSG"
fi

echo "Pushing to GitHub..."
git push origin main || echo "Git push warning: Proceeding with Vercel deploy."

# Capture Git metadata to forward to Vercel
COMMIT_SHA=$(git rev-parse HEAD 2>/dev/null || echo "")
COMMIT_AUTHOR=$(git log -1 --format="%an" 2>/dev/null || echo "")
COMMIT_MSG_LATEST=$(git log -1 --format="%s" 2>/dev/null || echo "")

# Step 2: Deploy to Vercel via CLI
echo "Deploying to Vercel Production via CLI..."
npx vercel --prod --yes \
  --meta githubCommitMessage="$COMMIT_MSG_LATEST" \
  --meta githubCommitSha="$COMMIT_SHA" \
  --meta githubCommitAuthorName="$COMMIT_AUTHOR"

echo "======================================"
echo "Deployment Completed Successfully!"
echo "======================================"
