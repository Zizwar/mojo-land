# Mojo Land v2.0 🚀

**إطار عمل API ديناميكي مدعوم بالذكاء الاصطناعي - مستقل عن Framework**

Mojo Land هو إطار عمل ثوري يتيح لك بناء واجهات برمجة تطبيقات ديناميكية بقدرات الذكاء الاصطناعي. قم بإنشاء endpoints من اللغة الطبيعية، واستعلم عن البيانات باستخدام prompts، واعمل مع أي إطار عمل ويب.

## ✨ الجديد في الإصدار 2.0

- 🤖 **إنشاء Endpoints بالذكاء الاصطناعي** - أنشئ endpoints من أوصاف باللغة الطبيعية
- 🔍 **استعلامات ذكية** - استعلم عن بياناتك باستخدام اللغة الطبيعية بدلاً من الفلاتر المعقدة
- 🎯 **مستقل عن Framework** - يعمل مع Hono و Express و Next.js و Koa والمزيد
- 🌐 **تكامل OpenRouter** - الوصول إلى نماذج AI متعددة (GPT-4، Claude، Llama، إلخ)
- 🔐 **أمان محسّن** - نظام صلاحيات محسّن قائم على الأدوار
- 📊 **رؤى ذكية** - احصل على تحليل وإحصاءات ذكية للبيانات
- 🎨 **بنية أفضل** - فصل واضح بين المنطق الأساسي ومحولات الـ frameworks

## 🎯 المميزات

### المميزات الأساسية
- ✅ **Endpoints ديناميكية** - قم بتكوين endpoints في قاعدة البيانات، لا حاجة لنشر الكود
- ✅ **عمليات CRUD** - دعم كامل لعمليات الإنشاء والقراءة والتحديث والحذف
- ✅ **دوال مخصصة** - قم بتنفيذ دوال JavaScript ديناميكية مخزنة في قاعدة البيانات
- ✅ **فلترة متقدمة** - دعم الاستعلامات المعقدة (eq, gt, lt, like, ilike, in، إلخ)
- ✅ **ترقيم وترتيب الصفحات** - دعم مدمج لترقيم البيانات وترتيبها
- ✅ **التحكم في الوصول حسب الأدوار** - صلاحيات دقيقة لكل endpoint ولكل طريقة
- ✅ **نظام تسجيل** - تسجيل شامل للطلبات والأخطاء

### مميزات الذكاء الاصطناعي (جديد)
- 🤖 **إنشاء Endpoints** - إنشاء API endpoints من اللغة الطبيعية
- 🔍 **استعلامات باللغة الطبيعية** - استعلم عن البيانات باستخدام اللغة العربية أو الإنجليزية
- 📝 **إنشاء SQL** - تحويل اللغة الطبيعية إلى استعلامات SQL
- 🔎 **بحث ذكي** - بحث ذكي عبر حقول متعددة
- 📊 **رؤى البيانات** - تحليل البيانات والإحصاءات المدعومة بالذكاء الاصطناعي
- 🎯 **واعٍ بالسياق** - يفهم بنية قاعدة البيانات تلقائيًا

### دعم Frameworks
- 🌟 **Hono** - سريع، خفيف، مبني على معايير الويب
- ⚡ **Express** - أشهر إطار عمل Node.js
- ▲ **Next.js** - App Router و Pages Router
- 🥝 **Koa** - إطار عمل حديث وبسيط
- 🚄 **Fastify** - قريبًا
- 🔌 **محولات مخصصة** - سهولة إضافة الدعم لأي framework

## 📦 التثبيت

```bash
# استخدام npm
npm install mojo-land

# استخدام yarn
yarn add mojo-land

# استخدام pnpm
pnpm add mojo-land
```

## 🚀 البدء السريع

### 1. إعداد قاعدة البيانات

قم بتشغيل ملف SQL في قاعدة بيانات Supabase أو PostgreSQL:

```bash
psql -d your_database -f sql/setup-complete.sql
```

أو انسخ محتويات `sql/setup-complete.sql` وقم بتشغيله في Supabase SQL Editor.

### 2. متغيرات البيئة

أنشئ ملف `.env`:

```env
# إعدادات Supabase
SUPABASE_API_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# إعدادات OpenRouter (لمميزات الذكاء الاصطناعي)
OPENROUTER_API_KEY=your-openrouter-api-key
```

احصل على مفتاح OpenRouter API من: https://openrouter.ai/

### 3. اختر Framework

#### Hono (Deno)

```typescript
import { Hono } from 'https://deno.land/x/hono/mod.ts';
import { createClient } from '@supabase/supabase-js';
import { MojoCore, HonoAdapter } from 'mojo-land';

const supabase = createClient(
  Deno.env.get('SUPABASE_API_URL')!,
  Deno.env.get('SUPABASE_ANON_KEY')!
);

const mojo = new MojoCore({
  supabase,
  aiProvider: {
    apiKey: Deno.env.get('OPENROUTER_API_KEY')!,
    defaultModel: 'openai/gpt-3.5-turbo'
  }
});

const app = new Hono();
const adapter = new HonoAdapter(mojo);

app.get('/api/:land', adapter.handler());
app.post('/api/:land', adapter.handler());

Deno.serve(app.fetch);
```

