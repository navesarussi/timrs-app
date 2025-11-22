#!/bin/bash

# סקריפט בדיקה מהירה לפני הרצה

echo "🔍 בדיקת הפרויקט Timrs App"
echo "==============================="
echo ""

# בדיקת Node version
echo "📦 בדיקת Node.js..."
NODE_VERSION=$(node -v)
echo "   ✓ Node version: $NODE_VERSION"
echo ""

# בדיקת npm
echo "📦 בדיקת npm..."
NPM_VERSION=$(npm -v)
echo "   ✓ npm version: $NPM_VERSION"
echo ""

# בדיקת TypeScript
echo "🔷 בדיקת TypeScript..."
npx tsc --noEmit
if [ $? -eq 0 ]; then
    echo "   ✓ TypeScript: אין שגיאות"
else
    echo "   ✗ TypeScript: יש שגיאות!"
    exit 1
fi
echo ""

# בדיקת ESLint
echo "🔍 בדיקת ESLint..."
npm run lint > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "   ✓ ESLint: אין שגיאות"
else
    echo "   ✗ ESLint: יש שגיאות!"
    npm run lint
    exit 1
fi
echo ""

# בדיקת קבצים קריטיים
echo "📁 בדיקת קבצים קריטיים..."
FILES=(
    "src/types/index.ts"
    "src/services/StorageService.ts"
    "src/services/TimerService.ts"
    "src/components/TimerCard.tsx"
    "src/components/TimerForm.tsx"
    "src/screens/HomeScreen.tsx"
    "App.tsx"
)

for file in "${FILES[@]}"; do
    if [ -f "$file" ]; then
        echo "   ✓ $file"
    else
        echo "   ✗ $file - לא נמצא!"
        exit 1
    fi
done
echo ""

# בדיקת node_modules
echo "📦 בדיקת dependencies..."
if [ -d "node_modules" ]; then
    echo "   ✓ node_modules קיים"
    
    # בדיקת חבילות קריטיות
    PACKAGES=(
        "@react-native-async-storage/async-storage"
        "react-native-vector-icons"
    )
    
    for package in "${PACKAGES[@]}"; do
        if [ -d "node_modules/$package" ]; then
            echo "   ✓ $package"
        else
            echo "   ✗ $package - לא מותקן!"
            echo "   → הרץ: npm install"
            exit 1
        fi
    done
else
    echo "   ✗ node_modules לא קיים!"
    echo "   → הרץ: npm install"
    exit 1
fi
echo ""

# בדיקת Android
echo "🤖 בדיקת Android..."
if [ -d "android" ]; then
    echo "   ✓ תיקיית android קיימת"
    if [ -f "android/app/build.gradle" ]; then
        echo "   ✓ build.gradle קיים"
    else
        echo "   ✗ build.gradle לא נמצא!"
    fi
else
    echo "   ✗ תיקיית android לא קיימת!"
fi
echo ""

# סיכום
echo "==============================="
echo "✅ כל הבדיקות עברו בהצלחה!"
echo ""
echo "🚀 מוכן להרצה:"
echo "   npm run android"
echo ""

