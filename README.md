# AŞHUR — Luxury Perfume Storefront

متجر عطور فاخر ثابت (Static SPA) بواجهة عربية/عبرية RTL، ولوحة تحكم، ودعم PWA.

- **Stack:** Vite + React 19 + TypeScript + Tailwind v4 + framer-motion + lucide-react
- **Live:** <https://scentro.onrender.com>
- **Admin:** <https://scentro.onrender.com/#/admin>

## التشغيل

```bash
npm install
npm run dev       # http://localhost:5173
npm run build     # tsc --noEmit && vite build  → dist/
npm run preview   # http://localhost:4173
```

## وضعان للبيانات

| الوضع | متى | ماذا يحدث |
|---|---|---|
| **محلي** (افتراضي) | بدون متغيرات بيئة | كل شيء في `localStorage` + `IndexedDB`، التعديلات لهذا المتصفح فقط |
| **سحابي** | بعد ضبط `VITE_SUPABASE_URL` و`VITE_SUPABASE_ANON_KEY` | لوحة التحكم تنشر لكل الزوار، والوسائط تُرفع إلى التخزين السحابي |

خطوات تفعيل الوضع السحابي (10 دقائق، مجاناً): **[SYNC.md](./SYNC.md)**

## البنية

```
src/
  App.tsx            الهيكل + توجيه hash + السلة
  cms/
    types.ts         أنواع البيانات
    normalize.ts     البذور + التحقق من صحة البيانات الواردة
    seedCatalog.ts   10 منتجات + 4 تصنيفات + 3 فيديوهات
    seedSite.ts      المحتوى (عربي/عبري) + الإعدادات + نصوص الواجهة
    store.tsx        الحالة + الحفظ + النشر
    remote.ts        Supabase (REST + Storage) عبر fetch فقط
    media.ts         IndexedDB + الرفع السحابي
    migrate.ts       ترحيل الوسائط المحلية إلى السحابة
  admin/Admin.tsx    لوحة التحكم (منتجات، تصنيفات، دور، فيديو، محتوى، نصوص، إعدادات)
  components/        أقسام الواجهة
public/              PWA (manifest + sw.js) + أيقونات + فيديو + صور
supabase/schema.sql  إعداد قاعدة البيانات والتخزين وسياسات RLS
```

## ملاحظات

- التوجيه بالـ hash (`#/admin`) ليعمل على أي استضافة ثابتة بلا rewrites.
- `VITE_*` تُدمج وقت البناء — أعد النشر بعد تغييرها.
- **إدارة المساحة:** من تبويب «الإعدادات» → «الوسائط في السحابة»: ترى اجمالي `N ملف · X MB` وزر حذف لكل ملف (للملفات المرجعة غير المتاحة أولاً). يُنصح بإفراغ الفيديو الضخم بعد نشره على CDN (أو حذفه من bucket) — الروابط تُعيد رسمها بعد رفع الملف أولاً.
- لا تضع أسراراً في متغيرات `VITE_*`؛ مفتاح Supabase `anon` عام بطبيعته والحماية من RLS.
