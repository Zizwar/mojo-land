# Mojo Land v2.0 🚀

**AI-Powered Dynamic API Framework - Framework Agnostic**

Mojo Land is a revolutionary framework that allows you to build dynamic APIs with AI capabilities. Generate endpoints from natural language, query data using prompts, and work with any web framework.

[![Version](https://img.shields.io/badge/version-2.0.0-blue.svg)](https://github.com/Zizwar/mojo-land)
[![License](https://img.shields.io/badge/license-ISC-green.svg)](LICENSE)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.5+-blue.svg)](https://www.typescriptlang.org/)

## ✨ What's New in v2.0

- 🤖 **AI-Powered Endpoint Generation** - Create endpoints from natural language descriptions
- 🔍 **Smart Queries** - Query your data using natural language instead of complex filters
- 🎯 **Framework Agnostic** - Works with Hono, Express, Next.js, Koa, and more
- 🌐 **OpenRouter Integration** - Access multiple AI models (GPT-4, Claude, Llama, etc.)
- 🔐 **Enhanced Security** - Improved role-based access control
- 📊 **AI Insights** - Get intelligent data analysis and insights
- 🎨 **Better Architecture** - Clean separation of core logic and framework adapters

## 🎯 Features

### Core Features
- ✅ **Dynamic API Endpoints** - Configure endpoints in database, no code deployment needed
- ✅ **CRUD Operations** - Full support for Create, Read, Update, Delete operations
- ✅ **Custom Functions** - Execute dynamic JavaScript functions stored in database
- ✅ **Advanced Filtering** - Support for complex queries (eq, gt, lt, like, ilike, in, etc.)
- ✅ **Pagination & Sorting** - Built-in support for data pagination and ordering
- ✅ **Role-Based Access Control** - Fine-grained permissions per endpoint and method
- ✅ **Logging System** - Comprehensive request and error logging

### AI Features (NEW)
- 🤖 **Endpoint Generation** - Generate API endpoints from natural language
- 🔍 **Natural Language Queries** - Query data using plain English
- 📝 **SQL Generation** - Convert natural language to SQL queries
- 🔎 **Smart Search** - Intelligent search across multiple fields
- 📊 **Data Insights** - AI-powered data analysis and insights
- 🎯 **Context-Aware** - Understands your database schema automatically

### Framework Support
- 🌟 **Hono** - Fast, lightweight, built on Web Standards
- ⚡ **Express** - The most popular Node.js framework
- ▲ **Next.js** - Both App Router and Pages Router
- 🥝 **Koa** - Modern, minimalist framework
- 🚄 **Fastify** - Coming soon
- 🔌 **Custom Adapters** - Easy to add support for any framework

## 📦 Installation

```bash
# Using npm
npm install mojo-land

# Using yarn
yarn add mojo-land

# Using pnpm
pnpm add mojo-land
```

## 🚀 Quick Start

### 1. Database Setup

Run the setup SQL file in your Supabase or PostgreSQL database:

```bash
psql -d your_database -f sql/setup-complete.sql
```

Or copy the contents of `sql/setup-complete.sql` and run it in Supabase SQL Editor.

### 2. Environment Variables

Create a `.env` file:

```env
# Supabase Configuration
SUPABASE_API_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# OpenRouter Configuration (for AI features)
OPENROUTER_API_KEY=your-openrouter-api-key
```

Get your OpenRouter API key from: https://openrouter.ai/

### 3. Choose Your Framework

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

## 🤖 AI Features Usage

### 1. Generate Endpoint from Natural Language

```bash
POST /ai/generate
Content-Type: application/json

{
  "prompt": "Create an endpoint to list all active users with their email and name, paginated, accessible by admins only",
  "table": "users",
  "permissions": ["admin"]
}
```

Response:
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

### 2. Natural Language Query

```bash
POST /api/users
Content-Type: application/json

{
  "ai_query": "Show me all users who signed up last month and are active"
}
```

Response:
```json
{
  "success": true,
  "data": [...],
  "sql": "SELECT * FROM users WHERE created_at >= '2024-01-01' AND is_active = true"
}
```

### 3. Generate CRUD Endpoints

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

Creates 4 endpoints automatically:
- `GET /api/products/list` - List all products
- `POST /api/products/create` - Create new product
- `PUT /api/products/update` - Update product
- `DELETE /api/products/delete` - Delete product

### 4. Smart Search

```bash
POST /ai/search
Content-Type: application/json

{
  "tableName": "products",
  "searchQuery": "laptop computer",
  "searchFields": ["name", "description", "category"]
}
```

### 5. Generate SQL from Natural Language

```bash
POST /ai/generate-sql
Content-Type: application/json

{
  "query": "Get the top 10 products by sales in the last 30 days",
  "tableName": "products"
}
```

Response:
```json
{
  "success": true,
  "sql": "SELECT * FROM products WHERE created_at >= NOW() - INTERVAL '30 days' ORDER BY sales DESC LIMIT 10"
}
```

## 📚 Configuration

### Endpoint Configuration

Endpoints are configured in the `mojos` table with these fields:

| Field | Type | Description |
|-------|------|-------------|
| `endpoint` | TEXT | Unique endpoint name |
| `method` | TEXT | HTTP method(s): get, post, create, update, delete, function |
| `table` | TEXT | Database table name |
| `columns` | TEXT | Allowed columns (comma-separated or "all") |
| `permissions` | JSONB | Permissions per method: `{"get": "public", "create": "user"}` |
| `filters` | JSONB | Allowed filters: `{"eq": ["name", "status"]}` |
| `role` | TEXT | Column for row-level security (e.g., "user_id") |
| `ai_enabled` | BOOLEAN | Enable AI queries for this endpoint |
| `ai_config` | JSONB | AI settings: model, temperature, etc. |

### AI Configuration

```typescript
const mojo = new MojoCore({
  supabase,
  aiProvider: {
    apiKey: 'your-openrouter-key',
    baseURL: 'https://openrouter.ai/api/v1',  // Optional
    defaultModel: 'openai/gpt-4'  // Optional, defaults to gpt-3.5-turbo
  }
});
```

Supported models (via OpenRouter):
- `openai/gpt-4`
- `openai/gpt-3.5-turbo`
- `anthropic/claude-3-opus`
- `anthropic/claude-3-sonnet`
- `meta-llama/llama-3-70b`
- `google/gemini-pro`
- And many more...

## 🔒 Security

### Row-Level Security

```sql
-- Enable RLS on mojos table
ALTER TABLE mojos ENABLE ROW LEVEL SECURITY;

-- Users can only see their own endpoints
CREATE POLICY "Users see own endpoints"
  ON mojos FOR SELECT
  USING (auth.uid() = "userId");
```

### API Token Authentication

```typescript
// Client request
fetch('/api/users', {
  headers: {
    'Authorization': 'Bearer your-token-here'
  }
});
```

### Role-Based Permissions

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

## 📖 Examples

Check the `/examples` directory for complete examples:

- `examples/hono-example.ts` - Hono with Deno
- `examples/express-example.js` - Express with Node.js
- `examples/nextjs-example.ts` - Next.js App Router

## 🏗️ Architecture

```
mojo-land/
├── core/
│   └── MojoCore.ts          # Framework-agnostic core
├── services/
│   ├── AIService.ts         # OpenRouter integration
│   ├── EndpointGenerator.ts # AI endpoint generation
│   └── SmartQueryService.ts # Natural language queries
├── adapters/
│   ├── HonoAdapter.ts       # Hono framework adapter
│   ├── ExpressAdapter.ts    # Express adapter
│   ├── NextJSAdapter.ts     # Next.js adapter
│   └── KoaAdapter.ts        # Koa adapter
├── types/
│   └── index.ts             # TypeScript types
└── sql/
    ├── setup-complete.sql   # Complete database setup
    └── 7-ai-helpers.sql     # AI helper functions
```

## 🔧 Advanced Usage

### Custom Addons

```typescript
mojo.use({
  myCustomFunction: async (data) => {
    // Your custom logic
    return processedData;
  },
  anotherHelper: (x, y) => x + y
});
```

These addons are available in dynamic functions:

```javascript
// In endpoint function field
const result = await mojo.myCustomFunction(data);
return mojo.json(result);
```

### Dynamic Functions

Store executable code in the database:

```sql
INSERT INTO mojos (endpoint, method, function) VALUES (
  'custom-logic',
  'function',
  '
    const { user, body, supabase } = mojo;

    // Your custom logic here
    const data = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", user.id);

    return mojo.json(data);
  '
);
```

### Multiple Methods

```sql
INSERT INTO mojos (endpoint, method, methods) VALUES (
  'flexible',
  'get,post',
  '{
    "get": {"permissions": "public"},
    "post": {"permissions": "user"}
  }'
);
```

## 🤝 Contributing

Contributions are welcome! Please read our contributing guidelines and submit pull requests.

## 📝 License

ISC © Brahim BIDI

## 🙏 Credits

- **OpenRouter** - Multi-model AI API
- **Supabase** - Backend as a Service
- **Hono** - Ultrafast web framework
- **Express** - Web framework for Node.js
- **Next.js** - React framework

## 📞 Support

- GitHub Issues: [Create an issue](https://github.com/Zizwar/mojo-land/issues)
- Discussions: [Join discussions](https://github.com/Zizwar/mojo-land/discussions)

## 🗺️ Roadmap

- [ ] WebSocket support
- [ ] GraphQL adapter
- [ ] Real-time subscriptions
- [ ] File upload handling
- [ ] Rate limiting
- [ ] API versioning
- [ ] OpenAPI/Swagger documentation generation
- [ ] Admin dashboard
- [ ] CLI tool for endpoint management

---

Made with ❤️ by [Brahim BIDI](https://github.com/Zizwar)

⭐ Star us on GitHub if you find this project useful!