#### Express (Node.js)

```javascript
const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const { MojoCore, ExpressAdapter } = require('mojo-land');

const supabase = createClient(
  process.env.SUPABASE_API_URL,
  process.env.SUPABASE_ANON_KEY
);

const mojo = new MojoCore({
  supabase,
  aiProvider: {
    apiKey: process.env.OPENROUTER_API_KEY,
    defaultModel: 'openai/gpt-3.5-turbo'
  }
});

const app = express();
const adapter = new ExpressAdapter(mojo);

adapter.setupRoutes(app, '/api/:land');

app.listen(3000);
```

#### Next.js (App Router)

```typescript
// app/api/[land]/route.ts
import { createClient } from '@supabase/supabase-js';
import { MojoCore, NextJSAdapter } from 'mojo-land';

const supabase = createClient(
  process.env.SUPABASE_API_URL!,
  process.env.SUPABASE_ANON_KEY!
);

const mojo = new MojoCore({
  supabase,
  aiProvider: {
    apiKey: process.env.OPENROUTER_API_KEY!,
    defaultModel: 'openai/gpt-3.5-turbo'
  }
});

const adapter = new NextJSAdapter(mojo);

export const { GET, POST, PUT, DELETE } = adapter.routeHandlers();
```

## 🤖 استخدام مميزات الذكاء الاصطناعي

### 1. إنشاء Endpoint من اللغة الطبيعية

```bash
POST /ai/generate
Content-Type: application/json

{
  "prompt": "أنشئ endpoint لعرض جميع المستخدمين النشطين مع البريد الإلكتروني والاسم، مع ترقيم الصفحات، ويمكن الوصول إليه من قبل المدراء فقط",
  "table": "users",
  "permissions": ["admin"]
}
```

الاستجابة:
```json
{
  "success": true,
  "endpoint": {
    "endpoint": "list-active-users",
    "method": "get",
    "table": "users",
    "columns": "email,name",
    "permissions": {"get": "admin"},
    "status": "active"
  }
}
```

### 2. استعلام باللغة الطبيعية

```bash
POST /api/users
Content-Type: application/json

{
  "ai_query": "أرني جميع المستخدمين الذين سجلوا الشهر الماضي وهم نشطون"
}
```

الاستجابة:
```json
{
  "success": true,
  "data": [...],
  "sql": "SELECT * FROM users WHERE created_at >= '2024-01-01' AND is_active = true"
}
```

### 3. إنشاء CRUD Endpoints تلقائيًا

```bash
POST /ai/generate-crud
Content-Type: application/json

{
  "tableName": "products",
  "baseEndpoint": "products",
  "permissions": {
    "get": "public",
    "create": "user",
    "update": "user",
    "delete": "admin"
  }
}
```

ينشئ 4 endpoints تلقائيًا:
- `GET /api/products/list` - عرض جميع المنتجات
- `POST /api/products/create` - إنشاء منتج جديد
- `PUT /api/products/update` - تحديث منتج
- `DELETE /api/products/delete` - حذف منتج

### 4. البحث الذكي

```bash
POST /ai/search
Content-Type: application/json

{
  "tableName": "products",
  "searchQuery": "لابتوب كمبيوتر",
  "searchFields": ["name", "description", "category"]
}
```

### 5. إنشاء SQL من اللغة الطبيعية

```bash
POST /ai/generate-sql
Content-Type: application/json

{
  "query": "احضر أفضل 10 منتجات حسب المبيعات في آخر 30 يومًا",
  "tableName": "products"
}
```

الاستجابة:
```json
{
  "success": true,
  "sql": "SELECT * FROM products WHERE created_at >= NOW() - INTERVAL '30 days' ORDER BY sales DESC LIMIT 10"
}
```

## 📚 التكوين

### تكوين Endpoint

يتم تكوين Endpoints في جدول `mojos` بهذه الحقول:

| الحقل | النوع | الوصف |
|-------|------|-------------|
| `endpoint` | TEXT | اسم endpoint فريد |
| `method` | TEXT | طريقة HTTP: get, post, create, update, delete, function |
| `table` | TEXT | اسم جدول قاعدة البيانات |
| `columns` | TEXT | الأعمدة المسموح بها (مفصولة بفواصل أو "all") |
| `permissions` | JSONB | الصلاحيات لكل طريقة: `{"get": "public", "create": "user"}` |
| `filters` | JSONB | الفلاتر المسموح بها: `{"eq": ["name", "status"]}` |
| `role` | TEXT | العمود للأمان على مستوى الصف (مثل "user_id") |
| `ai_enabled` | BOOLEAN | تفعيل استعلامات الذكاء الاصطناعي لهذا endpoint |
| `ai_config` | JSONB | إعدادات الذكاء الاصطناعي: النموذج، الحرارة، إلخ |

