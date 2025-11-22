# Changelog

כל השינויים המשמעותיים בפרויקט Timrs יתועדו כאן.

## [2.2.2] - 2025-11-22

### 📚 מדריכים ותיעוד
- **מדריך Firebase Console** - הוספת 3 מדריכים מקיפים להבנת מבנה הנתונים:
  - `למה_לא_רואים_טיימרים.md` - מדריך עברית מקוצר למשתמשים
  - `QUICK_FIREBASE_CHECK.md` - צ'קליסט מהירה לבדיקת בעיות
  - `DEBUG_FIREBASE_CONSOLE.md` - מדריך מפורט לניפוי שגיאות
- **הסבר מבנה Firestore** - הבנה ברורה של sub-collections והיררכיית הנתונים

### ✨ שיפורי UI/UX
- **שיפור תצוגת Firebase Status** - בSettingsScreen:
  - הוספת אינדיקטור "אותחל" לבדיקת מצב Firebase
  - כפתור חדש "🔍 הצג User ID המלא" להצגת ה-ID המלא
  - הצגת User ID בפורמט קצר: `AbCd1234...XyZ9`
  - טיפס מידע מפורט איך לנווט ב-Firebase Console
  - אזהרות כשFirebase לא מאותחל או אין משתמש מחובר

### 🛠️ כלי Debug
- **סקריפט Debug Firebase** - `debug-firebase.sh` לניטור לוגים בזמן אמת:
  - צבעים ללוגים (ירוק להצלחות, אדום לשגיאות)
  - סינון אוטומטי ללוגים רלוונטיים (Firebase, Sync)
  - זיהוי אוטומטי של אירועים קריטיים

### 💡 שיפורי קוד
- הוספת סגנון `secondaryButton` ל-SettingsScreen
- שיפור הודעות המשוב למשתמש
- הרחבת מידע ב-Firebase section

## [2.2.1] - 2025-11-22

### 🐛 תיקוני באגים קריטיים
- **תיקון שגיאת TurboModuleRegistry באימולטור** - שגיאה "Invariant Violation: TurboMo..." בעת הוספת טיימרים
  - הפרדה בין שמירה מקומית לסנכרון ענן
  - מימוש אמיתי של Offline-First approach
  - כל פעולות השמירה ב-StorageService לא נחסמות יותר על ידי כשלון סנכרון
  - הוספת try-catch nested לכל פעולות הסנכרון ב:
    - `addTimer`
    - `updateTimer`
    - `deleteTimer`
    - `saveGlobalStats`
    - `saveResetLog`
    - `saveRecordBreak`
    - `saveBugReport`
  - הצגת אזהרה בקונסול במקום זריקת שגיאה בעת כשלון סנכרון
  - הסנכרון יתבצע מאוחר יותר דרך תור הסנכרון

### 💡 הסבר טכני
- הבעיה הייתה שכאשר Firebase לא מאותחל כראוי (למשל באימולטור בלי הגדרות Firebase תקינות), כל ניסיון לשמור טיימר היה נכשל
- הפתרון: שמירה מקומית תמיד מצליחה, והסנכרון לענן מתבצע ברקע ללא חסימה
- אם הסנכרון נכשל, הפריט נשאר בתור ויסונכרן אוטומטית כשהחיבור יחזור

## [2.2.0] - 2025-11-22

### 🔧 כלי פיתוח
- **מדריך Debug מקיף** - הוספת `DEBUG_GUIDE.md` עם הוראות מפורטות
  - כלי Debug: Flipper, Chrome DevTools, React Native Debugger
  - פקודות ADB שימושיות
  - טיפים למציאת באגים
  - בדיקות Firebase, AsyncStorage, Network
- **סקריפטים חדשים ב-package.json**
  - `android:debug` - הרצה במצב debug מפורש
  - `android:clean` - ניקוי build
  - `start:reset` - ניקוי cache של Metro
  - `logs` - צפייה בלוגים מפולטרים
  - `reverse` - חיבור פורטים למכשיר פיזי

### 🐛 תיקוני באגים קריטיים
- **תיקון אי-התאמת גרסאות** - עדכון הגרסה ב-SettingsScreen ל-2.2.0 (הייתה 2.1.0)
- **תיקון Race Condition ב-SyncService** - נעילה מיידית של `isSyncing` למניעת סנכרון כפול
  - הוספת try-finally block להבטחת שחרור נעילה
  - שיפור יציבות הסנכרון
