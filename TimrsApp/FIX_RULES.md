# 🔧 תיקון Firestore Rules

## ❌ הבעיה:
הכללים הנוכחיים חוסמים הכל:
```javascript
allow read, write: if false;  // ← זה חוסם הכל!
```

## ✅ הפתרון:
צריך להחליף ל:

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

## 📋 איך לתקן:

1. **לך ל-Firestore Rules:**
   https://console.firebase.google.com/project/timrs-app/firestore/rules

2. **החלף את הכללים** ב:
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

3. **לחץ "Publish"**

---

## ✅ מה זה עושה:
- ✅ מאפשר למשתמשים מאומתים לקרוא ולכתוב
- ✅ כל משתמש יכול לגשת רק לנתונים שלו (`userId`)
- ✅ ביטחון מלא - משתמשים לא יכולים לראות נתונים של אחרים

---

**אחרי שתשנה את ה-Rules ותלחץ Publish, תגיד לי ואני אריץ את האפליקציה!** 🚀

