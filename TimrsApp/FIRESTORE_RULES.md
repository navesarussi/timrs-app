# הוראות הטמעת Firestore Security Rules

## מה זה Security Rules?

Firestore Security Rules הם חוקי אבטחה שמגנים על הנתונים במסד הנתונים ב-Firebase. הם מגדירים מי יכול לקרוא ולכתוב נתונים.

## למה זה חשוב?

ללא Security Rules, כל אחד יכול לקרוא ולכתוב את כל הנתונים במסד הנתונים שלך. זה מסוכן מאוד!

## כיצד להטמיע?

### אופציה 1: דרך Firebase Console (מומלץ למתחילים)

1. פתח את [Firebase Console](https://console.firebase.google.com)
2. בחר את הפרויקט שלך
3. בצד שמאל, לחץ על **Firestore Database**
4. לחץ על הכרטיסיה **Rules** בחלק העליון
5. העתק את התוכן מהקובץ `firestore.rules`
6. הדבק אותו באזור העריכה
7. לחץ על **Publish** כדי לפרסם את השינויים

### אופציה 2: דרך Firebase CLI (למתקדמים)

#### התקנת Firebase CLI

```bash
npm install -g firebase-tools
```

#### התחברות ל-Firebase

```bash
firebase login
```

#### אתחול הפרויקט

```bash
cd TimrsApp
firebase init firestore
```

בחר:
- Use an existing project → בחר את הפרויקט שלך
- What file should be used for Firestore Rules? → `firestore.rules` (ברירת מחדל)
- What file should be used for Firestore indexes? → `firestore.indexes.json`

#### פריסת ה-Rules

```bash
firebase deploy --only firestore:rules
```

## מה ה-Rules עושים?

החוקים שיצרנו מבטיחים:

✅ **משתמש יכול לגשת רק לנתונים שלו**
- כל משתמש יכול לקרוא ולכתוב רק את הנתונים תחת `/users/{userId}/` שלו

✅ **הגנה על כל סוגי הנתונים**
- טיימרים (timers)
- סטטיסטיקות גלובליות (globalStats)
- טיימרים מחוקים (deletedTimers)
- לוגי איפוסים (resetLogs)
- שבירות שיאים (recordBreaks)

✅ **מניעת גישה לא מורשית**
- כל מה שלא הוגדר מפורשות - אסור

## בדיקת ה-Rules

לאחר הפריסה, כדאי לבדוק שהכל עובד:

1. ב-Firebase Console, עבור ל-Firestore Database → Rules
2. לחץ על **Rules Playground** בחלק העליון
3. נסה סימולציות שונות:
   - קריאה של נתונים של המשתמש שלך ✅ צריך להצליח
   - קריאה של נתונים של משתמש אחר ❌ צריך להיכשל
   - כתיבה ללא אימות ❌ צריך להיכשל

## שגיאות נפוצות

### שגיאה: "Missing or insufficient permissions"

זה אומר שה-Rules עובדים! המשתמש מנסה לגשת לנתונים שאין לו הרשאה אליהם.

אם אתה מקבל שגיאה זו כשאתה מנסה לגשת לנתונים **שלך**:
1. וודא שהמשתמש מחובר (Anonymous Auth)
2. בדוק שה-userId ב-URL תואם ל-`request.auth.uid`

### שגיאה: "Quota exceeded"

אם אתה חורג ממכסת הקריאות החינמיות של Firebase, שקול:
1. הפחתת תדירות הסנכרון
2. שימוש ב-offline cache יותר
3. שדרוג לתוכנית Blaze (Pay as you go)

## קריאה נוספת

- [Firestore Security Rules Documentation](https://firebase.google.com/docs/firestore/security/get-started)
- [Common Security Rules patterns](https://firebase.google.com/docs/firestore/security/rules-structure)
- [Test your Security Rules](https://firebase.google.com/docs/rules/unit-tests)

---

**חשוב**: Security Rules הם שכבת ההגנה הראשונה שלך. ודא שהם תמיד מעודכנים ומוגדרים נכון!

