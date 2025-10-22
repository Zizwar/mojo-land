/**
 * Mojo Land v2.0 - Express.js Example
 *
 * This example shows how to use Mojo Land with Express
 */

const express = require('express');
const { createClient } = require('@supabase/supabase-js');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const { MojoCore } = require('../dist/cjs/core/MojoCore');
const { ExpressAdapter } = require('../dist/cjs/adapters/ExpressAdapter');

// Initialize Express
const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_API_URL,
  process.env.SUPABASE_ANON_KEY
);

// Cookie helper functions for Express
const cookies = {
  getCookie: (ctx, name) => ctx.cookies[name],
  setCookie: (ctx, name, value, options) => {
    ctx.cookie(name, value, options);
  }
};

// Initialize Mojo with AI support
const mojo = new MojoCore({
  tableName: 'mojos',
  tokenName: 'token',
  paramName: 'land',
  supabase,
  cookies,
  aiProvider: {
    apiKey: process.env.OPENROUTER_API_KEY,
    baseURL: 'https://openrouter.ai/api/v1',
    defaultModel: 'openai/gpt-3.5-turbo'
  }
});

// Add custom addons
mojo.use({
  customHelper: (data) => {
    console.log('Custom helper called:', data);
    return { ...data, processed: true };
  }
});

// Create Express adapter
const adapter = new ExpressAdapter(mojo);

// Routes

// Home route
app.get('/', (req, res) => {
  res.json({
    message: 'Mojo Land v2.0 with Express.js',
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
      ai_query: '/ai/query',
      ai_crud: '/ai/generate-crud'
    }
  });
});

// Setup Mojo API routes
adapter.setupRoutes(app, '/api/:land');

// AI Endpoint Generation
app.post('/ai/generate', async (req, res) => {
  try {
    const { prompt, table, permissions, model } = req.body;
    const generator = mojo.getEndpointGenerator();

    if (!generator) {
      return res.status(500).json({ error: 'AI service not configured' });
    }

    const result = await generator.generateFromPrompt({
      prompt,
      table,
      permissions,
      model
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// AI Natural Language Query
app.post('/ai/query', async (req, res) => {
  try {
    const { endpoint, query, context, model } = req.body;
    const smartQuery = mojo.getSmartQuery();

    if (!smartQuery) {
      return res.status(500).json({ error: 'AI service not configured' });
    }

    const result = await smartQuery.query({
      endpoint,
      query,
      context,
      model
    });

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate CRUD endpoints
app.post('/ai/generate-crud', async (req, res) => {
  try {
    const { tableName, baseEndpoint, permissions } = req.body;
    const generator = mojo.getEndpointGenerator();

    if (!generator) {
      return res.status(500).json({ error: 'AI service not configured' });
    }

    const result = await generator.generateCRUDEndpoints(
      tableName,
      baseEndpoint,
      permissions
    );

    res.json({
      success: true,
      endpoints: result
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// List all endpoints
app.get('/endpoints', async (req, res) => {
  try {
    const generator = mojo.getEndpointGenerator();

    if (!generator) {
      return res.status(500).json({ error: 'AI service not configured' });
    }

    const { status, table } = req.query;
    const endpoints = await generator.listEndpoints({ status, table });

    res.json({
      success: true,
      count: endpoints.length,
      endpoints
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// AI Smart Search
app.post('/ai/search', async (req, res) => {
  try {
    const { tableName, searchQuery, searchFields, model } = req.body;
    const smartQuery = mojo.getSmartQuery();

    if (!smartQuery) {
      return res.status(500).json({ error: 'AI service not configured' });
    }

    const result = await smartQuery.smartSearch(
      tableName,
      searchQuery,
      searchFields,
      model
    );

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Generate SQL from natural language
app.post('/ai/generate-sql', async (req, res) => {
  try {
    const { query, tableName, model } = req.body;
    const smartQuery = mojo.getSmartQuery();

    if (!smartQuery) {
      return res.status(500).json({ error: 'AI service not configured' });
    }

    const result = await smartQuery.generateSQL(query, tableName, model);

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    version: '2.0.0',
    framework: 'Express.js'
  });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Error:', err);
  res.status(500).json({
    error: 'Internal server error',
    message: err.message
  });
});

// Start server
app.listen(PORT, () => {
  console.log('🚀 Mojo Land v2.0 server starting...');
  console.log(`📍 Listening on http://localhost:${PORT}`);
  console.log('🤖 AI Features: ENABLED');
  console.log('⚡ Framework: Express.js');
  console.log(`📚 Documentation: http://localhost:${PORT}/`);
});

module.exports = app;
