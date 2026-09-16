# YogaFace - מערכת ניהול קבוצת וואטסאפ + חדר פיקוד

מערכת שמנהלת אוטומטית קבוצת וואטסאפ בתשלום עבור עסק יוגה פנים:
- מוסיפה לקבוצה משתמשות ששילמו/מחודשות מנוי.
- מסירה מהקבוצה משתמשות שביטלו מנוי / שהמנוי שלהן פג.
- מספקת "חדר פיקוד" (דשבורד ויזואלי + צ'אט חכם בשפה חופשית + התראות/סיכום יזום) לבעלת העסק.

## איך זה עובד

```
Cardcom (סליקה/מנויים)
      │ webhook בכל תשלום/ביטול
      ▼
  server/  (Node.js + Express + Prisma/SQLite)
      │  מעדכן סטטוס חברה, ומחליט אם להוסיף/להסיר מהקבוצה
      ▼
Green API  (WhatsApp)  ──►  קבוצת הוואטסאפ בתשלום
      │
      ▼
  web/  (React דשבורד)  ──►  נועה: דשבורד, טבלת חברות, צ'אט תובנות, יומן פעילות
```

בנוסף לוובהוק, יש **cron** שרץ כל חצי שעה (`RECONCILE_CRON`) ומשווה בין הרשימה
בפועל בקבוצת הוואטסאפ לבין מה שבמסד הנתונים - כדי לתפוס מקרים של וובהוק
שלא הגיע, או מישהי שהוסרה/הצטרפה ידנית.

## מבנה הריפו

- `server/` - ה-API, אינטגרציית Green API ו-Cardcom, לוגיקת הסנכרון, ה-cron jobs, וה-AI insights.
- `web/` - דשבורד React (חדר הפיקוד).
- `docker-compose.yml` - מריץ שרת+דשבורד כשני שירותים נפרדים (לפיתוח/אחסון עצמי).
- `Dockerfile` (בשורש) + `render.yaml` - בונה את שניהם לכדי **שירות אחד** עם
  קישור יחיד (הדשבורד מוגש ישירות מהשרת) - זה מה שפורס ל-Render, ראו למטה.

## פריסה עם קישור אמיתי (דרך GitHub, ב-Render)

הריפו כבר מוכן לפריסת One-click מ-GitHub דרך [Render](https://render.com)
(יש להם tier חינמי). ל-Claude/לי אין אפשרות ליצור עבורך חשבון hosting או
טוקן API - זה שלב שרק את/ה יכול/ה לעשות, אבל הוא פשוט:

1. הרשמה/כניסה ל-[render.com](https://render.com) (אפשר להתחבר עם חשבון GitHub).
2. **New +** → **Blueprint**.
3. חיבור/בחירת הריפו `Roei2p/YogaFace`, וענף `claude/whatsapp-group-management-unfsrs`.
4. Render יזהה אוטומטית את `render.yaml` שבשורש הריפו ויציע ליצור שירות בשם
   `yogaface` (כולל דיסק קבוע לשמירת מסד הנתונים). לוחצים **Apply**.
5. אחרי כמה דקות הבנייה תסתיים ותקבל/י קישור קבוע בפורמט
   `https://yogaface-xxxx.onrender.com` - זה חדר הפיקוד, חי.
6. כניסה לדשבורד: הטוקן שנדרש (`DASHBOARD_API_TOKEN`) נוצר אוטומטית -
   רואים אותו ב-Render: השירות `yogaface` → **Environment**.
7. כדי להפעיל את חיבור הוואטסאפ/הסליקה/הצ'אט בפועל, ממלאים שם גם את שאר
   המשתנים (`GREEN_API_*`, `WHATSAPP_GROUP_ID`, `CARDCOM_*`, `NVIDIA_API_KEY`)
   לפי ההוראות בסעיפים 1-3 למטה, ושומרים - Render יפרוס מחדש אוטומטית.

בלי המשתנים האלה המערכת עדיין עולה ועובדת (דשבורד ריק, אפשר לייבא חברות
ידנית ב-CSV) - הם רק מפעילים כל פיצ'ר בנפרד.

## התקנה - שלב אחר שלב

### 1. WhatsApp - Green API

1. הרשמה ב-[green-api.com](https://green-api.com), יצירת instance חדש.
2. סריקת קוד ה-QR עם מספר הוואטסאפ שינהל את הקבוצה (מומלץ מספר ייעודי, לא האישי).
3. יצירת קבוצת וואטסאפ (או שימוש בקיימת) עם המספר הזה כאדמין.
4. העתקת `idInstance` ו-`apiTokenInstance` לתוך `.env` (`GREEN_API_ID_INSTANCE`, `GREEN_API_TOKEN`).
5. מזהה הקבוצה (`WHATSAPP_GROUP_ID`, בפורמט `xxxxxxxxxx-xxxxxxxxxx@g.us`) מתקבל
   דרך `GET /api/settings/whatsapp-group-preview` אחרי שההתקנה למעלה בוצעה, או
   מתועודת ה-API של Green API.

### 2. סליקה - Cardcom

Cardcom תומכת בהתראות (webhook) על אירועי חיוב/ביטול. **חשוב**: השדות המדויקים
בגוף ה-webhook לא אומתו מול תיעוד Cardcom בזמן כתיבת המערכת (לא הייתה גישת
רשת לאתר Cardcom בסביבת הפיתוח) - הם ב-`server/src/integrations/cardcom.ts`
(`fieldMap`) ומבוססים על מוסכמות ידועות של Cardcom. לפני עלייה לאוויר:

1. בפאנל הניהול של Cardcom, הגדירי את כתובת ה-webhook להיות:
   `https://<הדומיין שלך>/webhooks/cardcom/<CARDCOM_WEBHOOK_SECRET מה-.env>`
2. בצעי עסקת בדיקה (charge, ואם אפשר גם ביטול מנוי).
3. בדשבורד → יומן פעילות, או ישירות במסד הנתונים (`AuditEvent` מסוג `cardcom_raw`),
   תוכלי לראות את ה-payload הגולמי שהתקבל.
4. אם השמות של השדות שונים ממה שמוגדר ב-`fieldMap`, פשוט עדכני את המיפוי שם -
   שום קוד אחר לא צריך להשתנות.

**גיבוי זמני**: כל עוד ה-webhook לא מאומת סופית, אפשר לייבא/לעדכן חברות ידנית
דרך הדשבורד (עמוד "חברות" → ייבוא CSV, או שינוי סטטוס ידני בטבלה).

### 3. AI Insights (הצ'אט החכם)

המערכת קוראת למודל שפה דרך API תואם OpenAI (chat completions) - ברירת
המחדל מוגדרת ל-NVIDIA (build.nvidia.com / NIM):

1. יצירת מפתח API ב-[build.nvidia.com](https://build.nvidia.com).
2. מילוי `NVIDIA_API_KEY` ב-`.env`.
3. `NVIDIA_MODEL` ו-`NVIDIA_BASE_URL` ניתנים לשינוי אם רוצים מודל אחר מהקטלוג
   של NVIDIA, או להצביע על endpoint עצמאי (self-hosted NIM).

ללא מפתח, שאר המערכת (ניהול הקבוצה, הדשבורד, ההתראות) ממשיכה לעבוד כרגיל -
רק עמוד הצ'אט לא יפעל.

### 4. התראות/סיכום יומי

- אימייל: מלאי `SMTP_HOST/PORT/USER/PASS` ו-`NOTIFY_EMAIL_TO`.
- וואטסאפ: מלאי `NOTIFY_WHATSAPP_PHONE` (המספר של נועה).
- שעת השליחה נקבעת ב-`DIGEST_CRON` (ברירת מחדל: 8 בבוקר).

### 5. הרצה

```bash
cp .env.example .env   # ומילוי הערכים לפי השלבים למעלה
docker compose up --build
```

או הרצה מקומית לפיתוח:

```bash
# שרת
cd server
npm install
npx prisma migrate deploy
npm run dev

# דשבורד (טרמינל נפרד)
cd web
npm install
npm run dev
```

הדשבורד ירוץ על `http://localhost:5173`, השרת על `http://localhost:4000`.
בכניסה לדשבורד יש להזין את `DASHBOARD_API_TOKEN` שהוגדר ב-`.env`.

## אבטחה - לפני עלייה לאוויר בפועל

- `DASHBOARD_API_TOKEN` ו-`CARDCOM_WEBHOOK_SECRET` צריכים להיות מחרוזות אקראיות וארוכות.
- מומלץ להריץ מאחורי HTTPS (למשל דרך reverse proxy / Cloudflare).
- קובץ ה-SQLite (`server/data/yogaface.db`) הוא כל מסד הנתונים - כדאי לגבות אותו באופן קבוע.
- הדשבורד משתמש כרגע באימות טוקן יחיד (מתאים לשימוש של אדם אחד/צוות קטן).
  לריבוי משתמשות עם הרשאות שונות יש להוסיף מערכת התחברות מלאה.
