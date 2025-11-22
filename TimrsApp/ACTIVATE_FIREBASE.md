# 🔥 הוראות הפעלת Firebase - שלב אחר שלב

## ⚠️ חשוב: אנחנו משתמשים ב-Firestore, לא Realtime Database!

---

## 📋 שלב 1: הפעל Firestore Database

**אתה נמצא ב-Realtime Database - צריך לעבור ל-Firestore!**

1. **לך ל-Firestore:**
   https://console.firebase.google.com/project/timrs-app/firestore

2. **אם אין לך database:**
   - לחץ **"Create database"**
   - בחר **"Start in test mode"** (לפיתוח)
   - Location: **"europe-west1"** (בלגיה - הכי קרוב)
   - לחץ **"Enable"**

3. **אם יש לך database:**
   - וודא שאתה בטאב **"Data"**
   - אמור לראות רשימה ריקה או נתונים קיימים

4. **הגדר כללי אבטחה (Rules):**
   - לחץ על טאב **"Rules"**
   - החלף ב:
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
   - לחץ **"Publish"**

---

## 📋 שלב 2: הפעל Anonymous Authentication

1. **לך ל-Authentication:**
   https://console.firebase.google.com/project/timrs-app/authentication

2. **אם זה הפעם הראשונה:**
   - לחץ **"Get started"**

3. **הפעל Anonymous:**
   - לחץ על טאב **"Sign-in method"**
   - מצא **"Anonymous"** ברשימה
   - לחץ עליו
   - הפעל את המתג → **"Enabled"**
   - לחץ **"Save"**

---

## ✅ אחרי שתסיים את שני השלבים:

**תגיד לי "מוכן" ואני אריץ את האפליקציה עם Firebase מופעל!**

---

## 🎯 מה יקרה אחרי הפעלה:

1. האפליקציה תתחבר ל-Firebase
2. תיצור משתמש אנונימי אוטומטית
3. כל טיימר שתצור יישמר ב-Firestore
4. תוכל לראות את הנתונים בקונסול

---

## 📸 איך תדע שהכל עובד:

**ב-Firebase Console → Firestore Database:**
```
users/
  <USER_ID>/
    timers/
      <TIMER_ID>: { name: "...", startDate: ..., ... }
    globalStats/
      stats: { currentStreak: 0, ... }
```

**ב-Authentication → Users:**
- אמור לראות משתמש אנונימי חדש עם UID

---

**עכשיו לך להפעיל Firestore ו-Authentication ותגיד לי כשמוכן!** 🚀

