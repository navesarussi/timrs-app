# Timrs - אפליקציית טיימרים אישית עם סנכרון ענן ☁️

אפליקציית React Native מתקדמת לניהול טיימרים אישיים עם סנכרון אוטומטי לענן ותמיכה offline-first.

## ✨ תכונות

### ⏱️ ניהול טיימרים
- יצירת טיימרים מותאמים אישית
- בחירת יחידות זמן: שניות, דקות, שעות, ימים, שבועות, חודשים
- חישוב אוטומטי של זמן שעבר
- תצוגה חכמה עם המרות אוטומטיות

### 🔄 סנכרון ענן
- **Firebase Integration** - סנכרון אוטומטי לענן
- **Offline-First** - עבודה רגילה גם ללא אינטרנט
- **Anonymous Auth** - אין צורך בהרשמה
- **Real-time Sync** - עדכונים בזמן אמת
- **Sync Queue** - שינויים נשמרים בתור ומסונכרנים אוטומטית

### 🔄 איפוסים מתקדמים
- **איפוס מותאם אישית** - הורדת כמות מוגדרת
- **איפוס מלא** - איפוס לחלוטין ל-0
- **רישום איפוסים** - תיעוד מלא עם סיבה ומצב רוח
- **היסטוריה** - מעקב אחר כל האיפוסים

### 📊 סטטיסטיקות
- **Streaks** - מעקב אחר רצפים
- **שיאים אישיים** - שמירת השיא הטוב ביותר
- **שבירות שיאים** - רישום כל פעם ששוברים שיא
- **סטטיסטיקות גלובליות** - מבט על כלל הטיימרים

### 🎨 UX/UI
- עיצוב מודרני ונקי
- תמיכה מלאה ב-RTL (עברית)
- אנימציות חלקות
- מסך הגדרות מקיף ומינימליסטי
- דיווח באגים מובנה
- קישורים מהירים לכל מסכי ההיסטוריה

## 🚀 התקנה והרצה

### דרישות מוקדמות

- Node.js 20+
- Android Studio
- JDK 11 או יותר
- React Native CLI

### התקנת החבילות

```bash
cd TimrsApp
npm install
```

### הגדרת Firebase (אופציונלי)

לסנכרון ענן, יש להגדיר Firebase. ראה [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) להוראות מפורטות.

### הרצת האפליקציה

```bash
# Android
npm run android

# או אם Metro Bundler לא רץ:
npm start  # טרמינל 1
npm run android  # טרמינל 2
```

## 📱 שימוש באפליקציה

### יצירת טיימר חדש
1. לחץ על כפתור ה-➕ בפינה הימנית התחתונה
2. הזן שם לטיימר (לדוגמה: "הפסקת עישון")
3. בחר יחידת זמן
4. הגדר כמות להורדה באיפוס מותאם אישית
5. לחץ "צור"

### עריכת טיימר
- לחץ על הכרטיס של הטיימר

### מחיקת טיימר
- לחץ לחיצה ארוכה על הכרטיס

### איפוס טיימר
- **איפוס מותאם** - מוריד את הכמות שהגדרת
  - מאפשר לתעד סיבה ומצב רוח
- **איפוס מלא** - מאפס לחלוטין ל-0

### הגדרות וסנכרון
- לחץ על כפתור ההגדרות בכותרת
- ראה סטטוס סנכרון
- סנכרן ידנית
- נקה תור סנכרון

## 🏗️ מבנה הפרויקט

```
TimrsApp/
├── src/
│   ├── components/          # UI Components
│   │   ├── TimerCard.tsx
│   │   ├── TimerForm.tsx
│   │   ├── CustomResetDialog.tsx
│   │   ├── ErrorBoundary.tsx
│   │   └── SyncStatusIndicator.tsx
│   ├── screens/             # Screens
│   │   ├── HomeScreen.tsx
│   │   ├── HistoryScreen.tsx
│   │   ├── ResetHistoryScreen.tsx
│   │   ├── RecordBreaksScreen.tsx
│   │   └── SettingsScreen.tsx
│   ├── services/            # Business Logic
│   │   ├── StorageService.ts    # Local + Cloud storage
│   │   ├── TimerService.ts      # Timer calculations
│   │   ├── FirebaseService.ts   # Firebase integration
│   │   ├── SyncService.ts       # Sync management
│   │   ├── NetworkService.ts    # Network monitoring
│   │   └── GlobalStatsService.ts
│   ├── utils/               # Utilities
│   │   ├── dateUtils.ts
│   │   ├── validationUtils.ts
│   │   ├── formatUtils.ts
│   │   └── ErrorHandler.ts
│   ├── types/               # TypeScript types
│   │   └── index.ts
│   └── config/              # Configuration
│       ├── app.config.ts
│       └── firebase.config.ts
└── App.tsx
```

## 🔧 טכנולוגיות

- **React Native 0.82.1** - Framework
- **TypeScript** - Type Safety
- **AsyncStorage** - Local storage
- **Firebase** - Cloud sync
  - Firestore - Database
  - Auth - Anonymous authentication
- **NetInfo** - Network monitoring
- **React Hooks** - State management

## 📦 תלויות עיקריות

```json
{
  "@react-native-async-storage/async-storage": "^2.2.0",
  "@react-native-firebase/app": "latest",
  "@react-native-firebase/firestore": "latest",
  "@react-native-firebase/auth": "latest",
  "@react-native-community/netinfo": "latest",
  "react-native-vector-icons": "^10.3.0"
}
```

## 🔒 אבטחה ו-Privacy

- **Anonymous Authentication** - אין צורך במידע אישי
- **Data Isolation** - כל משתמש רואה רק את הנתונים שלו
- **Firestore Rules** - הגנה ברמת המסד נתונים
- **Local-First** - הנתונים נשמרים מקומית תמיד

## ⚡ ביצועים

- **Memoization** - שימוש ב-React.memo, useMemo, useCallback
- **Lazy Loading** - טעינה עצלה של Firebase
- **Offline Cache** - Firebase offline persistence
- **Optimistic Updates** - עדכון UI מיידי

## 🐛 Debugging

### לוגים
```bash
# Android
npx react-native log-android

# חפש:
[FirebaseService]
[SyncService]
[NetworkService]
[ErrorHandler]
```

### בדיקת סנכרון
1. פתח מסך הגדרות
2. בדוק סטטוס Firebase
3. לחץ "סנכרן כעת"
4. בדוק ב-Firebase Console

## 📚 תיעוד נוסף

- [FIREBASE_SETUP.md](./FIREBASE_SETUP.md) - הוראות הגדרת Firebase
- [CHANGELOG.md](./CHANGELOG.md) - רשימת שינויים
- [PROJECT_SUMMARY.md](./PROJECT_SUMMARY.md) - סיכום הפרויקט

## 🔄 גרסה

**2.0.0** - סנכרון ענן ושיפורים משמעותיים

ראה [CHANGELOG.md](./CHANGELOG.md) לפרטים מלאים.

## 👨‍💻 פיתוח

### הרצה במצב Dev
```bash
npm start
```

### בדיקת Linting
```bash
npm run lint
```

### בדיקות
```bash
npm test
```

## 🤝 תרומה

פרויקט אישי. לשאלות או הצעות, פתח issue.

## 📄 רישיון

פרויקט אישי - כל הזכויות שמורות.

---

**נבנה עם ❤️ ו-React Native**
