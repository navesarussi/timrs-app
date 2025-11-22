#!/bin/bash

# סקריפט בדיקת חיבור Firebase מהטלפון
# מאת: TimrsApp Diagnostics v1.0

echo "=================================="
echo "🔍 בדיקת חיבור Firebase מהטלפון"
echo "=================================="
echo ""

# צבעים
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# פונקציית בדיקה
check_item() {
    local status=$1
    local message=$2
    
    if [ "$status" == "ok" ]; then
        echo -e "${GREEN}✅${NC} $message"
    elif [ "$status" == "warning" ]; then
        echo -e "${YELLOW}⚠️${NC}  $message"
    else
        echo -e "${RED}❌${NC} $message"
    fi
}

# 1. בדיקת SHA-1
echo -e "${BLUE}📋 בדיקה 1: SHA-1 Fingerprint${NC}"
echo "-----------------------------------"
cd android 2>/dev/null

if [ -f "gradlew" ]; then
    echo "מחלץ SHA-1 fingerprint..."
    SHA1=$(./gradlew signingReport 2>/dev/null | grep "SHA1:" | head -n 1 | awk '{print $2}')
    
    if [ ! -z "$SHA1" ]; then
        check_item "ok" "SHA-1 נמצא: $SHA1"
        echo ""
        echo -e "${YELLOW}📝 הוראות:${NC}"
        echo "1. עבור אל https://console.firebase.google.com"
        echo "2. בחר בפרויקט timrs-app"
        echo "3. לחץ על ⚙️ Project Settings"
        echo "4. גלול ל-Your apps > com.timrsapp"
        echo "5. לחץ Add fingerprint והדבק:"
        echo -e "   ${GREEN}$SHA1${NC}"
        echo "6. לחץ Save"
    else
        check_item "error" "לא הצלחתי לחלץ SHA-1"
    fi
else
    check_item "error" "קובץ gradlew לא נמצא"
fi

cd ..
echo ""

# 2. בדיקת google-services.json
echo -e "${BLUE}📄 בדיקה 2: קובץ google-services.json${NC}"
echo "-----------------------------------"

if [ -f "android/app/google-services.json" ]; then
    check_item "ok" "קובץ google-services.json קיים"
    
    PROJECT_ID=$(grep -o '"project_id": "[^"]*"' android/app/google-services.json | cut -d'"' -f4)
    PACKAGE_NAME=$(grep -o '"package_name": "[^"]*"' android/app/google-services.json | cut -d'"' -f4)
    
    if [ "$PROJECT_ID" == "timrs-app" ]; then
        check_item "ok" "Project ID: $PROJECT_ID ✓"
    else
        check_item "warning" "Project ID: $PROJECT_ID (בדוק שזה נכון)"
    fi
    
    if [ "$PACKAGE_NAME" == "com.timrsapp" ]; then
        check_item "ok" "Package Name: $PACKAGE_NAME ✓"
    else
        check_item "error" "Package Name לא תואם: $PACKAGE_NAME"
    fi
else
    check_item "error" "קובץ google-services.json לא נמצא!"
    echo "   הורד אותו מ-Firebase Console"
fi

echo ""

# 3. בדיקת הרשאות
echo -e "${BLUE}🔐 בדיקה 3: הרשאות AndroidManifest${NC}"
echo "-----------------------------------"

if [ -f "android/app/src/main/AndroidManifest.xml" ]; then
    if grep -q "android.permission.INTERNET" android/app/src/main/AndroidManifest.xml; then
        check_item "ok" "הרשאת INTERNET קיימת"
    else
        check_item "error" "הרשאת INTERNET חסרה!"
    fi
else
    check_item "error" "AndroidManifest.xml לא נמצא"
fi

echo ""

# 4. בדיקת build.gradle
echo -e "${BLUE}⚙️  בדיקה 4: הגדרות Firebase ב-build.gradle${NC}"
echo "-----------------------------------"

