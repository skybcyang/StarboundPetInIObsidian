#!/bin/bash

# Setup plan environment
# Usage: setup-plan.sh [--json]

set -e

JSON_OUTPUT=false

while [[ $# -gt 0 ]]; do
  case $1 in
    --json|-j)
      JSON_OUTPUT=true
      shift
      ;;
    *)
      shift
      ;;
  esac
done

# Find the feature spec
FEATURE_SPEC=$(find specs -name "spec.md" | head -1)
SPECS_DIR=$(dirname "$FEATURE_SPEC")
BRANCH=$(basename "$SPECS_DIR")
IMPL_PLAN="${SPECS_DIR}/plan.md"

# Copy template if plan doesn't exist
if [ ! -f "$IMPL_PLAN" ]; then
  if [ -f ".specify/templates/plan-template.md" ]; then
    cp ".specify/templates/plan-template.md" "$IMPL_PLAN"
    # Replace placeholders
    DATE=$(date +%Y-%m-%d)
    sed -i '' "s/\[DATE\]/${DATE}/g" "$IMPL_PLAN" 2>/dev/null || sed -i "s/\[DATE\]/${DATE}/g" "$IMPL_PLAN"
    sed -i '' "s/\[FEATURE NAME\]/Implementation Plan/g" "$IMPL_PLAN" 2>/dev/null || sed -i "s/\[FEATURE NAME\]/Implementation Plan/g" "$IMPL_PLAN"
    sed -i '' "s/\[SHORT-NAME\]/${BRANCH}/g" "$IMPL_PLAN" 2>/dev/null || sed -i "s/\[SHORT-NAME\]/${BRANCH}/g" "$IMPL_PLAN"
  fi
fi

if [ "$JSON_OUTPUT" = true ]; then
  cat <<EOF
{
  "feature_spec": "${FEATURE_SPEC}",
  "impl_plan": "${IMPL_PLAN}",
  "specs_dir": "${SPECS_DIR}",
  "branch": "${BRANCH}"
}
EOF
else
  echo "Feature spec: ${FEATURE_SPEC}"
  echo "Impl plan: ${IMPL_PLAN}"
  echo "Specs dir: ${SPECS_DIR}"
  echo "Branch: ${BRANCH}"
fi
