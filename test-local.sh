#!/bin/bash

# Test Local Development Environment
# This script tests all endpoints and generates a test report

echo "======================================"
echo "🧪 LOKAL TEST RAPORU"
echo "======================================"
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
PASSED=0
FAILED=0

test_endpoint() {
    local name=$1
    local url=$2
    local expected=$3

    echo -n "Testing ${name}... "

    response=$(curl -s "${url}")

    if echo "${response}" | grep -q "${expected}"; then
        echo -e "${GREEN}✓ PASS${NC}"
        ((PASSED++))
    else
        echo -e "${RED}✗ FAIL${NC}"
        echo "  Expected: ${expected}"
        echo "  Got: ${response}"
        ((FAILED++))
    fi
}

echo "1️⃣ Health Checks"
echo "─────────────────"
test_endpoint "Mock API Health" "http://localhost:3001/health" '"status":"ok"'
test_endpoint "Frontend Health" "http://localhost:3000/" "DOCTYPE html"
echo ""

echo "2️⃣ Login Tests"
echo "─────────────────"

# Correct PIN
echo -n "Testing correct PIN... "
response=$(curl -s -X POST http://localhost:3001/webhook/login \
  -H "Content-Type: application/json" \
  -d '{"sube":"merkez","pin":"123456"}')

if echo "${response}" | grep -q '"success":true'; then
    echo -e "${GREEN}✓ PASS${NC}"
    TOKEN=$(echo "${response}" | python3 -c "import sys, json; print(json.load(sys.stdin)['token'])")
    echo "  Token: ${TOKEN:0:30}..."
    ((PASSED++))
else
    echo -e "${RED}✗ FAIL${NC}"
    ((FAILED++))
fi

# Wrong PIN
echo -n "Testing wrong PIN... "
response=$(curl -s -X POST http://localhost:3001/webhook/login \
  -H "Content-Type: application/json" \
  -d '{"sube":"merkez","pin":"999999"}')

if echo "${response}" | grep -q '"success":false'; then
    echo -e "${GREEN}✓ PASS${NC}"
    ((PASSED++))
else
    echo -e "${RED}✗ FAIL${NC}"
    ((FAILED++))
fi

echo ""

echo "3️⃣ Voice Recording Test"
echo "─────────────────────────"

echo "test audio" > /tmp/test.webm

echo -n "Testing voice upload... "
response=$(curl -s -X POST http://localhost:3001/webhook/ses-kayit \
  -H "Authorization: Bearer ${TOKEN}" \
  -F "file=@/tmp/test.webm" \
  -F "sube=merkez")

if echo "${response}" | grep -q '"success":true'; then
    echo -e "${GREEN}✓ PASS${NC}"

    # Extract product count
    product_count=$(echo "${response}" | python3 -c "import sys, json; print(len(json.load(sys.stdin)['products']))" 2>/dev/null || echo "?")
    echo "  Products extracted: ${product_count}"
    ((PASSED++))
else
    echo -e "${RED}✗ FAIL${NC}"
    ((FAILED++))
fi

echo ""

echo "4️⃣ Frontend Files"
echo "─────────────────────"

files=("index.html" "app.js" "styles.css" "manifest.json" "sw.js")

for file in "${files[@]}"; do
    echo -n "Checking ${file}... "
    if curl -s -f "http://localhost:3000/${file}" > /dev/null; then
        echo -e "${GREEN}✓ EXISTS${NC}"
        ((PASSED++))
    else
        echo -e "${RED}✗ MISSING${NC}"
        ((FAILED++))
    fi
done

echo ""

echo "======================================"
echo "📊 TEST SONUÇLARI"
echo "======================================"
echo -e "${GREEN}Başarılı: ${PASSED}${NC}"
echo -e "${RED}Başarısız: ${FAILED}${NC}"
echo "Toplam: $((PASSED + FAILED))"
echo ""

if [ ${FAILED} -eq 0 ]; then
    echo -e "${GREEN}✅ TÜM TESTLER BAŞARILI!${NC}"
    echo ""
    echo "🌐 Tarayıcıda test için:"
    echo "   http://localhost:3000"
    echo ""
    echo "📋 Giriş bilgileri:"
    echo "   Şube: Merkez Şube"
    echo "   PIN: 123456"
    exit 0
else
    echo -e "${RED}❌ BAZI TESTLER BAŞARISIZ${NC}"
    exit 1
fi
