import { supabase } from "./supabaseClient.ts";
import { getUserByAccessToken } from "./authUtils.ts";
import { logError } from "./loggerUtils.ts";
import { isAuthorized } from "./permissionUtils.ts";
import {
  handleCreate,
  handleRead,
  handleUpdate,
  handleDelete,
  handleOtherMethods,
} from "./requestHandlers.ts";
import { AddonsManager } from "./addonsManager.ts";
import * as Cookies  from "https://deno.land/x/hono/helper.ts";

export default class Mojo {
  private addonsManager = new AddonsManager();

  async render(ctx, method) {
    const query = (q: string | null) => (q ? ctx.req.query(q) : ctx.req.query());
    let body = [];

    try {
      body = method === "get" ? [] : (await ctx.req.json()) || [];
    } catch (_error) {
      body = [];
    }

    let user = {};
    const accessToken =
      query("token") || body?.token || Cookies.getCookie(ctx, "mojo_token");

    if (accessToken) {
      user = await getUserByAccessToken(accessToken);
      console.log("middle_user=", { user, accessToken });
    }

    const json = (
      data: any,
      status = 200,
      headers = { "Content-Type": "application/json" },
      options = {}
    ) => {
      return new Response(JSON.stringify(data), {
        status,
        headers,
        ...options,
      });
    };

    const text = (text: string, status = 200) => {
      return new Response(text, {
        status,
      });
    };

    try {
      let { data: dbData, error } = await supabase
        .from("mojos")
        .select("*")
        .eq(
          "endpoint",
          ctx.req.param("land") || query("endpoint") || body?.endpoint || "intial"
        )
        .eq("status", "active")
        .single();

      if (error) return json({ message: "not endpont here", error }, 402);

      method = dbData.method ?? body?.method ?? method;

      if (dbData?.log)
        await logError({
          action: "log",
          module: "mojo",
          status: method,
          log: JSON.stringify({ user, body, query }),
          error: null,
        });

      if (!isAuthorized(dbData, user)) return json({ error: "not permession!" }, 403);

      switch (dbData.method) {
        case "create":
          return await handleCreate(dbData, body, user);
        case "read":
          return await handleRead(dbData, query);
        case "update":
          return await handleUpdate(dbData, body, query, user);
        case "delete":
          return await handleDelete(dbData, query);
        default:
          return await handleOtherMethods(dbData, body, query, json);
      }
    } catch (error) {
      console.error("Error occurred while processing request: ", error);
      await logError({
        status: "request",
        error,
        log: "Error occurred while processing request:",
      });
      return json({ message: "Something went wrong!" }, 500);
    }
  }

  use(addon: any) {
    this.addonsManager.use(addon);
  }

  getAddons() {
    return this.addonsManager.getAddons();
  }
}