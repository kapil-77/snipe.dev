#!/usr/bin/env bash
# ============================================================
# Deploy every snipe.dev edge function and list their status.
#
# Usage:
#   ./scripts/deploy.sh              # deploy all three, then list
#   ./scripts/deploy.sh --verify     # list-only status check
#
# Requires the Supabase CLI + `supabase login` (or SUPABASE_ACCESS_TOKEN).
# ============================================================
set -euo pipefail

cd "$(dirname "$0")/.."

FUNCTIONS=(onboardtime-hello prunblocker-hello envsync-hello)

if [[ "${1:-}" == "--verify" || "${1:-}" == "-v" ]]; then
  echo "── deployed functions ───────────────────────────────"
  supabase functions list
  exit 0
fi

echo "── snipe.dev | supabase CLI ───────────────────────────"
supabase --version
echo ""

echo "── deploying edge functions ───────────────────────────"
for fn in "${FUNCTIONS[@]}"; do
  echo "  → ${fn}"
  supabase functions deploy "${fn}"
  echo ""
done

echo "── deployed functions ────────────────────────────────"
supabase functions list