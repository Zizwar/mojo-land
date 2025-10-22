import type { NextRequest } from 'next/server';
import type { FrameworkAdapter, MojoRequest, MojoResponse } from '../types/index.ts';
import { MojoCore } from '../core/MojoCore.ts';

/**
 * NextJSAdapter - Adapter for Next.js App Router and API Routes
 */
export class NextJSAdapter implements FrameworkAdapter {
  private mojo: MojoCore;

  constructor(mojo: MojoCore) {
    this.mojo = mojo;
  }

  extractRequest(req: NextRequest, context?: any): MojoRequest {
    const url = new URL(req.url);
    const query = Object.fromEntries(url.searchParams.entries());

    return {
      method: req.method,
      query: (key?: string) => key ? query[key] : query,
      body: {},  // Will be populated later
      params: context?.params || {},
      headers: Object.fromEntries(req.headers.entries())
    };
  }

  createResponse(data: any, status: number): Response {
    return new Response(
      typeof data === 'string' ? data : JSON.stringify(data),
      {
        status,
        headers: {
          'Content-Type': typeof data === 'string' ? 'text/plain' : 'application/json'
        }
      }
    );
  }

  getParams(context: any): any {
    return context?.params || {};
  }

  /**
   * Create Next.js API route handler (App Router)
   */
  handler() {
    return async (req: NextRequest, context?: any) => {
      try {
        // Extract body for non-GET requests
        let body: any = {};
        if (req.method !== 'GET' && req.method !== 'HEAD') {
          try {
            body = await req.json();
          } catch (e) {
            try {
              const text = await req.text();
              if (text) body = JSON.parse(text);
            } catch (e2) {
              body = {};
            }
          }
        }

        const request = this.extractRequest(req, context);
        request.body = body;

        const response: MojoResponse = {
          json: (data: any, status = 200) => this.createResponse(data, status),
          text: (text: string, status = 200) => this.createResponse(text, status),
          status: (code: number) => ({ code })
        };

        return await this.mojo.handleRequest({
          request,
          response,
          params: this.getParams(context)
        });
      } catch (error) {
        console.error('Next.js adapter error:', error);
        return this.createResponse(
          { error: 'Internal server error' },
          500
        );
      }
    };
  }

  /**
   * Create Next.js Pages Router API handler
   */
  pagesHandler() {
    return async (req: any, res: any) => {
      try {
        const request: MojoRequest = {
          method: req.method,
          query: (key?: string) => key ? req.query[key] : req.query,
          body: req.body || {},
          params: req.query,
          headers: req.headers
        };

        const response: MojoResponse = {
          json: (data: any, status = 200) => {
            res.status(status).json(data);
            return { sent: true };
          },
          text: (text: string, status = 200) => {
            res.status(status).send(text);
            return { sent: true };
          },
          status: (code: number) => {
            res.status(code);
            return res;
          }
        };

        await this.mojo.handleRequest({
          request,
          response,
          params: req.query
        });
      } catch (error) {
        console.error('Next.js Pages adapter error:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    };
  }

  /**
   * Create route handlers for Next.js App Router
   * Usage: export const { GET, POST, PUT, DELETE } = adapter.routeHandlers()
   */
  routeHandlers() {
    const handler = this.handler();
    return {
      GET: handler,
      POST: handler,
      PUT: handler,
      DELETE: handler,
      PATCH: handler
    };
  }
}

export default NextJSAdapter;
