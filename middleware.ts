import { MiddlewareHandler } from "https://deno.land/x/hono@v4.0.9/mod.ts";

export const corsMiddleware: MiddlewareHandler = async (ctx, next) => {
  ctx.res.headers.set("Access-Control-Allow-Origin", "*");
  ctx.res.headers.set("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, OPTIONS");
  ctx.res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");

  // التعامل مع طلبات preflight (OPTIONS)
  if (ctx.req.method === "OPTIONS") {
    ctx.res.status = 204;
    ctx.res.headers.set("Access-Control-Allow-Headers", "Content-Type, Authorization");
    return; // إنهاء الطلب هنا ولا داعي لاستدعاء `next()`
  }

  await next(); // متابعة الطلبات الأخرى
};