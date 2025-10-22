/**
 * Mojo Land v2.0 - Next.js App Router Example
 *
 * This file should be placed in: app/api/[land]/route.ts
 *
 * For Pages Router, see the pagesHandler example at the bottom
 */

import { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { MojoCore } from 'mojo-land';
import { NextJSAdapter } from 'mojo-land/adapters';

// Initialize Supabase
const supabase = createClient(
  process.env.SUPABASE_API_URL!,
  process.env.SUPABASE_ANON_KEY!
);

// Cookie helper for Next.js
const cookies = {
  getCookie: (ctx: any, name: string) => {
    return ctx.cookies?.get(name)?.value;
  },
  setCookie: (ctx: any, name: string, value: string, options: any) => {
    ctx.cookies?.set(name, value, options);
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
    apiKey: process.env.OPENROUTER_API_KEY!,
    baseURL: 'https://openrouter.ai/api/v1',
    defaultModel: 'openai/gpt-3.5-turbo'
  }
});

// Create Next.js adapter
const adapter = new NextJSAdapter(mojo);

// Export route handlers for App Router
export const { GET, POST, PUT, DELETE } = adapter.routeHandlers();

// ============================================================
// Additional API Routes Examples
// ============================================================

/**
 * AI Generate Endpoint Route
 * File: app/api/ai/generate/route.ts
 */
export async function POST_AI_GENERATE(req: NextRequest) {
  try {
    const body = await req.json();
    const generator = mojo.getEndpointGenerator();

    if (!generator) {
      return Response.json(
        { error: 'AI service not configured' },
        { status: 500 }
      );
    }

    const result = await generator.generateFromPrompt({
      prompt: body.prompt,
      table: body.table,
      permissions: body.permissions,
      model: body.model
    });

    return Response.json(result);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

/**
 * AI Query Route
 * File: app/api/ai/query/route.ts
 */
export async function POST_AI_QUERY(req: NextRequest) {
  try {
    const body = await req.json();
    const smartQuery = mojo.getSmartQuery();

    if (!smartQuery) {
      return Response.json(
        { error: 'AI service not configured' },
        { status: 500 }
      );
    }

    const result = await smartQuery.query({
      endpoint: body.endpoint,
      query: body.query,
      context: body.context,
      model: body.model
    });

    return Response.json(result);
  } catch (error) {
    return Response.json(
      { error: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// ============================================================
// Pages Router Example (Legacy)
// ============================================================

/**
 * For Next.js Pages Router
 * File: pages/api/[land].ts
 */
export function createPagesHandler() {
  return adapter.pagesHandler();
}

// Example usage in pages/api/[land].ts:
/*
import { createPagesHandler } from '@/lib/mojo';

export default createPagesHandler();
*/

// ============================================================
// Client-Side Usage Example
// ============================================================

/**
 * Example React component using Mojo Land API
 */
export const ExampleComponent = `
'use client';

import { useState } from 'react';

export default function MojoExample() {
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  // Example: Fetch data from a Mojo endpoint
  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/my-endpoint');
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Example: Generate endpoint with AI
  const generateEndpoint = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: 'Create an endpoint to get all users with pagination',
          table: 'users',
          permissions: ['public']
        })
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Example: Natural language query
  const aiQuery = async (query: string) => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/query', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          endpoint: 'users',
          query: query
        })
      });
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Mojo Land v2.0 with Next.js</h1>

      <div className="space-y-4">
        <button
          onClick={fetchData}
          disabled={loading}
          className="px-4 py-2 bg-blue-500 text-white rounded"
        >
          Fetch Data
        </button>

        <button
          onClick={generateEndpoint}
          disabled={loading}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          Generate AI Endpoint
        </button>

        <button
          onClick={() => aiQuery('Show me all active users')}
          disabled={loading}
          className="px-4 py-2 bg-purple-500 text-white rounded"
        >
          AI Query
        </button>
      </div>

      {loading && <p className="mt-4">Loading...</p>}
      {result && (
        <pre className="mt-4 p-4 bg-gray-100 rounded overflow-auto">
          {JSON.stringify(result, null, 2)}
        </pre>
      )}
    </div>
  );
}
`;

// ============================================================
// Configuration Example
// ============================================================

/**
 * Environment Variables (.env.local)
 */
export const ENV_EXAMPLE = `
# Supabase Configuration
SUPABASE_API_URL=https://your-project.supabase.co
SUPABASE_ANON_KEY=your-anon-key

# OpenRouter Configuration (for AI features)
OPENROUTER_API_KEY=your-openrouter-api-key

# Optional: Customize default settings
MOJO_TABLE_NAME=mojos
MOJO_TOKEN_NAME=token
MOJO_PARAM_NAME=land
`;
