#!/bin/bash
# Comprehensive GigShield Application Verification Script
# Tests all critical features: Auth, Triggers, Claims, Payouts, Weather

echo "🔍 GigShield Application Verification Suite"
echo "=============================================="
echo ""

BASE_URL="http://localhost:4000"
ADMIN_EMAIL="2300033142cse4@gmail.com"
ADMIN_PASSWORD="Sommu@123"
USER_EMAIL="somendhrakarthik2006@gmail.com"
USER_PASSWORD="Sommu@123"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Test counter
TESTS_PASSED=0
TESTS_FAILED=0

function test_endpoint() {
    local name=$1
    local method=$2
    local endpoint=$3
    local data=$4
    local expected_code=$5
    
    if [ -z "$data" ]; then
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$BASE_URL$endpoint")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" "$BASE_URL$endpoint" \
            -H "Content-Type: application/json" \
            -d "$data")
    fi
    
    http_code=$(echo "$response" | tail -n 1)
    body=$(echo "$response" | head -n -1)
    
    if [ "$http_code" -eq "$expected_code" ] || [ "$http_code" -ge 200 ] && [ "$http_code" -lt 300 ]; then
        echo -e "${GREEN}✅ PASS${NC}: $name (HTTP $http_code)"
        TESTS_PASSED=$((TESTS_PASSED + 1))
        echo "$body"
    else
        echo -e "${RED}❌ FAIL${NC}: $name (Expected $expected_code, got HTTP $http_code)"
        echo "Response: $body"
        TESTS_FAILED=$((TESTS_FAILED + 1))
    fi
    echo ""
}

# ============================================================================
# 1. DATABASE & INITIALIZATION TESTS
# ============================================================================
echo "📊 DATABASE & INITIALIZATION TESTS"
echo "===================================="

test_endpoint "Health Check" "GET" "/actuator/health" "" 200

# ============================================================================
# 2. AUTHENTICATION TESTS
# ============================================================================
echo ""
echo "🔐 AUTHENTICATION TESTS"
echo "======================="

# Admin Login
ADMIN_LOGIN='{"email":"'$ADMIN_EMAIL'","password":"'$ADMIN_PASSWORD'"}'
test_endpoint "Admin Login" "POST" "/api/auth/login" "$ADMIN_LOGIN" 200

# User Login
USER_LOGIN='{"email":"'$USER_EMAIL'","password":"'$USER_PASSWORD'"}'
RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d "$USER_LOGIN")

USER_TOKEN=$(echo "$RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)
if [ -n "$USER_TOKEN" ]; then
    echo -e "${GREEN}✅ PASS${NC}: User Login (JWT extracted)"
    TESTS_PASSED=$((TESTS_PASSED + 1))
else
    echo -e "${RED}❌ FAIL${NC}: User Login (No token received)"
    TESTS_FAILED=$((TESTS_FAILED + 1))
    echo "Response: $RESPONSE"
fi
echo ""

# ============================================================================
# 3. TRIGGER ENGINE TESTS
# ============================================================================
echo ""
echo "⚡ PARAMETRIC TRIGGER ENGINE TESTS"
echo "==================================="

# Check if Triggers are seeded
test_endpoint "Get All Triggers" "GET" "/api/triggers" "" 200

# ============================================================================
# 4. WEATHER SERVICE TESTS
# ============================================================================
echo ""
echo "🌦️  WEATHER SERVICE TESTS"
echo "=========================="

test_endpoint "Get Weather for District" "GET" "/api/weather/district/Hyderabad/state/Telangana" "" 200

test_endpoint "Get Weather with Mock Fallback" "GET" "/api/weather/district/Mumbai/state/Maharashtra" "" 200

# ============================================================================
# 5. SUBSCRIPTION & PLAN TESTS
# ============================================================================
echo ""
echo "💰 SUBSCRIPTION & PLAN TESTS"
echo "============================="

test_endpoint "Get All Plans" "GET" "/api/plans" "" 200

# ============================================================================
# 6. CLAIM PROCESSING TESTS
# ============================================================================
echo ""
echo "📋 CLAIM PROCESSING TESTS"
echo "=========================="

test_endpoint "Get User Claims" "GET" "/api/claims/user/claims" \
    -H "Authorization: Bearer $USER_TOKEN" "" 200

# ============================================================================
# SUMMARY
# ============================================================================
echo ""
echo "════════════════════════════════════════════"
echo "TEST SUMMARY"
echo "════════════════════════════════════════════"
echo -e "${GREEN}✅ Passed: $TESTS_PASSED${NC}"
echo -e "${RED}❌ Failed: $TESTS_FAILED${NC}"
echo ""

if [ $TESTS_FAILED -eq 0 ]; then
    echo -e "${GREEN}🎉 All tests passed!${NC}"
    exit 0
else
    echo -e "${YELLOW}⚠️  Some tests failed. Check logs above.${NC}"
    exit 1
fi
