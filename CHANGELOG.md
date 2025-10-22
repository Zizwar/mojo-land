# Changelog

All notable changes to Mojo Land will be documented in this file.

## [2.0.0] - 2024-10-22

### 🎉 Major Release - Complete Rewrite

This is a major release with breaking changes and extensive new features.

### ✨ Added

#### AI Features
- **AI-Powered Endpoint Generation** - Generate API endpoints from natural language descriptions
- **Smart Queries** - Query data using natural language instead of complex filters
- **SQL Generation** - Convert natural language to SQL queries
- **Smart Search** - Intelligent search across multiple fields
- **Data Insights** - AI-powered data analysis and insights
- **OpenRouter Integration** - Support for multiple AI models (GPT-4, Claude, Llama, etc.)

#### Framework Support
- **Framework Agnostic Core** - Complete separation of core logic from framework-specific code
- **Hono Adapter** - Full support for Hono framework
- **Express Adapter** - Full support for Express.js
- **Next.js Adapter** - Support for both App Router and Pages Router
- **Koa Adapter** - Full support for Koa framework

#### Services
- `AIService` - Unified service for AI operations with OpenRouter
- `EndpointGenerator` - Service for generating endpoints using AI
- `SmartQueryService` - Service for natural language data queries

#### Database
- Enhanced `mojos` table with AI configuration fields:
  - `ai_enabled` - Enable/disable AI for endpoints
  - `ai_config` - Store AI model configuration
  - `ai_prompt_template` - Custom prompt templates
  - `ai_context_fields` - Fields to include in AI context
- New SQL helper functions for AI:
  - `get_table_schema()` - Get table structure
  - `get_all_tables_schema()` - List all tables
  - `execute_sql()` - Safely execute SELECT queries
  - `get_table_sample()` - Get sample data
  - `get_table_stats()` - Get table statistics

#### Documentation
- Comprehensive English documentation (README-v2.md)
- Complete Arabic documentation (README-AR.md)
- Framework-specific examples:
  - Hono example with Deno
  - Express example with Node.js
  - Next.js example with App Router

### 🔄 Changed

#### Breaking Changes
- **Complete Architecture Rewrite** - Core logic is now framework-agnostic
- **New Import Paths** - Use `mojo-land` instead of importing from specific files
- **Configuration Format** - New configuration object structure
- **Method Names** - Some internal methods renamed for clarity

#### Improvements
- **Better TypeScript Support** - Complete type definitions for all features
- **Enhanced Security** - Improved role-based access control
- **Better Error Handling** - More descriptive error messages
- **Performance** - Optimized query processing
- **Code Organization** - Clean separation of concerns

### 📝 Migration Guide

#### From v0.9.x to v2.0.0

**Old Code (v0.9.x):**
```javascript
import Mojo from 'npm:mojo-land';
const mojo = new Mojo();
mojo.supabase(supabase);
mojo.tableName('mojos');
```

**New Code (v2.0.0):**
```javascript
import { MojoCore, HonoAdapter } from 'mojo-land';
const mojo = new MojoCore({
  supabase,
  tableName: 'mojos',
  aiProvider: {
    apiKey: 'your-key',
    defaultModel: 'openai/gpt-3.5-turbo'
  }
});
const adapter = new HonoAdapter(mojo);
```

### 🗑️ Removed

- Direct framework coupling in core
- Old GPT class (replaced by AIService with OpenRouter)
- Deprecated methods and properties

### 🐛 Fixed

- Various bug fixes in query processing
- Improved filter handling
- Better error messages
- Memory leaks in dynamic function execution

### 🔐 Security

- Enhanced input validation
- Better SQL injection prevention
- Improved authentication handling
- Row-level security examples

## [0.9.0] - Previous Release

### Features
- Basic dynamic endpoint configuration
- CRUD operations
- Role-based permissions
- Dynamic functions
- Supabase integration
- Hono framework support

---

For more details, see the [README](README-v2.md) and [documentation](https://github.com/Zizwar/mojo-land).