### تكوين الذكاء الاصطناعي

```typescript
const mojo = new MojoCore({
  supabase,
  aiProvider: {
    apiKey: 'your-openrouter-key',
    baseURL: 'https://openrouter.ai/api/v1',  // اختياري
    defaultModel: 'openai/gpt-4'  // اختياري، الافتراضي gpt-3.5-turbo
  }
});
```

النماذج المدعومة (عبر OpenRouter):
- `openai/gpt-4`
- `openai/gpt-3.5-turbo`
- `anthropic/claude-3-opus`
- `anthropic/claude-3-sonnet`
- `meta-llama/llama-3-70b`
- `google/gemini-pro`
- والمزيد...

## 🔒 الأمان

### أمان مستوى الصف (RLS)

```sql
-- تفعيل RLS على جدول mojos
ALTER TABLE mojos ENABLE ROW LEVEL SECURITY;

-- المستخدمون يمكنهم رؤية endpoints الخاصة بهم فقط
CREATE POLICY "Users see own endpoints"
  ON mojos FOR SELECT
  USING (auth.uid() = "userId");
```

### مصادقة رمز API

```typescript
// طلب العميل
fetch('/api/users', {
  headers: {
    'Authorization': 'Bearer your-token-here'
  }
});
```

### الصلاحيات القائمة على الأدوار

```json
{
  "endpoint": "admin-dashboard",
  "permissions": {
    "get": "admin",
    "post": "admin,moderator",
    "delete": "admin"
  }
}
```

## 📖 أمثلة

تحقق من مجلد `/examples` للأمثلة الكاملة:

- `examples/hono-example.ts` - Hono مع Deno
- `examples/express-example.js` - Express مع Node.js
- `examples/nextjs-example.ts` - Next.js App Router

## 🏗️ البنية المعمارية

```
mojo-land/
├── core/
│   └── MojoCore.ts          # النواة المستقلة عن Framework
├── services/
│   ├── AIService.ts         # تكامل OpenRouter
│   ├── EndpointGenerator.ts # إنشاء endpoints بالذكاء الاصطناعي
│   └── SmartQueryService.ts # استعلامات اللغة الطبيعية
├── adapters/
│   ├── HonoAdapter.ts       # محول Hono
│   ├── ExpressAdapter.ts    # محول Express
│   ├── NextJSAdapter.ts     # محول Next.js
│   └── KoaAdapter.ts        # محول Koa
├── types/
│   └── index.ts             # أنواع TypeScript
└── sql/
    ├── setup-complete.sql   # إعداد كامل لقاعدة البيانات
    └── 7-ai-helpers.sql     # دوال مساعدة للذكاء الاصطناعي
```

## 🔧 الاستخدام المتقدم

### إضافات مخصصة (Addons)

```typescript
mojo.use({
  myCustomFunction: async (data) => {
    // منطقك المخصص
    return processedData;
  },
  anotherHelper: (x, y) => x + y
});
```

هذه الإضافات متاحة في الدوال الديناميكية:

```javascript
// في حقل function للـ endpoint
const result = await mojo.myCustomFunction(data);
return mojo.json(result);
```

### الدوال الديناميكية

قم بتخزين كود قابل للتنفيذ في قاعدة البيانات:

```sql
INSERT INTO mojos (endpoint, method, function) VALUES (
  'custom-logic',
  'function',
  '
    const { user, body, supabase } = mojo;

    // منطقك المخصص هنا
    const data = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", user.id);

    return mojo.json(data);
  '
);
```

## 🤝 المساهمة

المساهمات مرحب بها! يرجى قراءة إرشادات المساهمة وإرسال pull requests.

## 📝 الترخيص

ISC © إبراهيم بيدي

## 🙏 شكر وتقدير

- **OpenRouter** - واجهة برمجة تطبيقات AI متعددة النماذج
- **Supabase** - Backend as a Service
- **Hono** - إطار عمل ويب فائق السرعة
- **Express** - إطار عمل ويب لـ Node.js
- **Next.js** - إطار عمل React

## 📞 الدعم

- مشاكل GitHub: [إنشاء مشكلة](https://github.com/Zizwar/mojo-land/issues)
- المناقشات: [انضم للمناقشات](https://github.com/Zizwar/mojo-land/discussions)

## 🗺️ خارطة الطريق

- [ ] دعم WebSocket
- [ ] محول GraphQL
- [ ] اشتراكات في الوقت الفعلي
- [ ] معالجة رفع الملفات
- [ ] تحديد المعدل
- [ ] إصدارات API
- [ ] توليد توثيق OpenAPI/Swagger
- [ ] لوحة تحكم الإدارة
- [ ] أداة CLI لإدارة endpoints

---

صُنع بـ ❤️ من قبل [إبراهيم بيدي](https://github.com/Zizwar)

⭐ ضع نجمة على GitHub إذا وجدت هذا المشروع مفيدًا!
