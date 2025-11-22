# TimrsApp - אפליקציית טיימרים אישית מתקדמת ☁️

<div align="center">

**גרסה 2.3.0** | React Native | TypeScript | Firebase

[![CI](https://img.shields.io/badge/CI-GitHub%20Actions-blue)](/.github/workflows/ci.yml)
[![TypeScript](https://img.shields.io/badge/TypeScript-Strict-blue)](./tsconfig.json)
[![Tests](https://img.shields.io/badge/Tests-Unit%20%2B%20Integration-green)](#-testing)
[![License](https://img.shields.io/badge/License-Private-red)](#-license)

אפליקציית React Native מתקדמת לניהול טיימרים אישיים עם סנכרון אוטומטי לענן, תמיכה offline-first, ומערכת tracking מקיפה.

[תכונות](#-features) •
[התקנה](#-installation) •
[שימוש](#-usage) •
[ארכיטקטורה](#-architecture) •
[תיעוד](#-documentation)

</div>

---

## ✨ Features

### ⏱️ ניהול טיימרים מתקדם
- ✅ יצירת טיימרים מותאמים אישית עם שם ויחידת זמן
- ✅ תמיכה ב-6 יחידות זמן: שניות, דקות, שעות, ימים, שבועות, חודשים
- ✅ חישוב אוטומטי מדויק של זמן שעבר (כולל חודשים עם `date-fns`)
- ✅ תצוגה חכמה עם המרות אוטומטיות (למשל: 150 שניות → "2 דקות 30 שניות")
- ✅ עריכה ומחיקה עם אישור למניעת טעויות

### 🔄 סנכרון ענן חכם
- ☁️ **Firebase Integration** - Firestore + Anonymous Auth
- 📴 **Offline-First Architecture** - עבודה מלאה ללא אינטרנט
- 🔄 **Real-time Sync** - עדכונים בזמן אמת בין מכשירים
- 📦 **Sync Queue** - תור חכם עם retry mechanism ו-exponential backoff
- 🚦 **Network Status Monitoring** - ניטור מצב רשת וסנכרון אוטומטי
- 🔒 **Security Rules** - הגנה מלאה על נתונים ברמת Firebase

### 🎯 איפוסים ומעקב
- 🔄 **איפוס מותאם אישית** - הורדת כמות מוגדרת בלבד
- ♻️ **איפוס מלא** - איפוס לחלוטין ל-0 עם שמירת היסטוריה
- 📝 **רישום מפורט** - תיעוד איפוס עם סיבה, מצב רוח (1-5), וזמן מדויק
- 📊 **כפתורים מהירים** - בחירה מהירה של כמויות נפוצות (יום, שבוע, חודש)
- 📜 **היסטוריה מלאה** - צפייה בכל האיפוסים שבוצעו

### 📊 סטטיסטיקות ושיאים
- 🔥 **Current Streak** - מעקב אחר רצף נוכחי מאז איפוס אחרון
- 🏆 **Personal Records** - שמירת השיא האישי הטוב ביותר
- 💪 **Record Breaks** - רישום אוטומטי של כל שבירת שיא עם improvement
- 📈 **Global Stats** - סטטיסטיקות כוללות: סטריק גלובלי, שיאים, סך איפוסים
- 🗂️ **History** - היסטוריית טיימרים מחוקים עם אפשרות לשחזור

### 🎨 UI/UX מעולה
- 🎯 **עיצוב מודרני ונקי** - Material Design inspired
- 📱 **RTL מלא** - תמיכה מושלמת בעברית
- ⚡ **Animations** - אנימציות חלקות ומהירות
- 🌈 **Color-coded Status** - צבעים לסטטוס סנכרון, רשת, ועוד
- 🧭 **Navigation** - ניווט אינטואיטיבי בין מסכים
- ⚙️ **מסך הגדרות מקיף** - ניהול סנכרון, Firebase status, debug tools
- 🐛 **Bug Reporting** - מערכת דיווח באגים מובנית עם סנכרון אוטומטי

## 🚀 Installation

### Prerequisites
```bash
node >= 20.0.0
npm >= 9.0.0
Java JDK 17 (temurin-17)
Android Studio
React Native CLI
```

### Setup
```bash
# Clone the repository
git clone <repo-url>
cd TimrsApp

# Install dependencies
npm install

# Android setup
cd android
./gradlew clean
cd ..
```

### Firebase Configuration (Optional - for Cloud Sync)
1. צור פרויקט ב-[Firebase Console](https://console.firebase.google.com/)
2. הוסף Android app עם package name: `com.timrsapp`
3. הורד `google-services.json` ושים ב-`android/app/`
4. הפעל Firestore Database
5. העלה את `firestore.rules` ל-Firebase Console
6. הפעל Anonymous Authentication

### Running the App
```bash
# Start Metro bundler
npm start

# Run on Android (separate terminal)
npm run android

# Or with specific Java version
npm run android:debug

# View logs
npm run logs
```

## 📖 Usage

### יצירת טיימר חדש
1. לחץ על ➕ (FAB) בפינה התחתונה
2. הזן שם (1-50 תווים)
3. בחר יחידת זמן
4. הגדר כמות להורדה באיפוס מותאם
5. לחץ "צור"

### ניהול טיימרים
- **צפייה** - לחץ על כרטיס הטיימר לפרטים מלאים
- **עריכה** - מהמודל של פרטי טיימר
- **מחיקה** - כפתור מחק בפרטי הטיימר (עם אישור)
- **איפוס מותאם** - בחר כמות, סיבה ומצב רוח
- **איפוס מלא** - איפוס מלא ל-0 (עם אישור)

### מסכי עזר
- 📜 **היסטוריה** - טיימרים מחוקים (50 אחרונים) + אפשרות שחזור
- 🔄 **היסטוריית איפוסים** - כל האיפוסים עם סיבות ומצב רוח
- 🏆 **שיאים** - כל שבירות השיאים עם improvement
- ⚙️ **הגדרות** - סנכרון, Firebase status, דיווח באגים, איפוס מלא

## 🏗️ Architecture

### Project Structure
```
TimrsApp/
├── src/
│   ├── components/           # Reusable UI Components
│   │   ├── TimerCard.tsx          # Timer display card
│   │   ├── TimerForm.tsx          # Create/Edit timer form
│   │   ├── CustomResetDialog.tsx  # Custom reset dialog
│   │   ├── TimerDetailsModal.tsx  # Timer details modal
│   │   └── ErrorBoundary.tsx      # Error boundary
│   ├── screens/              # Screen Components
│   │   ├── HomeScreen.tsx         # Main screen
│   │   ├── HistoryScreen.tsx      # Deleted timers
│   │   ├── ResetHistoryScreen.tsx # Reset logs
│   │   ├── RecordBreaksScreen.tsx # Record breaks
│   │   └── SettingsScreen.tsx     # Settings
│   ├── services/             # Business Logic Layer
│   │   ├── StorageService.ts      # AsyncStorage + Sync
│   │   ├── TimerService.ts        # Timer calculations
│   │   ├── FirebaseService.ts     # Firebase operations
│   │   ├── SyncService.ts         # Sync queue management
│   │   ├── NetworkService.ts      # Network monitoring
│   │   └── GlobalStatsService.ts  # Global statistics
│   ├── utils/                # Utility Functions
│   │   ├── dateUtils.ts           # Date formatting & calculations
│   │   ├── validationUtils.ts     # Input validation
│   │   ├── formatUtils.ts         # Number/text formatting
│   │   ├── ErrorHandler.ts        # Centralized error handling
│   │   └── index.ts               # Utils barrel export
│   ├── types/                # TypeScript Definitions
│   │   └── index.ts               # All interfaces & types
│   ├── config/               # Configuration
│   │   ├── app.config.ts          # App configuration
│   │   └── firebase.config.ts     # Firebase settings
│   └── constants/            # Constants
│       └── index.ts               # App constants
├── __tests__/                # Test Files
│   ├── services/
│   │   └── TimerService.test.ts
│   └── utils/
│       └── validationUtils.test.ts
├── .github/
│   └── workflows/
│       └── ci.yml             # GitHub Actions CI/CD
├── android/                   # Android Native Code
├── ios/                       # iOS Native Code (future)
├── App.tsx                    # Root Component
├── index.js                   # Entry Point
├── package.json
├── tsconfig.json
├── .prettierrc.json
├── firestore.rules            # Firestore Security Rules
├── CHANGELOG.md               # Version History
└── README.md                  # This file
```

### Tech Stack
| Category | Technology | Purpose |
|----------|-----------|---------|
| **Framework** | React Native 0.82.1 | Cross-platform mobile development |
| **Language** | TypeScript (Strict Mode) | Type safety & developer experience |
| **State** | React Hooks | Local state management |
| **Storage** | AsyncStorage | Local persistence |
| **Cloud** | Firebase (Firestore + Auth) | Cloud sync & authentication |
| **Networking** | NetInfo | Network status monitoring |
| **Date** | date-fns | Accurate date calculations |
| **IDs** | uuid v4 | Secure unique identifiers |
| **Icons** | React Native Vector Icons | UI icons |

### Design Patterns
- **Offline-First**: Local storage primary, cloud secondary
- **Singleton Services**: StorageService, SyncService, FirebaseService
- **Repository Pattern**: StorageService abstracts storage details
- **Observer Pattern**: Listeners for sync/network status
- **Error Boundary**: React error boundary for crash prevention
- **Queue Pattern**: Sync queue with retry mechanism

## 🧪 Testing

### Running Tests
```bash
# Run all tests
npm test

# Run with coverage
npm test -- --coverage

# Watch mode
npm test -- --watch
```

### Test Coverage
- ✅ **TimerService** - 10+ unit tests
- ✅ **ValidationUtils** - 20+ unit tests
- 🚧 **Integration Tests** - Coming soon
- 🚧 **E2E Tests** - Coming soon

**Target Coverage**: 80%+

## 🚀 CI/CD

### GitHub Actions
המערכת כוללת CI/CD pipeline אוטומטי ב-GitHub Actions:

- ✅ **Linting** - ESLint checks
- ✅ **Type Checking** - TypeScript compilation
- ✅ **Tests** - Unit tests with coverage
- ✅ **Android Build** - Debug APK build
- ✅ **Artifacts** - APK upload for testing
- ✅ **Coverage Reports** - Codecov integration

ראה [`.github/workflows/ci.yml`](./.github/workflows/ci.yml) לפרטים.

## 📚 Documentation

- **[CHANGELOG.md](./CHANGELOG.md)** - רשימת שינויים מפורטת לכל גרסה
- **[firestore.rules](./firestore.rules)** - Firebase security rules

## 🔒 Security & Privacy

- 🔐 **Anonymous Authentication** - אין צורך במידע אישי
- 👤 **Data Isolation** - כל משתמש רואה רק את הנתונים שלו
- 🛡️ **Firestore Rules** - הגנה ברמת המסד נתונים
- 💾 **Local-First** - הנתונים נשמרים מקומית תמיד
- 🚫 **No Tracking** - ללא מעקב או analytics צד שלישי
- 🔄 **Sync Queue** - סנכרון בטוח עם retry mechanism

## ⚡ Performance

- 🚀 **Memoization** - React.memo, useMemo, useCallback למניעת re-renders
- 💨 **Debouncing** - עדכונים מדודים למניעת overhead
- 📦 **Code Splitting** - טעינה עצלה של modules
- 🗄️ **Offline Cache** - Firebase offline persistence
- ⚡ **Optimistic Updates** - UI update מיידי לפני sync
- 🔧 **ProGuard/R8** - Code minification & obfuscation בproduction

## 🐛 Debugging

### Logs
```bash
# Android logs (filtered)
npm run logs

# Or full logs
adb logcat *:S ReactNative:V ReactNativeJS:V

# Search for specific services
[FirebaseService]
[SyncService]
[NetworkService]
[StorageService]
[ErrorHandler]
```

### Common Issues

**Firebase not initializing?**
1. וודא `google-services.json` ב-`android/app/`
2. בדוק Firestore Rules ב-Firebase Console
3. ודא Anonymous Auth מופעל
4. ראה logs: `[FirebaseService]`

**Sync not working?**
1. בדוק network status במסך הגדרות
2. ראה pending items בתור הסנכרון
3. לחץ "סנכרן כעת" ידנית
4. ראה logs: `[SyncService]`

## 📝 Scripts

| Script | Description |
|--------|-------------|
| `npm start` | Start Metro bundler |
| `npm run android` | Run on Android |
| `npm run android:debug` | Run in debug mode with specific Java |
| `npm run android:clean` | Clean Android build |
| `npm run android:rebuild` | Clean + rebuild |
| `npm run lint` | Run ESLint |
| `npm test` | Run tests |
| `npm run logs` | View filtered logs |

## 🔄 Versioning

גרסה נוכחית: **2.3.0**

אנחנו משתמשים ב-[Semantic Versioning](https://semver.org/):
- **MAJOR** (X.0.0) - Breaking changes
- **MINOR** (0.X.0) - New features (backward compatible)
- **PATCH** (0.0.X) - Bug fixes

## 🤝 Contributing

פרויקט אישי. לשאלות או הצעות, פתח issue ב-GitHub.

## 📄 License

פרויקט אישי - כל הזכויות שמורות © 2024

---

<div align="center">

**נבנה עם ❤️, React Native, TypeScript, ו-Firebase**

[⬆ חזרה למעלה](#timrsapp---אפליקציית-טיימרים-אישית-מתקדמת-)

</div>

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

לסנכרון ענן, יש להגדיר Firebase:

1. צור פרויקט ב-[Firebase Console](https://console.firebase.google.com/)
2. הוסף אפליקציית Android לפרויקט
3. הורד את קובץ `google-services.json` והעבר אותו ל-`android/app/`
4. הפעל Firestore Database במצב Test
5. הרץ `npm install` כדי להתקין את תלויות Firebase

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

- [CHANGELOG.md](./CHANGELOG.md) - רשימת שינויים וגרסאות

## 🔄 גרסה

**1.0.0** - גרסת השקה ראשונה

### תכונות עיקריות:

✅ **חישוב חודשים מדויק** - שימוש ב-date-fns לחישובים מדויקים  
✅ **IDs בטוחים** - שימוש ב-UUID v4  
✅ **Firestore Security Rules** - הגנה מלאה על הנתונים  
✅ **סנכרון אמין** - offline-first עם sync queue  
✅ **Error Recovery** - טיפול חכם בשגיאות  
✅ **אופטימיזציית ביצועים** - Debounce וניהול זיכרון משופר

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
