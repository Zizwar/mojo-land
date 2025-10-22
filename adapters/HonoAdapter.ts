import type { Context } from 'https://deno.land/x/hono@v4.0.9/mod.ts';
import type { FrameworkAdapter, MojoRequest, MojoResponse } from '../types/index.ts';
import { MojoCore } from '../core/MojoCore.ts';

/**
 * HonoAdapter - Adapter for Hono framework
 */
export class HonoAdapter implements FrameworkAdapter {
  private mojo: MojoCore;

  constructor(mojo: MojoCore) {
    this.mojo = mojo;
  }

  extractRequest(ctx: Context): MojoRequest {
    return {
      method: ctx.req.method,
      query: (key?: string) => key ? ctx.req.query(key) : ctx.req.query(),
      body: {},  // Will be populated by middleware
      params: ctx.req.param(),
      headers: Object.fromEntries(ctx.req.raw.headers.entries())
    };
  }

  createResponse(data: any, status: number): any {
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

  getParams(ctx: Context): any {
    return ctx.req.param();
  }

  /**
   * Create Hono handler
   */
  handler() {
    return async (ctx: Context) => {
      try {
        // Extract body for non-GET requests
        let body: any = {};
        if (ctx.req.method !== 'GET') {
          try {
            body = await ctx.req.json();
          } catch (e) {
            body = {};
          }
        }

        const request = this.extractRequest(ctx);
        request.body = body;

        const response: MojoResponse = {
          json: (data: any, status = 200) => this.createResponse(data, status),
          text: (text: string, status = 200) => this.createResponse(text, status),
          status: (code: number) => ({ code })
        };

        return await this.mojo.handleRequest({
          request,
          response,
          params: this.getParams(ctx)
        });
      } catch (error) {
        console.error('Hono adapter error:', error);
        return this.createResponse(
          { error: 'Internal server error' },
          500
        );
      }
    };
  }
}

export default HonoAdapter;
