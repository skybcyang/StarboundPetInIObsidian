#!/bin/bash

# Create new feature branch and spec structure
# Usage: create-new-feature.sh [--json] [--number N] [--short-name NAME] "Feature description"

set -e

JSON_OUTPUT=false
NUMBER=""
SHORT_NAME=""
DESCRIPTION=""

# Parse arguments
while [[ $# -gt 0 ]]; do
  case $1 in
    --json|-j)
      JSON_OUTPUT=true
      shift
      ;;
    --number|-n)
      NUMBER="$2"
      shift 2
      ;;
    --short-name|-s)
      SHORT_NAME="$2"
      shift 2
      ;;
    *)
      DESCRIPTION="$1"
      shift
      ;;
  esac
done

if [ -z "$DESCRIPTION" ]; then
  echo "Error: Feature description required"
  exit 1
fi

if [ -z "$NUMBER" ]; then
  echo "Error: Feature number required"
  exit 1
fi

if [ -z "$SHORT_NAME" ]; then
  echo "Error: Short name required"
  exit 1
fi

BRANCH_NAME="${NUMBER}-${SHORT_NAME}"
FEATURE_DIR="specs/${BRANCH_NAME}"
SPEC_FILE="${FEATURE_DIR}/spec.md"
DATE=$(date +%Y-%m-%d)

# Create directory structure
mkdir -p "${FEATURE_DIR}/checklists"

# Create spec from template
if [ -f ".specify/templates/spec-template.md" ]; then
  cp ".specify/templates/spec-template.md" "${SPEC_FILE}"
  # Replace placeholders
  sed -i '' "s/\[FEATURE NAME\]/${DESCRIPTION}/g" "${SPEC_FILE}" 2>/dev/null || sed -i "s/\[FEATURE NAME\]/${DESCRIPTION}/g" "${SPEC_FILE}"
  sed -i '' "s/\[SHORT-NAME\]/${SHORT_NAME}/g" "${SPEC_FILE}" 2>/dev/null || sed -i "s/\[SHORT-NAME\]/${SHORT_NAME}/g" "${SPEC_FILE}"
  sed -i '' "s/\[DATE\]/${DATE}/g" "${SPEC_FILE}" 2>/dev/null || sed -i "s/\[DATE\]/${DATE}/g" "${SPEC_FILE}"
fi

# Output JSON if requested
if [ "$JSON_OUTPUT" = true ]; then
  cat <<EOF
{
  "branch_name": "${BRANCH_NAME}",
  "feature_dir": "${FEATURE_DIR}",
  "spec_file": "${SPEC_FILE}",
  "short_name": "${SHORT_NAME}",
  "number": ${NUMBER},
  "description": "${DESCRIPTION}"
}
EOF
else
  echo "Created feature: ${BRANCH_NAME}"
  echo "Spec file: ${SPEC_FILE}"
fi