- **שיפור טיפול בשגיאות Firebase**
  - הוספת try-catch לאתחול Firestore settings
  - שימוש ב-`Promise.allSettled` במקום `Promise.all` במחיקה מלאה
  - מניעת איבוד נתונים במקרה של כשלון חלקי
  - הודעות warning מפורטות על כשלונות
- **שיפור UX ב-CustomResetDialog**
  - הוספת הצגת הודעות שגיאה ידידותיות למשתמש
  - ניקוי אוטומטי של שגיאות בעת שינוי ערכים
  - validation משופר עם משוב מיידי
- **תיקון TypeScript** - תיקון קריאה ל-`globalStatsDoc.exists()` (הייתה property במקום method)

### ✨ שיפורים
- **דיווח על באגים** - מערכת מלאה לדיווח על באגים במסך ההגדרות
  - שמירה מקומית ב-AsyncStorage
  - סנכרון אוטומטי ל-Firebase
  - שדות מלאים: תיאור, זמן, גרסת אפליקציה, מידע מכשיר
  - תור סנכרון עם retry mechanism
  - עדכון אוטומטי של מצב הדיווח (pending/synced)
  - הצגת כמות דיווחי באגים בבדיקת מצב נתונים
  - מחיקה אוטומטית של דיווחים ישנים (שומר רק 50 אחרונים)

### 🔧 שינויים טכניים
- הוספת טיפוס `BugReport` ב-types
- הוספת collection `bugReports` ב-Firebase
- הוספת פונקציות ב-StorageService: `saveBugReport`, `loadBugReports`, `deleteBugReport`, `updateBugReportStatus`
- הוספת פונקציות ב-FirebaseService: `saveBugReport`, `loadBugReports`, `deleteBugReport`
- הוספת תמיכה ב-SyncService: `syncBugReport`
- עדכון `getUserDataCount` להציג גם דיווחי באגים
- עדכון `deleteAllUserData` למחוק גם דיווחי באגים

## [1.0.0] - 2025-11-22 - 🎉 RELEASE APK הראשון

### 🚀 הכנה לשחרור Production

#### 🔐 אבטחה
- **Release Keystore** - יצירת keystore ייעודי לחתימה על APK production
  - SHA-1: 9C:2F:27:EC:1C:A2:61:21:7C:8E:CD:FE:55:DF:88:51:81:6F:E1:B2
  - תוקף עד 2053
  - signing configuration מוגדר ב-Gradle

#### ⚡ אופטימיזציות
- **ProGuard/R8 Minification** - הקטנת גודל ה-APK ואובפוסקציה
- **Hermes Engine** - מנוע JavaScript מהיר יותר
- **Bundle Size Optimization** - ניקוי dependencies מיותרים

#### 🐛 תיקוני קוד
- **Lint Errors** - תיקון כל שגיאות ה-ESLint
- **TypeScript Errors** - תיקון כל שגיאות TypeScript
- **useCallback Dependencies** - תיקון missing dependencies ב-hooks
- **Unused Imports** - ניקוי imports מיותרים

#### 📦 הגדרות
- **Firebase Release SHA-1** - הוספת fingerprint ל-Firebase Console
- **Firestore Rules** - חוקי אבטחה מופעלים
- **Anonymous Auth** - מוגדר ומופעל

#### 📱 Asset Verification
- **App Name** - "האתגרים שלי"
- **Package Name** - com.timrsapp
- **Icons** - אייקונים בכל הרזולוציות הנדרשות
- **Permissions** - רק INTERNET (מינימלי)

#### 📝 תיעוד
- **FIREBASE_RELEASE_SETUP.md** - הוראות הגדרת Firebase
- **RELEASE_KEYSTORE_INFO.txt** - מידע על keystore
- **CHANGELOG.md** - תיעוד מעודכן

### 🎯 מה כלול בגרסה זו

כל התכונות מגרסאות הפיתוח הקודמות:
- ✅ סנכרון ענן עם Firebase
- ✅ תמיכה Offline-First
- ✅ ניהול טיימרים מותאם אישית
- ✅ היסטוריית איפוסים עם מצב רוח
- ✅ רישום שבירות שיאים
- ✅ סטטיסטיקות גלובליות
- ✅ מסך הגדרות מקיף
- ✅ עיצוב מודרני RTL

