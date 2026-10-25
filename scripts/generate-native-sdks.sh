#!/usr/bin/env bash
set -euo pipefail

# Generate native SDKs from the same committed OpenAPI contract used by CI.
# Generated source is committed for reviewability, but never edited by hand.

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"
GEN="./node_modules/.bin/openapi-generator-cli"

if [[ ! -x "$GEN" ]]; then
  echo "ERROR: OpenAPI Generator CLI missing; run npm ci first." >&2
  exit 1
fi

"$GEN" generate \
  --input-spec openapi.json \
  --generator-name swift5 \
  --output sdks/swift \
  --additional-properties=projectName=CashflowAPI,useSPMFileStructure=true \
  --global-property=apiDocs=false,modelDocs=false,apiTests=false,modelTests=false

"$GEN" generate \
  --input-spec openapi.json \
  --generator-name kotlin \
  --output sdks/kotlin \
  --additional-properties=packageName=com.cashflow.api,library=jvm-okhttp4,serializationLibrary=moshi,dateLibrary=java8 \
  --global-property=apiDocs=false,modelDocs=false,apiTests=false,modelTests=false

# OpenAPI Generator emits a non-executable wrapper and hardcodes repo1.maven.org.
# Normalize the wrapper/build for Unix CI, resilient downloads, and Maven Central.
chmod +x sdks/kotlin/gradlew
python3 - <<'PY'
from pathlib import Path
p = Path('sdks/kotlin/gradle/wrapper/gradle-wrapper.properties')
s = p.read_text()
s = s.replace('networkTimeout=10000', 'networkTimeout=600000')
s = s.replace('networkTimeout=120000', 'networkTimeout=600000')
s = s.replace('-all.zip', '-bin.zip')
p.write_text(s)

p = Path('sdks/kotlin/build.gradle')
s = p.read_text().replace('maven { url "https://repo1.maven.org/maven2" }', 'mavenCentral()')
p.write_text(s)

p = Path('sdks/kotlin/gradle.properties')
p.write_text('''org.gradle.jvmargs=-Xmx2g -Dfile.encoding=UTF-8
org.gradle.parallel=true
systemProp.org.gradle.internal.http.connectionTimeout=120000
systemProp.org.gradle.internal.http.socketTimeout=600000
systemProp.org.gradle.internal.repository.max.retries=3
''')
PY

cat > sdks/swift/.gitignore <<'EOF'
.build/
.swiftpm/
.DS_Store
EOF
cat > sdks/kotlin/.gitignore <<'EOF'
.gradle/
build/
.DS_Store
EOF

echo "Generated Swift and Kotlin SDKs from API/openapi.json"
