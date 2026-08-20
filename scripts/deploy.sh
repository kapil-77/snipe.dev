#!/usr/bin/env bash
# ============================================================
# Deploy every snipe.dev edge function and list their status.
#
# Usage:
#   ./scripts/deploy.sh              # deploy functions + push migrations, then list
#   ./scripts/deploy.sh --db-only    # apply pending migrations (grants) only, then list
#   ./scripts/deploy.sh --verify     # list-only status check
#
# Requires the Supabase CLI + `supabase login` (or SUPABASE_ACCESS_TOKEN).
# ============================================================
set -euo pipefail

cd "$(dirname "$0")/.."

FUNCTIONS=(
  onboardtime-hello
  onboardtime-bootstrap
  onboardtime-runbooks
  onboardtime-items
  prunblocker-hello
  envsync-hello
)

MODE="${1:-}"
if [[ "$MODE" == "--verify" || "$MODE" == "-v" ]]; then
  echo "── deployed functions ───────────────────────────────"
  supabase functions list
  exit 0
fi

echo "── snipe.dev | supabase CLI ───────────────────────────"
supabase --version
echo ""

if [[ "$MODE" != "--db-only" ]]; then
  echo "── deploying edge functions ───────────────────────────"
  for fn in "${FUNCTIONS[@]}"; do
    echo "  → ${fn}"
    supabase functions deploy "${fn}"
    echo ""
  done
fi

echo "── applying migrations / grants ──────────────────────"
supabase db push

echo "── deployed functions ────────────────────────────────"
supabase functions list