---

## [2.2.0] - 2024-11-22

### 🐛 תיקוני באגים קריטיים

#### ✅ תיקון בעיית crypto.getRandomValues
- **הוספת react-native-get-random-values** - תיקון שגיאת UUID generation
  - הוספת polyfill עבור crypto.getRandomValues ב-React Native
  - ייבוא ראשוני ב-index.js לפני כל הקוד האחר
  - פתרון שגיאות Promise rejection ברקע

#### 🔧 תיקון באג סגירת חלון איפוס מותאם
- **CustomResetDialog סוגר אוטומטית** - החלון נסגר כעת אחרי איפוס מותאם
  - הוספת onClose() בסוף handleConfirm
  - הסרת setShowResetDialog מ-TimerCard (החלון מנהל את עצמו)
  - שיפור חווית משתמש

#### 🧹 ניקוי קוד יסודי
- **מחיקת ApiService** - הסרת קובץ שלא בשימוש עם 8 TODO items
- **הסרת useEffect מיותר** - ניקוי בדיקת שבירת שיא שיצר memory leaks
  - הוסר ה-useEffect שרץ בכל שינוי ב-currentStreak
  - הבדיקה נעשית כעת רק בזמן איפוס מותאם
  - הפחתת promises ברקע ושיפור ביצועים

#### 🔍 תיקון שגיאות Linting
- **ניקוי imports מיותרים** - הסרת useEffect ו-RecordBreak שלא בשימוש
- **תיקון scope conflicts** - החלפת משתנים כפולים (currentValue/resetValue)
- **אין שגיאות linting** - הקוד נקי לחלוטין

### 📦 תלויות חדשות
- `react-native-get-random-values` - polyfill עבור crypto ב-React Native

### 💪 שיפורים נוספים
- ניקוי console.log מיותרים
- שיפור טיפול בשגיאות
- אופטימיזציה של re-renders

---

## [2.1.0] - 2024-11-22

### 🔧 שיפורים קריטיים ואופטימיזציות

#### ✅ חישוב חודשים מדויק
- **תיקון חישוב חודשים** - החלפת חישוב פשטני של 30 יום לחישוב מדויק עם `date-fns`
  - שימוש ב-`differenceInCalendarMonths` לחישוב אמיתי של חודשים
  - שימוש ב-`addMonths` לחישובי איפוס מותאם של חודשים
  - תומך כעת בחודשים של 28, 29, 30 ו-31 ימים
  - חבילה חדשה: `date-fns`

#### 🔐 אבטחה משופרת
- **החלפת ID Generation ב-UUID** - IDs בטוחים יותר עם `uuid`
  - החלפת כל ייצור ה-IDs מ-`Date.now() + Math.random()` ל-`uuid v4`
  - מניעת collisions במקרים נדירים
  - תמיכה ב-IDs ייחודיים גלובליים
  - חבילה חדשה: `uuid`, `@types/uuid`

#### 🛡️ Firestore Security Rules
- **הוספת Security Rules** - הגנה מלאה על נתונים ב-Firebase
  - קובץ `firestore.rules` עם חוקי אבטחה מקיפים
  - הגנה ברמת משתמש - כל משתמש רואה רק את הנתונים שלו
  - מניעת גישה לא מורשית לכל הסוגים: timers, globalStats, deletedTimers, resetLogs, recordBreaks
  - מדריך מפורט ב-`FIRESTORE_RULES.md`

#### ⚡ ביצועים ו-Stability
- **תיקון Race Condition ב-SyncService**
  - שימוש ב-`Promise.all` למניעת race conditions
  - טיפול נכון בבדיקות אסינכרוניות של Firebase readiness
  - שיפור אמינות הסנכרון
  
- **Debounce ל-updateGlobalStats**
  - הפחתת כתיבות ל-AsyncStorage ולFirebase
  - עדכון רק כל 5 שניות במקום כל שנייה
  - עדכון רק אם יש שינוי ממשי בנתונים
  - שיפור משמעותי בביצועים ובאריכות סוללה

