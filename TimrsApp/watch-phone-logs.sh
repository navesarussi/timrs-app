#!/bin/bash

# סקריפט לצפייה בלוגים מהטלפון

echo "📱 מציג לוגים מהטלפון..."
echo "=================================="
echo ""
echo "חפש שורות עם:"
echo "  ✅ = הצלחה"
echo "  ❌ = שגיאה"
echo "  [FirebaseService] = פעולות Firebase"
echo "  [SyncService] = פעולות סנכרון"
echo ""
echo "לעצירה: Ctrl+C"
echo "=================================="
echo ""

# אם יש מכשיר ספציפי, השתמש בו
PHONE_ID="RFCW50Y2HET"  # הטלפון הפיזי

npx react-native log-android 2>&1 | grep --line-buffered -E "Firebase|Sync|ERROR|failed|success|authenticated"

