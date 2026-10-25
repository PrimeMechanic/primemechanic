#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."
export CI=1

npm ci --no-audit --no-fund
npm run check:types
npm run lint
npm run build
npm run server:build

# Database schema changes are deliberately not pushed automatically: review them
# before applying `db:push` so task merges cannot alter existing user data.
