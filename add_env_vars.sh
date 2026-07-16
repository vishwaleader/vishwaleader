#!/bin/bash

# Vercel Environment Variables Setup Script
# This script removes unused Postgres/Neon environment variables and sets up the correct Firebase and Admin credentials.

# Exit on any unhandled error (we use '|| true' on optional commands)
set -e

# Target environments for adding variables
ENVIRONMENTS=("production" "preview" "development")

# Variables to remove from all environments
REMOVE_VARS=(
  "POSTGRES_DATABASE"
  "NEON_AUTH_BASE_URL"
  "PGUSER"
  "PGDATABASE"
  "DATABASE_URL"
  "PGHOST"
  "PGPASSWORD"
  "PGHOST_UNPOOLED"
  "NEON_PROJECT_ID"
)

# Declare associative array for the correct environment variables
declare -A ENV_VARS

# 1. Populate the Firebase values from the configuration
ENV_VARS[NEXT_PUBLIC_FIREBASE_API_KEY]="AIzaSyByn-fsGhqcz3FRSIOIsYQA7mevKX77UTM"
ENV_VARS[NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN]="vishwaleader-techmedia.firebaseapp.com"
ENV_VARS[NEXT_PUBLIC_FIREBASE_PROJECT_ID]="vishwaleader-techmedia"
ENV_VARS[NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET]="vishwaleader-techmedia.firebasestorage.app"
ENV_VARS[NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID]="242967598341"
ENV_VARS[NEXT_PUBLIC_FIREBASE_APP_ID]="1:242967598341:web:831c1557dd5edcb153936c"
ENV_VARS[NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID]="G-B7ZMRKJWVF"

# 2. Extract default values from .env.local if present
DEFAULT_USERNAME=""
DEFAULT_PASSWORD=""

if [ -f .env.local ]; then
  DEFAULT_USERNAME=$(grep "^ADMIN_USERNAME=" .env.local | cut -d'=' -f2- | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")
  DEFAULT_PASSWORD=$(grep "^ADMIN_PASSWORD=" .env.local | cut -d'=' -f2- | sed -e 's/^"//' -e 's/"$//' -e "s/^'//" -e "s/'$//")
fi

# 3. Securely prompt for ADMIN_USERNAME
if [ -n "$DEFAULT_USERNAME" ]; then
  read -p "Enter ADMIN_USERNAME [default: $DEFAULT_USERNAME]: " input_username
  ADMIN_USERNAME=${input_username:-$DEFAULT_USERNAME}
else
  read -p "Enter ADMIN_USERNAME: " ADMIN_USERNAME
fi

# 4. Securely prompt for ADMIN_PASSWORD (hiding input)
if [ -n "$DEFAULT_PASSWORD" ]; then
  read -s -p "Enter ADMIN_PASSWORD [default: (stored in .env.local)]: " input_password
  echo ""
  ADMIN_PASSWORD=${input_password:-$DEFAULT_PASSWORD}
else
  read -s -p "Enter ADMIN_PASSWORD: " ADMIN_PASSWORD
  echo ""
fi

# Populate admin credentials
ENV_VARS[ADMIN_USERNAME]="$ADMIN_USERNAME"
ENV_VARS[ADMIN_PASSWORD]="$ADMIN_PASSWORD"

echo "----------------------------------------"
echo "Phase 1: Removing old Neon/Postgres variables..."
echo "----------------------------------------"

for var in "${REMOVE_VARS[@]}"; do
  echo "Removing $var..."
  # Use || true to prevent the script from stopping if the variable is already gone
  npx vercel env rm "$var" -y || true
done

echo "----------------------------------------"
echo "Phase 2: Adding correct environment variables..."
echo "----------------------------------------"

# Loop through each variable and add/update it in each Vercel environment
for key in "${!ENV_VARS[@]}"; do
  value="${ENV_VARS[$key]}"
  for env in "${ENVIRONMENTS[@]}"; do
    echo -n "Adding $key to $env... "
    # First delete if it exists, to avoid duplicate or overwrite errors
    npx vercel env rm "$key" "$env" -y > /dev/null 2>&1 || true
    # Pipe the value securely so it doesn't leak in the process list
    printf "%s" "$value" | npx vercel env add "$key" "$env" > /dev/null
    echo "Done."
  done
done

echo "----------------------------------------"
echo "Success: All operations completed!"
echo "To pull these changes down to your local workspace, run: npx vercel env pull"
echo "----------------------------------------"
