# 🔥 Firebase Setup Guide

מדריך מקיף להגדרת Firebase באפליקציית Timrs.

## תוכן עניינים
1. [יצירת פרויקט Firebase](#יצירת-פרויקט-firebase)
2. [הגדרת Android](#הגדרת-android)
3. [הפעלת Firestore](#הפעלת-firestore)
4. [הפעלת Authentication](#הפעלת-authentication)
5. [הפעלה באפליקציה](#הפעלה-באפליקציה)
6. [בדיקת התקנה](#בדיקת-התקנה)

---

## יצירת פרויקט Firebase

1. **היכנס ל-Firebase Console**
   - גש ל-https://console.firebase.google.com
   - התחבר עם חשבון Google שלך

2. **צור פרויקט חדש**
   - לחץ על "Add project"
   - שם הפרויקט: `timrs-app` (או כל שם אחר שתבחר)
   - בחר אם לאפשר Google Analytics (אופציונלי)
   - המתן לסיום יצירת הפרויקט

---

## הגדרת Android

### שלב 1: רישום אפליקציית Android

1. בקונסול של Firebase, בחר בפרויקט שלך
2. לחץ על האייקון של Android
3. הזן את ה-package name: `com.timrsapp`
4. הזן App nickname: `TimrsApp`
5. לחץ "Register app"

### שלב 2: הורדת google-services.json

1. הורד את קובץ `google-services.json`
2. העבר אותו ל: `/Users/navesarussi/timrs/TimrsApp/android/app/google-services.json`

```bash
# בטרמינל:
cd /Users/navesarussi/timrs/TimrsApp/android/app
# העתק את הקובץ לכאן
```

### שלב 3: עדכון android/build.gradle

הוסף את השורה הבאה בסוף קובץ `android/build.gradle`:

```gradle
buildscript {
    dependencies {
        // ... קוד קיים
        classpath 'com.google.gms:google-services:4.4.0'  // הוסף שורה זו
    }
}
```

### שלב 4: עדכון android/app/build.gradle

בסוף הקובץ `android/app/build.gradle`, הוסף:

```gradle
// בתחתית הקובץ
apply plugin: 'com.google.gms.google-services'
```

### שלב 5: עדכון AndroidManifest.xml

בקובץ `android/app/src/main/AndroidManifest.xml`, וודא שיש את ההרשאות:

```xml
<manifest ...>
    <!-- הרשאות אינטרנט -->
    <uses-permission android:name="android.permission.INTERNET" />
    <uses-permission android:name="android.permission.ACCESS_NETWORK_STATE" />
    
    <!-- שאר הקוד -->
</manifest>
```

---

## הפעלת Firestore

1. **בקונסול Firebase**
   - לחץ על "Firestore Database" בתפריט השמאלי
   - לחץ "Create database"

2. **בחר מצב**
   - בחר "Start in **test mode**" להתחלה (לפיתוח בלבד!)
   - או "Start in **production mode**" ועדכן את הכללים ידנית

3. **בחר מיקום**
   - בחר `europe-west1` (בלגיה) או מיקום קרוב אחר
   - לחץ "Enable"

4. **כללי אבטחה (חשוב!)**
   
   אם בחרת test mode, עדכן את הכללים ל:
   ```
   rules_version = '2';
   service cloud.firestore {
     match /databases/{database}/documents {
       match /users/{userId}/{document=**} {
         allow read, write: if request.auth != null && request.auth.uid == userId;
       }
     }
   }
   ```

---

## הפעלת Authentication

1. **בקונסול Firebase**
   - לחץ על "Authentication" בתפריט השמאלי
   - לחץ "Get started"

2. **הפעל Anonymous Authentication**
   - לחץ על הטאב "Sign-in method"
   - בחר "Anonymous"
   - הפעל את המתג ל-"Enable"
   - שמור

---

## הפעלה באפליקציה

### שלב 1: עדכון קובץ ההגדרות

ערוך את הקובץ: `src/config/firebase.config.ts`

```typescript
export const FirebaseConfig = {
  enabled: true, // שנה מ-false ל-true
  
  // ... שאר ההגדרות נשארות כפי שהן
};
```

### שלב 2: בנייה מחדש

```bash
cd /Users/navesarussi/timrs/TimrsApp

# נקה build
cd android
./gradlew clean
cd ..

# הרץ מחדש
npm run android
```

---

## בדיקת התקנה

### בדיקה 1: אתחול Firebase

פתח את האפליקציה ובדוק את ה-logs:

```bash
npx react-native log-android
```

חפש שורות כמו:
```
[FirebaseService] Initialized successfully
[FirebaseService] Signed in anonymously: <USER_ID>
```

### בדיקה 2: בקונסול Firebase

1. גש ל-**Firebase Console**
2. **Authentication** → טאב **Users**
3. אמור לראות משתמש אנונימי חדש

4. **Firestore Database**
5. אמור לראות collection בשם `users`

### בדיקה 3: במסך ההגדרות

1. באפליקציה, לחץ על כפתור ההגדרות (⚙️)
2. בדוק שהסטטוס מציג:
   - **Firebase: מופעל**
   - **User ID: xxxxx...**
   - **מצב רשת: מקוון**

### בדיקה 4: סנכרון

1. צור טיימר חדש
2. במסך הגדרות, לחץ "סנכרן כעת"
3. בדוק ב-Firestore Console שהטיימר נשמר

---

## פתרון בעיות נפוצות

### שגיאה: "google-services.json is missing"

**פתרון:** וודא שהקובץ נמצא בדיוק ב:
```
android/app/google-services.json
```

### שגיאה: "Firebase not initialized"

**פתרון:**
1. וודא ש-`FirebaseConfig.enabled = true`
2. נקה ובנה מחדש:
   ```bash
   cd android && ./gradlew clean && cd ..
   npm run android
   ```

### שגיאה: "PERMISSION_DENIED"

**פתרון:** עדכן את כללי Firestore לאפשר גישה למשתמשים מאומתים

### האפליקציה לא מסתנכרנת

**בדוק:**
1. האם יש חיבור אינטרנט
2. האם Firebase מופעל בהגדרות
3. בדוק logs ב-`npx react-native log-android`

---

## הגדרות אבטחה מומלצות

### לפיתוח
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId}/{document=**} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
  }
}
```

### לפרודקשן
אותם כללים + הוספת validations:
```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
      
      match /timers/{timerId} {
        allow read, write: if request.auth.uid == userId;
        allow create: if request.resource.data.keys().hasAll(['id', 'name', 'startDate']);
      }
      
      // ... כללים נוספים לפי הצורך
    }
  }
}
```

---

## עזרה נוספת

- **תיעוד Firebase:** https://firebase.google.com/docs
- **React Native Firebase:** https://rnfirebase.io
- **בעיות נפוצות:** https://rnfirebase.io/faqs-and-tips

---

**הצלחה! 🎉**

האפליקציה שלך כעת מסונכרנת לענן ומוכנה לשימוש.