if [ -f "android/app/build.gradle" ]; then
    if grep -q "com.google.gms.google-services" android/app/build.gradle; then
        check_item "ok" "Plugin של google-services מוגדר"
    else
        check_item "error" "Plugin של google-services חסר!"
    fi
    
    if grep -q "firebase-bom" android/app/build.gradle; then
        check_item "ok" "Firebase BoM מוגדר"
    else
        check_item "warning" "Firebase BoM לא נמצא (אולי בסדר)"
    fi
else
    check_item "error" "build.gradle לא נמצא"
fi

echo ""

# 5. בדיקת חיבור מכשיר
echo -e "${BLUE}📱 בדיקה 5: חיבור למכשיר${NC}"
echo "-----------------------------------"

if command -v adb &> /dev/null; then
    DEVICES=$(adb devices | grep -v "List" | grep "device$" | wc -l)
    
    if [ $DEVICES -gt 0 ]; then
        check_item "ok" "מכשיר מחובר ($DEVICES מכשירים)"
        
        # בדיקת חיבור לאינטרנט במכשיר
        echo ""
        echo "בודק חיבור לאינטרנט במכשיר..."
        PING_RESULT=$(adb shell ping -c 1 8.8.8.8 2>/dev/null | grep "1 packets transmitted" | grep "1 received" || echo "failed")
        
        if [ "$PING_RESULT" != "failed" ]; then
            check_item "ok" "המכשיר מחובר לאינטרנט"
        else
            check_item "error" "המכשיר לא מחובר לאינטרנט!"
        fi
    else
        check_item "warning" "אין מכשיר מחובר (או שהוא לא במצב debug)"
        echo "   חבר את הטלפון והפעל USB Debugging"
    fi
else
    check_item "warning" "ADB לא מותקן"
fi

echo ""

# 6. בדיקת לוגים אחרונים
echo -e "${BLUE}📊 בדיקה 6: לוגים אחרונים (אם האפליקציה רצה)${NC}"
echo "-----------------------------------"

if command -v adb &> /dev/null && [ $DEVICES -gt 0 ]; then
    echo "מחפש שגיאות Firebase בלוגים האחרונים..."
    
    # ניקוי לוגים ישנים
    adb logcat -c 2>/dev/null
    
    echo "הרץ את האפליקציה על הטלפון ואז לחץ Enter..."
    echo "(או לחץ Ctrl+C לדלג)"
    read -t 10 dummy
    
    # קריאת לוגים אחרונים
    LOGS=$(adb logcat -d -s ReactNativeJS:* 2>/dev/null | grep -E "(Firebase|Sync)" | tail -20)
    
    if [ ! -z "$LOGS" ]; then
        echo ""
        echo "לוגים אחרונים:"
        echo "---------------"
        echo "$LOGS" | while read line; do
            if echo "$line" | grep -q "error\|Error\|ERROR\|failed\|Failed"; then
                echo -e "${RED}$line${NC}"
            elif echo "$line" | grep -q "success\|Success\|initialized"; then
                echo -e "${GREEN}$line${NC}"
            else
                echo "$line"
            fi
        done
    else
        check_item "warning" "לא נמצאו לוגים (אולי האפליקציה לא רצה עדיין)"
    fi
else
    check_item "warning" "לא ניתן לבדוק לוגים ללא מכשיר מחובר"
fi

echo ""
echo "=================================="
echo -e "${BLUE}📝 סיכום והמלצות${NC}"
echo "=================================="
echo ""

echo -e "${YELLOW}פעולות שכדאי לבצע:${NC}"
echo ""
echo "1. וודא שAnonymous Authentication מופעל ב-Firebase Console:"
echo "   https://console.firebase.google.com/project/timrs-app/authentication/providers"
echo ""
echo "2. וודא שFirestore Rules מאפשרות גישה:"
echo "   https://console.firebase.google.com/project/timrs-app/firestore/rules"
echo ""
echo "3. צפה בלוגים בזמן אמת:"
echo "   npx react-native log-android"
echo ""
echo "4. קרא את המדריך המפורט:"
echo "   cat PHONE_DEBUG.md"
echo ""

echo -e "${GREEN}בהצלחה! 🚀${NC}"

