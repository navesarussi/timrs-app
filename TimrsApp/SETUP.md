# 🚀 הוראות הרצה - Timrs App

## דרישות מקדימות

לפני ההרצה, וודא שיש לך:

1. **Android Studio** מותקן ומוגדר
2. **JDK 11 ומעלה**
3. **Node.js 20 ומעלה** (גרסה נוכחית: 20.17.0)
4. **Android SDK** מוגדר

## שלב 1: הכנת הסביבה

### הגדרת משתני סביבה

וודא שמשתני הסביבה הבאים מוגדרים ב-`~/.zshrc` או `~/.bash_profile`:

```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
export PATH=$PATH:$ANDROID_HOME/emulator
export PATH=$PATH:$ANDROID_HOME/platform-tools
```

אחרי העדכון, הרץ:
```bash
source ~/.zshrc
```

## שלב 2: הכנת Emulator או מכשיר אמיתי

### אפשרות א': Emulator

1. פתח Android Studio
2. לחץ על Tools → Device Manager
3. צור או הפעל Emulator קיים (מומלץ: Pixel 5 עם Android 11+)

### אפשרות ב': מכשיר אמיתי

1. הפעל **Developer Options** במכשיר
2. הפעל **USB Debugging**
3. חבר את המכשיר למחשב
4. וודא שהמכשיר מזוהה:
```bash
adb devices
```

## שלב 3: הרצת האפליקציה

### התקנת dependencies (פעם ראשונה)

```bash
cd /Users/navesarussi/timrs/TimrsApp
npm install
```

### הרצה רגילה

פתח **שני טרמינלים**:

**טרמינל 1 - Metro Bundler:**
```bash
cd /Users/navesarussi/timrs/TimrsApp
npm start
```

**טרמינל 2 - Build ו-Install:**
```bash
cd /Users/navesarussi/timrs/TimrsApp
npm run android
```

### הרצה מהירה (כל זה בפקודה אחת)

אם לא רוצה לפתוח שני טרמינלים:
```bash
cd /Users/navesarussi/timrs/TimrsApp && npm run android
```

Metro Bundler יפתח אוטומטית.

## בעיות נפוצות ופתרונות

### 1. "SDK location not found"

הגדר את ANDROID_HOME:
```bash
export ANDROID_HOME=$HOME/Library/Android/sdk
```

### 2. "No connected devices"

וודא ש-Emulator רץ או שמכשיר אמיתי מחובר:
```bash
adb devices
```

### 3. בעיות Cache

נקה cache:
```bash
cd /Users/navesarussi/timrs/TimrsApp
npm start -- --reset-cache
```

או נקה build:
```bash
cd android
./gradlew clean
cd ..
```

### 4. שגיאות Metro Bundler

הרוג תהליכים קיימים:
```bash
killall -9 node
npm start
```

### 5. בעיות עם node_modules

התקן מחדש:
```bash
rm -rf node_modules package-lock.json
npm install
```

## בדיקת בילד

לבדוק שהכל תקין לפני הרצה:

```bash
# בדיקת TypeScript
npx tsc --noEmit

# בדיקת ESLint
npm run lint

# בדיקת Tests (אם יש)
npm test
```

## Hot Reload

לאחר שהאפליקציה רצה:
- **שמירת קובץ** תעדכן אוטומטית את האפליקציה
- **לחיצה כפולה על R** (במכשיר/emulator) תרענן ידנית
- **Shake המכשיר** או **Cmd+M (Emulator)** לפתיחת Dev Menu

## Build לייצור (אופציונלי)

```bash
cd android
./gradlew assembleRelease
```

ה-APK יהיה ב:
```
android/app/build/outputs/apk/release/app-release.apk
```

## סיום

האפליקציה אמורה להיפתח במכשיר/Emulator עם המסך הראשי הריק וכפתור ה-FAB למטה.

**התחל להשתמש:**
1. לחץ על כפתור ➕
2. צור טיימר ראשון
3. ראה אותו סופר בזמן אמת! ⏱️

---

**צריך עזרה?** בדוק את הלוגים:
```bash
npx react-native log-android
```

