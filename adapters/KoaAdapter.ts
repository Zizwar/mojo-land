import type { Context as KoaContext } from 'koa';
import type { FrameworkAdapter, MojoRequest, MojoResponse } from '../types/index.ts';
import { MojoCore } from '../core/MojoCore.ts';

/**
 * KoaAdapter - Adapter for Koa framework
 */
export class KoaAdapter implements FrameworkAdapter {
  private mojo: MojoCore;

  constructor(mojo: MojoCore) {
    this.mojo = mojo;
  }

  extractRequest(ctx: KoaContext): MojoRequest {
    return {
      method: ctx.method,
      query: (key?: string) => key ? ctx.query[key] : ctx.query,
      body: (ctx.request as any).body || {},
      params: ctx.params,
      headers: ctx.headers
    };
  }

  createResponse(data: any, status: number): any {
    return { data, status };
  }

  getParams(ctx: KoaContext): any {
    return ctx.params;
  }

  /**
   * Create Koa middleware handler
   */
  handler() {
    return async (ctx: KoaContext) => {
      try {
        const request = this.extractRequest(ctx);

        const response: MojoResponse = {
          json: (data: any, status = 200) => {
            ctx.status = status;
            ctx.body = data;
            return { sent: true };
          },
          text: (text: string, status = 200) => {
            ctx.status = status;
            ctx.body = text;
            return { sent: true };
          },
          status: (code: number) => {
            ctx.status = code;
            return ctx;
          }
        };

        await this.mojo.handleRequest({
          request,
          response,
          params: this.getParams(ctx)
        });
      } catch (error) {
        console.error('Koa adapter error:', error);
        ctx.status = 500;
        ctx.body = { error: 'Internal server error' };
      }
    };
  }

  /**
   * Create router middleware for Koa Router
   */
  routes(basePath: string = '/api/:land') {
    return {
      path: basePath,
      handler: this.handler(),
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH']
    };
  }

  /**
   * Setup routes on Koa Router
   */
  setupRouter(router: any, basePath: string = '/api/:land') {
    const handler = this.handler();
    router.get(basePath, handler);
    router.post(basePath, handler);
    router.put(basePath, handler);
    router.delete(basePath, handler);
    router.patch(basePath, handler);
    return router;
  }
}

export default KoaAdapter;
