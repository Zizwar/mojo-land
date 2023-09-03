import { MiddlewareHandlerContext } from "$fresh/server.ts";

import LocalFiler from "../outils/filterLocal.ts";

import Gpt from "../communication/gpt.ts";
export const handler = (_req: Request, ctx: MiddlewareHandlerContext) => {
  const gpt = new Gpt();
  const filterLocal = new LocalFiler();

  ctx.state.filter = filterLocal;

  ctx.state.gpt = gpt;
  return ctx.next();
};
