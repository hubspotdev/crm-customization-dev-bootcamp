#!/usr/bin/env bash
# Refresh knowledge/ from hs-uix-studio (apps/worker/knowledge).
# Usage: .claude/skills/hubspot-card-design/scripts/sync-knowledge.sh [git-ref]
set -euo pipefail

REF="${1:-main}"
SKILL_DIR="$(cd "$(dirname "$0")/.." && pwd)"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

git clone --quiet --depth 1 --branch "$REF" https://github.com/05bmckay/hs-uix-studio "$TMP/studio"
SRC="$TMP/studio/apps/worker/knowledge"

rm -rf "$SKILL_DIR/knowledge"
mkdir -p "$SKILL_DIR/knowledge"
cp -R "$SRC/standards" "$SRC/blocks" "$SRC/examples" "$SKILL_DIR/knowledge/"
rm -f "$SKILL_DIR/knowledge/standards/COPIED_FROM.md"
cp "$TMP/studio/LICENSE" "$SKILL_DIR/knowledge/LICENSE"

echo "Synced knowledge from hs-uix-studio@$(git -C "$TMP/studio" rev-parse --short HEAD)"
