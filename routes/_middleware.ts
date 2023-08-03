import { MiddlewareHandlerContext } from "$fresh/server.ts";

import { getCookies } from "$std/http/cookie.ts";

import database from "../communication/database.ts";
import LocalFiler from "../outils/filterLocal.ts";

import Gpt from "../communication/gpt.ts";
export const handler = async (req: Request, ctx: MiddlewareHandlerContext) => {
  const db = new database();

  const url = new URL(req.url);
  const paramToken = url.searchParams.get("mojo_token");
//  const body = await req.json();
  const accessToken = getCookies(req.headers)["mojo_token"] || paramToken// || body?.mojo_token;
  if (accessToken) {
    const user = await db.getUserByAccessToken(accessToken);
    if (user) ctx.state.user = user;
    console.log("middle_user=", { user, accessToken });
  }
  if (ctx.state.db) return ctx.next();

  const gpt = new Gpt();
  const filterLocal = new LocalFiler();

  ctx.state.filter = filterLocal;
  ctx.state.db = db;
  ctx.state.gpt = gpt;
  return ctx.next();
};
