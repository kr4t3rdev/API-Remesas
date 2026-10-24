#!/usr/bin/env bash
#
# Contract drift check for the OpenAPI contract.
#
# `git diff --exit-code -- openapi.json` exits 0 when openapi.json is not
# tracked by git, because git diff ignores untracked files entirely. That
# makes the naive check pass vacuously: the contract could be missing from
# the repository and CI would still be green.
#
# This script fails loudly in that case, then regenerates the contract and
# verifies that the committed artifact matches the current code.
#
# Fase 2 del plan de clientes nativos (openapi-contract / contract-testing).
#
# Run with: npm run openapi:check
set -euo pipefail

cd "$(dirname "$0")/.."

CONTRACT="openapi.json"

if ! git ls-files --error-unmatch "$CONTRACT" >/dev/null 2>&1; then
  echo "ERROR: $CONTRACT is not tracked by git." >&2
  echo "The drift check cannot verify anything until the contract is committed," >&2
  echo "and the generated SDKs would have no published contract to build from." >&2
  echo "Run: git add $CONTRACT" >&2
  exit 1
fi

echo "==> Regenerating $CONTRACT from the current code (no database)"
npm run --silent openapi:export

echo "==> Comparing the regenerated contract against the committed one"
if ! git diff --exit-code -- "$CONTRACT"; then
  echo "ERROR: $CONTRACT is out of date with the backend code." >&2
  echo "Commit the regenerated contract so clients build from an accurate SDK." >&2
  exit 1
fi

echo "OK: $CONTRACT matches the backend code."