- **תיקון Memory Leak ב-HomeScreen**
  - שימוש ב-useRef למניעת re-creation של intervals
  - interval נוצר רק פעם אחת במקום בכל render
  - שיפור צריכת זיכרון ויציבות האפליקציה

#### 💪 Error Handling משופר
- **Error Recovery ב-TimerCard**
  - הצגת הודעות שגיאה ידידותיות למשתמש
  - אפשרות לניסיון חוזר במקרה של כשל
  - fallback מתאים בכל מצב
  - שיפור חווית המשתמש במצבי שגיאה

### 📦 תלויות חדשות
- `date-fns` - חישובי תאריכים מדויקים
- `uuid` - ייצור IDs בטוחים
- `@types/uuid` - TypeScript types ל-uuid

### 🔄 שינויים פורצי תאימות
- **שדה חדש ב-RecordBreak**: נוסף שדה `improvement` שמציין את גודל השיפור בשיא
  - הוגדר בכל מקום שנוצר RecordBreak
  - מחושב אוטומטית: `newRecord - oldRecord`

---

## [2.0.5] - 2024-11-22

### ✨ שיפורים גדולים במסך הגדרות
- **מחיקת SyncStatusIndicator המרחף** - הוסר האינדיקטור המעצבן שקפץ כל הזמן
- **כפתור הגדרות חדש** - כפתור פשוט ומינימליסטי במקום
- **מסך הגדרות מקיף ומשופר:**
  - 📋 **אודות** - גרסה ותיאור האפליקציה
  - 🔄 **סטטוס סנכרון** - מידע מפורט על הסנכרון (רק כשנדרש)
  - 📊 **Firebase** - סטטוס החיבור לענן
  - 📜 **היסטוריה** - קישורים מהירים לכל מסכי ההיסטוריה
  - 🐛 **דיווח באגים** - אפשרות נוחה לדווח על בעיות
  - ⚙️ **פעולות** - ניהול תור הסנכרון
- עיצוב מינימליסטי, נקי ומקצועי

---

## [2.0.4] - 2024-11-22

### 🎨 שיפורי חוויית משתמש
- **תיקון: תדירות עדכון SyncStatusIndicator** - שיפור חוויית המשתמש
  - שונתה תדירות עדכון תצוגת "timeAgo" מ-30 שניות לדקה אחת
  - מונע "קפיצות" מעצבנות בתצוגה
  - הסנכרון עצמו נשאר מהיר וזמין - רק התצוגה מתעדכנת פחות

---

## [2.0.3] - 2024-11-22

### 🔧 תיקוני סנכרון קריטיים
- **תיקון: איפוס מלא עכשיו שומר ResetLog** - איפוס מלא כעת מתועד במלואו
  - נוסף רישום אוטומטי של ResetLog באיפוס מלא
  - כולל: סיבה, ערך לפני ואחרי, timestamp
  - מסונכרן אוטומטית לענן
  
- **תיקון: מחיקה לצמיתות מסונכרנת** - `permanentlyDeleteTimer` עכשיו מוחק גם מהענן
  - נוספה פונקציה `deleteDeletedTimer` ל-FirebaseService
  - מחיקה לצמיתות כעת מסונכרנת ב-Firebase
  - מונע בעיות סנכרון בין מכשירים
  
- **תיקון: שחזור טיימר מסונכרן** - `restoreTimer` עכשיו מוחק מהענן
  - שחזור טיימר מוחק את ה-DeletedTimer גם מ-Firebase
  - מונע חזרה של טיימרים מחוקים לאחר סנכרון

### ✅ אימות מערכת שמירת הנתונים
- בוצעה סריקה מלאה ויסודית של כל נקודות שמירת הנתונים
- אומת שכל 5 סוגי הנתונים נשמרים ומסונכרנים:
  - ✅ Timers (יצירה, עדכון, מחיקה)
  - ✅ GlobalStats (סטטיסטיקות גלובליות)
  - ✅ DeletedTimers (היסטוריית מחיקות)
  - ✅ ResetLogs (לוגי איפוסים עם סיבות ומצב רוח)
  - ✅ RecordBreaks (שבירות שיא)
- אומתה שמירה אוטומטית בכל פעולה משמעותית
- וודא סנכרון מלא בין local ו-cloud

---

## [2.0.2] - 2024-11-22

