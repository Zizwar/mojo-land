import type { Request, Response } from 'express';
import type { FrameworkAdapter, MojoRequest, MojoResponse } from '../types/index.ts';
import { MojoCore } from '../core/MojoCore.ts';

/**
 * ExpressAdapter - Adapter for Express.js framework
 */
export class ExpressAdapter implements FrameworkAdapter {
  private mojo: MojoCore;

  constructor(mojo: MojoCore) {
    this.mojo = mojo;
  }

  extractRequest(req: Request): MojoRequest {
    return {
      method: req.method,
      query: (key?: string) => key ? req.query[key] : req.query,
      body: req.body || {},
      params: req.params,
      headers: req.headers
    };
  }

  createResponse(data: any, status: number): any {
    return { data, status };
  }

  getParams(req: Request): any {
    return req.params;
  }

  /**
   * Create Express middleware handler
   */
  handler() {
    return async (req: Request, res: Response) => {
      try {
        const request = this.extractRequest(req);

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
          params: this.getParams(req)
        });
      } catch (error) {
        console.error('Express adapter error:', error);
        res.status(500).json({ error: 'Internal server error' });
      }
    };
  }

  /**
   * Create route handlers for all HTTP methods
   */
  routes(basePath: string = '/api/:land') {
    return {
      get: { path: basePath, handler: this.handler() },
      post: { path: basePath, handler: this.handler() },
      put: { path: basePath, handler: this.handler() },
      delete: { path: basePath, handler: this.handler() },
      patch: { path: basePath, handler: this.handler() }
    };
  }

  /**
   * Setup all routes on Express app
   */
  setupRoutes(app: any, basePath: string = '/api/:land') {
    const handler = this.handler();
    app.get(basePath, handler);
    app.post(basePath, handler);
    app.put(basePath, handler);
    app.delete(basePath, handler);
    app.patch(basePath, handler);
    return app;
  }
}

export default ExpressAdapter;
