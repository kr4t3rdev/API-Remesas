#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")/.."

for required in sdks/swift/Package.swift sdks/kotlin/build.gradle sdks/kotlin/gradlew; do
  if ! git ls-files --error-unmatch "$required" >/dev/null 2>&1; then
    echo "ERROR: $required is not tracked. Generate and commit the native SDKs first." >&2
    exit 1
  fi
done

# `git diff` ignores untracked files, so inspect both tracked changes and
# untracked generated files. Build outputs are excluded by SDK .gitignore.
if [[ -n "$(git status --porcelain -- sdks/swift sdks/kotlin)" ]]; then
  echo "ERROR: generated Swift/Kotlin SDKs drift from the committed contract." >&2
  git status --short -- sdks/swift sdks/kotlin >&2
  echo "Run npm run sdk:native:generate and commit the regenerated SDKs." >&2
  exit 1
fi

echo "OK: generated Swift/Kotlin SDKs match the committed contract."
