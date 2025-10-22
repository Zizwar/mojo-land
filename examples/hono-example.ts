/**
 * Mojo Land v2.0 - Hono Framework Example
 *
 * This example shows how to use Mojo Land with Hono
 */

import { Hono } from 'https://deno.land/x/hono@v4.0.9/mod.ts';
import { createClient } from 'https://cdn.skypack.dev/@supabase/supabase-js';
import * as cookies from 'https://deno.land/x/hono/helper.ts';
import { MojoCore } from '../core/MojoCore.ts';
import { HonoAdapter } from '../adapters/HonoAdapter.ts';
import { corsMiddleware } from '../middleware.ts';

// Initialize Supabase
const supabase = createClient(
  Deno.env.get('SUPABASE_API_URL')!,
  Deno.env.get('SUPABASE_ANON_KEY')!
);

// Initialize Mojo with AI support
const mojo = new MojoCore({
  tableName: 'mojos',
  tokenName: 'token',
  paramName: 'land',
  supabase,
  cookies,
  aiProvider: {
    apiKey: Deno.env.get('OPENROUTER_API_KEY')!,
    baseURL: 'https://openrouter.ai/api/v1',
    defaultModel: 'openai/gpt-3.5-turbo'
  }
});

// Add custom addons
mojo.use({
  customFunction: (data: any) => {
    console.log('Custom function called:', data);
    return data;
  }
});

// Create Hono app
const app = new Hono();

// Apply CORS middleware
app.use('*', corsMiddleware);

// Create Hono adapter
const adapter = new HonoAdapter(mojo);

// Setup routes
app.get('/', (ctx) => {
  return ctx.json({
    message: 'Mojo Land v2.0 with Hono',
    version: '2.0.0',
    features: [
      'AI-Powered Endpoints',
      'Dynamic API Generation',
      'Natural Language Queries',
      'Framework Agnostic'
    ],
    endpoints: {
      api: '/api/:land',
      ai_generate: '/ai/generate',
      ai_query: '/ai/query'
    }
  });
});

// Main API routes
app
  .get('/api/:land', adapter.handler())
  .post('/api/:land', adapter.handler())
  .put('/api/:land', adapter.handler())
  .delete('/api/:land', adapter.handler());

// AI Endpoint Generation Route
app.post('/ai/generate', async (ctx) => {
  try {
    const body = await ctx.req.json();
    const generator = mojo.getEndpointGenerator();

    if (!generator) {
      return ctx.json({ error: 'AI service not configured' }, 500);
    }

    const result = await generator.generateFromPrompt({
      prompt: body.prompt,
      table: body.table,
      permissions: body.permissions,
      model: body.model
    });

    return ctx.json(result);
  } catch (error) {
    return ctx.json({ error: error.message }, 500);
  }
});

// AI Query Route
app.post('/ai/query', async (ctx) => {
  try {
    const body = await ctx.req.json();
    const smartQuery = mojo.getSmartQuery();

    if (!smartQuery) {
      return ctx.json({ error: 'AI service not configured' }, 500);
    }

    const result = await smartQuery.query({
      endpoint: body.endpoint,
      query: body.query,
      context: body.context,
      model: body.model
    });

    return ctx.json(result);
  } catch (error) {
    return ctx.json({ error: error.message }, 500);
  }
});

// Generate CRUD endpoints for a table
app.post('/ai/generate-crud', async (ctx) => {
  try {
    const body = await ctx.req.json();
    const generator = mojo.getEndpointGenerator();

    if (!generator) {
      return ctx.json({ error: 'AI service not configured' }, 500);
    }

    const result = await generator.generateCRUDEndpoints(
      body.tableName,
      body.baseEndpoint,
      body.permissions
    );

    return ctx.json({
      success: true,
      endpoints: result
    });
  } catch (error) {
    return ctx.json({ error: error.message }, 500);
  }
});

// List all endpoints
app.get('/endpoints', async (ctx) => {
  try {
    const generator = mojo.getEndpointGenerator();

    if (!generator) {
      return ctx.json({ error: 'AI service not configured' }, 500);
    }

    const endpoints = await generator.listEndpoints({
      status: ctx.req.query('status'),
      table: ctx.req.query('table')
    });

    return ctx.json({
      success: true,
      count: endpoints.length,
      endpoints
    });
  } catch (error) {
    return ctx.json({ error: error.message }, 500);
  }
});

// Health check
app.get('/health', (ctx) => {
  return ctx.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '2.0.0'
  });
});

// Start server
console.log('🚀 Mojo Land v2.0 server starting...');
console.log('📍 Listening on http://localhost:8000');
console.log('🤖 AI Features: ENABLED');
console.log('📚 Documentation: /');

Deno.serve({ port: 8000 }, app.fetch);
