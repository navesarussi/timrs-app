#!/bin/bash
# סקריפט לצפייה בלוגים של Firebase וSync

echo "🔍 צופה בלוגים של Firebase ו-Sync..."
echo "לחץ Ctrl+C להפסקה"
echo ""

# פילטר לוגים רלבנטיים
adb logcat -c  # נקה לוגים ישנים
adb logcat | grep --line-buffered -E '\[App\]|\[Firebase|\[Sync|\[Network|ReactNativeJS|ERROR|FATAL'

