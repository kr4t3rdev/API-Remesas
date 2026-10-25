#!/usr/bin/env bash
set -euo pipefail

# Negative control for task 2.17: an intentionally empty API must be rejected
# as a breaking revision. This proves the oasdiff CI gate is capable of failing,
# not merely configured to run.
cd "$(dirname "$0")/.."

if ! command -v oasdiff >/dev/null 2>&1; then
  echo "ERROR: oasdiff is required (CI installs the pinned version before this check)." >&2
  exit 2
fi

set +e
output="$(oasdiff breaking openapi.json test/fixtures/openapi-breaking-empty.json --fail-on ERR 2>&1)"
status=$?
set -e

if [[ "$status" -eq 0 ]]; then
  echo "ERROR: oasdiff accepted a deliberately empty API revision." >&2
  exit 1
fi

if ! grep -q 'api-path-removed-without-deprecation' <<<"$output"; then
  echo "ERROR: oasdiff failed for an unexpected reason; expected a removed-path breaking change." >&2
  printf '%s\n' "$output" >&2
  exit 1
fi

echo "OK: oasdiff rejected the intentional breaking fixture (exit $status)."
