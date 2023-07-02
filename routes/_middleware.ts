
import { MiddlewareHandlerContext } from "$fresh/server.ts";
import database from "../communication/database.ts";

export const handler =  (_req: Request, ctx: MiddlewareHandlerContext) => {

    if(ctx.state.db)return ctx.next();
    const db = new database();
  ctx.state.db = db;
  return ctx.next();
};