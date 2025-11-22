#!/bin/bash
# תסריט בדיקות Firebase ל-TimrsApp

echo "🔍 תסריט בדיקות Firebase"
echo "=========================="
echo ""

# צבעים
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# בדיקה 1: google-services.json
echo "1️⃣ בדיקת google-services.json..."
if [ -f "android/app/google-services.json" ]; then
    echo -e "${GREEN}✓ google-services.json קיים${NC}"
    PROJECT_ID=$(grep -o '"project_id": "[^"]*' android/app/google-services.json | cut -d'"' -f4)
    echo "   Project ID: $PROJECT_ID"
else
    echo -e "${RED}✗ google-services.json לא נמצא!${NC}"
fi
echo ""

# בדיקה 2: Firebase config
echo "2️⃣ בדיקת firebase.config.ts..."
if grep -q "enabled: true" src/config/firebase.config.ts; then
    echo -e "${GREEN}✓ Firebase מופעל בקונפיג${NC}"
else
    echo -e "${YELLOW}⚠ Firebase כבוי בקונפיג${NC}"
fi
echo ""

# בדיקה 3: Gradle
echo "3️⃣ בדיקת הגדרות Gradle..."
if grep -q "google-services" android/build.gradle; then
    echo -e "${GREEN}✓ Google Services plugin נמצא ב-build.gradle${NC}"
else
    echo -e "${RED}✗ Google Services plugin חסר!${NC}"
fi

if grep -q "com.google.gms.google-services" android/app/build.gradle; then
    echo -e "${GREEN}✓ Google Services plugin מופעל ב-app/build.gradle${NC}"
else
    echo -e "${RED}✗ Google Services plugin לא מופעל!${NC}"
fi
echo ""

# בדיקה 4: חבילות Firebase
echo "4️⃣ בדיקת חבילות Firebase..."
if [ -d "node_modules/@react-native-firebase/app" ]; then
    echo -e "${GREEN}✓ @react-native-firebase/app מותקן${NC}"
    VERSION=$(node -p "require('./node_modules/@react-native-firebase/app/package.json').version")
    echo "   גרסה: $VERSION"
else
    echo -e "${RED}✗ @react-native-firebase/app לא מותקן!${NC}"
fi

if [ -d "node_modules/@react-native-firebase/firestore" ]; then
    echo -e "${GREEN}✓ @react-native-firebase/firestore מותקן${NC}"
else
    echo -e "${RED}✗ @react-native-firebase/firestore לא מותקן!${NC}"
fi

if [ -d "node_modules/@react-native-firebase/auth" ]; then
    echo -e "${GREEN}✓ @react-native-firebase/auth מותקן${NC}"
else
    echo -e "${RED}✗ @react-native-firebase/auth לא מותקן!${NC}"
fi
echo ""

# בדיקה 5: APK
echo "5️⃣ בדיקת APK..."
if [ -f "android/app/build/outputs/apk/debug/app-debug.apk" ]; then
    SIZE=$(du -h android/app/build/outputs/apk/debug/app-debug.apk | cut -f1)
    echo -e "${GREEN}✓ APK נבנה בהצלחה${NC}"
    echo "   גודל: $SIZE"
    DATE=$(stat -f "%Sm" -t "%Y-%m-%d %H:%M:%S" android/app/build/outputs/apk/debug/app-debug.apk)
    echo "   תאריך: $DATE"
else
    echo -e "${YELLOW}⚠ APK לא נמצא - צריך לבנות${NC}"
fi
echo ""

# בדיקה 6: Java Version
echo "6️⃣ בדיקת Java..."
if [ -n "$JAVA_HOME" ]; then
    JAVA_VERSION=$($JAVA_HOME/bin/java -version 2>&1 | head -1)
    echo -e "${GREEN}✓ JAVA_HOME מוגדר${NC}"
    echo "   $JAVA_VERSION"
    if [[ "$JAVA_VERSION" == *"17"* ]]; then
        echo -e "${GREEN}✓ Java 17 - מעולה!${NC}"
    else
        echo -e "${YELLOW}⚠ לא Java 17 - מומלץ להשתמש ב-Java 17${NC}"
        echo "   הרץ: export JAVA_HOME=/Library/Java/JavaVirtualMachines/temurin-17.jdk/Contents/Home"
    fi
else
    echo -e "${YELLOW}⚠ JAVA_HOME לא מוגדר${NC}"
    echo "   הרץ: export JAVA_HOME=/Library/Java/JavaVirtualMachines/temurin-17.jdk/Contents/Home"
fi
echo ""

# סיכום
echo "=========================="
echo "📊 סיכום:"
echo "   כדי להריץ את האפליקציה עם Firebase:"
echo "   1. export JAVA_HOME=/Library/Java/JavaVirtualMachines/temurin-17.jdk/Contents/Home"
echo "   2. npm run android"
echo ""
echo "   כדי לראות לוגים:"
echo "   npx react-native log-android | grep -E 'Firebase|Sync|Network'"
echo ""

