#!/bin/bash
# סקריפט בדיקת התחברות Firebase

echo "🔍 בדיקת התחברות Firebase"
echo "=========================="
echo ""

# צבעים
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}📱 צופה בלוגים של האפליקציה...${NC}"
echo "חפש את השורות הבאות:"
echo ""
echo -e "${GREEN}✓ [FirebaseService] Initialized successfully${NC}"
echo -e "${GREEN}✓ [FirebaseService] ✅ Signed in anonymously successfully${NC}"
echo -e "${GREEN}✓ [SyncService] Firebase ready with user${NC}"
echo ""
echo -e "${RED}אם אתה רואה שגיאות:${NC}"
echo -e "${YELLOW}❌ [auth/configuration-not-found]${NC} → Authentication לא מופעל"
echo -e "${YELLOW}❌ PERMISSION_DENIED${NC} → Rules לא נכונים"
echo ""
echo "=========================="
echo ""

# נקה לוגים ישנים
adb logcat -c 2>/dev/null || echo "לא ניתן לנקות לוגים (אולי adb לא זמין)"

# צפה בלוגים
adb logcat | grep --line-buffered -E '\[Firebase|\[Sync|\[App\]|ERROR|FATAL|auth/' | while read line; do
  if echo "$line" | grep -q "Signed in anonymously successfully"; then
    echo -e "${GREEN}✅ $line${NC}"
  elif echo "$line" | grep -q "Initialized successfully"; then
    echo -e "${GREEN}✅ $line${NC}"
  elif echo "$line" | grep -q "ERROR\|FATAL\|failed"; then
    echo -e "${RED}❌ $line${NC}"
  elif echo "$line" | grep -q "auth/"; then
    echo -e "${YELLOW}⚠️  $line${NC}"
  else
    echo "$line"
  fi
done

