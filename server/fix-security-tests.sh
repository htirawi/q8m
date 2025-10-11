#!/bin/bash

# Fix security.test.ts
sed -i '' \
  -e 's/firstName: payload,$/name: payload,/g' \
  -e 's/lastName: "Test",$/acceptTerms: true,/g' \
  -e 's/firstName: "A".repeat(10000),$/name: "A".repeat(10000),/g' \
  -e 's/firstName: "Test",$/name: "Test User",/g' \
  -e 's/firstName: "Session",$/name: "Session Test",/g' \
  -e 's/firstName: "Test User",$/name: "Password Test",/g' \
  src/tests/security/security.test.ts

echo "Fixed security.test.ts"