### 🎨 עיצוב
- **אייקון אפליקציה חדש** - החלפת האייקון הדיפולטי באייקון מקצועי ומעוצב
  - עיצוב מותאם אישית עם שעון חול, כנפיים, כתר ואלמנטים טכנולוגיים
  - אייקונים בכל הגדלים הנדרשים ל-Android (mdpi, hdpi, xhdpi, xxhdpi, xxxhdpi)
  - אייקונים בכל הגדלים הנדרשים ל-iOS (AppIcon.appiconset)
  - תמיכה מלאה ב-round icons של Android

---

## [2.0.0] - 2024-11-22

### ✨ תכונות חדשות
- **סנכרון ענן עם Firebase** - הנתונים מסונכרנים אוטומטית לענן
- **תמיכה Offline-First** - האפליקציה עובדת רגיל גם ללא אינטרנט
- **אימות אנונימי** - שימוש ב-Firebase Anonymous Auth
- **מנגנון Queue לסנכרון** - שינויים נשמרים בתור ומסונכרנים כשחוזר אינטרנט
- **אינדיקטור סטטוס סנכרון** - מציג את מצב הסנכרון בזמן אמת
- **מסך הגדרות** - ניהול סנכרון, מעקב אחר סטטוס וניקוי cache

### 🏗️ שיפורי ארכיטקטורה
- **שכבת Utils משותפת** - פונקציות עזר לתאריכים, ולידציות ופורמט
- **Error Handler מרכזי** - טיפול מקיף בשגיאות עם logging
- **Error Boundary Component** - תפיסת שגיאות ב-React components
- **NetworkService** - ניטור מצב חיבור לאינטרנט
- **FirebaseService** - שכבת abstraction מעל Firebase
- **SyncService** - ניהול חכם של סנכרון בין local ל-cloud

### 🐛 תיקוני באגים
- תוקן ממשק `RecordBreak` - איחוד 3 הגדרות כפולות לאחת אחידה
- הוספת שדה `improvement` ל-`RecordBreak`
- תיקון circular dependency ב-StorageService

### ⚡ אופטימיזציות
- שימוש ב-`React.memo` ב-TimerCard לביצועים טובים יותר
- שימוש ב-`useMemo` ו-`useCallback` לחישובים כבדים
- Custom comparison function ב-memo למניעת re-renders מיותרים

### 🔒 אבטחה ווולידציות
- הוספת `ValidationRules` עם הגבלות ברורות
- פונקציות ולידציה לכל שדות הקלט
- sanitization של input למניעת ערכים לא תקינים
- הגבלת אורך טקסט ב-reset logs ושמות טיימרים

### 📦 חבילות חדשות
- `@react-native-firebase/app` - ליבת Firebase
- `@react-native-firebase/firestore` - מסד נתונים בענן
- `@react-native-firebase/auth` - אימות משתמשים
- `@react-native-community/netinfo` - ניטור מצב רשת

### 📝 שינויים נוספים
- עדכון גרסה ל-2.0.0
- הוספת קובץ `FIREBASE_SETUP.md` עם הוראות הגדרה
- שיפור תיעוד בכל הקבצים
- הוספת הערות עברית מפורטות בקוד

---

## [1.4.0] - 2024-11-XX (גרסה קודמת)

### תכונות
- רישום שבירות שיאים (Record Breaks)
- היסטוריית איפוסים עם מצב רוח וסיבות
- סטטיסטיקות גלובליות
- מסך היסטוריה לטיימרים מחוקים

---

## [1.0.0] - 2024-11-XX (גרסה ראשונה)

### תכונות בסיסיות
- יצירת טיימרים מותאמים אישית
- בחירת יחידות זמן (שניות, דקות, שעות, ימים, שבועות, חודשים)
- איפוס מותאם ואיפוס מלא
- עריכה ומחיקה של טיימרים
- שמירה מקומית ב-AsyncStorage
- עיצוב מודרני RTL

---

## הערות גרסאות

### סמנטיקת גרסאות
אנחנו משתמשים ב-[Semantic Versioning](https://semver.org/):
- **MAJOR** - שינויים שאינם תואמים לאחור
- **MINOR** - תכונות חדשות תואמות לאחור
- **PATCH** - תיקוני באגים תואמים לאחור
