import { createClient } from "https://cdn.skypack.dev/@supabase/supabase-js?dts";
import * as cookies from "https://deno.land/x/hono/helper.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_API_URL")!,
  Deno.env.get("SUPABASE_ANON_KEY")!
);

const getUserByAccessToken = async (accessToken: string) => {
  const { data, error } = await supabase
    .from("users")
    .select("id,uuid,username,is_active,roles(role(name))")
    .eq("token", accessToken)
    .single();
  if (error) {
    throw new Error(error.message);
  }
  if (data.length === 0) {
    return {};
  }
  return data;
};

export default class Mojo {
  addons: [] | undefined;
  _tableName: string = "mojos";
  _tokenName: string = "token";
  _paramName: string = "land";

  use(addon: any) {
    this.addons = { ...this.addons, ...addon };
  }
  tableName(name: string = "mojos") {
    this._tableName = name;
  }
  paramName(name: string = "mojos") {
    this._paramName = name;
  }
  tokenName(name: string = "mojos") {
    this._tokenName = name;
  }

  async render(ctx, method) {
    const query = (q) => (q ? ctx.req.query(q) : ctx.req.query());
    let body:any = [];
    try {
      body = method === "get" ? [] : (await ctx.req.json()) || [];
    } catch (_error) {
      body = [];
    }
    //console.log({ body });

    //check user
    let user = {};
    const accessToken =
      query(this._tokenName || "token") ||
      body?.token ||
      cookies.getCookie(ctx, this._tokenName || "token");
    if (accessToken) {
      user = await getUserByAccessToken(accessToken);
      // console.log("middle_user=", { user, accessToken });
    }

    const isArray = (value:any) => {
      return Array.isArray(value) || value instanceof Array;
    };
    
    const extractColumns = (columns:any) => {
      if (isArray(columns)) {
        return columns;
      } else {
        return columns.split(",").map((column: string) => column.trim()) || []; 
      }
    };
    
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
    //
    const text = (text: string, status = 200) => {
      return new Response(text, {
        status,
      });
    };

    //set logger
    const log = async ({
      status = "none",
      module = "mojo",
      action = "log",
      error: _error = {},
      log = "",
    }) => {
      if (_error) action = "error";
      try {
        const { error } = await supabase
          .from("logs")
          .insert({ status, module, action, error: _error, log });

        if (error) {
          throw JSON.stringify(error);
        }
      } catch (error) {
        throw error;
      }
    };
    try {
      console.log({ "this.tableName": this._tableName });

      let { data: dbData, error } = await supabase
        .from(this._tableName || "mojos")
        .select("*")
        .eq(
          "endpoint",
          ctx.req.param(this._paramName || "land") ||
            query("endpoint") ||
            body?.endpoint
        )
        .eq("status", "active")
        .single();
      if (error) return json({ message: "not endpont here", error }, 402);

//   method = dbData.method ?? body?.method ?? method;
      if (dbData?.log)
        await log({
          action: "log",
          module: "mojo",
          status: method,
          log: JSON.stringify({ user: user, body, query }),
        });
      const filterValidColumns = (bodyData: any) => {
        if (dbData?.columns) {
          const { columns } = dbData;
          if (columns === "all" || columns === "*") return bodyData;
          else {
            const selectedNames = extractColumns(columns);
            const validBody = Object.fromEntries(
              Object.entries(bodyData).filter(([key]) =>
                selectedNames.includes(key)
              )
            );
            return validBody;
          }
        }
      };
      const _method = body?.method || query("method") || method
      const isAuthorized = () => {
    

        if (!dbData.method) return null;
        /*** supôrt new methosds*/
        let permission = null;
        if (dbData.methods) permission = dbData?.methods[_method]?.permissions;
        else
          permission = dbData?.permissions
            ? dbData.permissions[dbData.method]
            : null;

        if (!permission) return null;
        if (permission.includes("public")) return true;
        const extractColumnsRoles = extractColumns(permission);
        const found = user.roles?.some((roleObj: { role: { name: string } }) =>
          extractColumnsRoles.includes(roleObj?.role.name)
        );
        return found;
      };
      const applyDataFilter = async (queryBuilder: any) => {
        const id = query("id");
        const uuid = query("uuid");
        const limit = query("limit");
        const page = query("page");

        if (!queryBuilder)
          queryBuilder = supabase
            .from(dbData.table)
            .select(
              dbData.selects || dbData.select || dbData.columns || "uuid"
            );

        if (id) queryBuilder.eq("uuid", id || uuid);
        else if (uuid) queryBuilder.eq("uuid", uuid);
        if (dbData.single) queryBuilder.single();
        if (limit) queryBuilder.limit(limit);
        if (page && dbData?.pagination)
          queryBuilder.range(page - 1, page + limit || 10);
const filters = dbData?.methods && dbData?.methods[_method]?.filters || dbData?.filters;

        if (body?.filters && filters) {
          const validFilters: any = {};
          for (const key in filters) {
            console.log({body:body.filters})
            if (Object.prototype.hasOwnProperty.call(filters, key)) {
            //  console.log("hasOn",{key},"filters[key]",filters[key])
              const properties = filters[key]
                .map((prop) => {
           //       console.log({prop})
                  if (
                    body.filters[key]  && body.filters[key][prop]
                  ) {
                 //   console.log("dddddddd",prop, body.filters[key][prop])
                    return [prop, body.filters[key][prop]];
                  } else return null;
                })
                .filter(Boolean);
              validFilters[key] = properties;
          //   console.log({properties})
            }
          }
          const supportedFilters = [
            "eq",
            "gt",
            "lt",
            "gte",
            "lte",
            "like",
            "ilike",
            "is",
            "in",
            "neq",
            "cs",
            "cd",
            "or",
            "ts",
          ];
          //
          console.log({   validFilters          })
          for (const filter in validFilters) {
            if (supportedFilters.includes(filter)) {
              for (const [key, value] of validFilters[filter]) {
                switch (filter) {
                  case "eq":
                    queryBuilder.eq(key, value);
                    break;
                  case "gt":
                    queryBuilder.gt(key, value);
                    break;
                  case "lt":
                    queryBuilder.lt(key, value);
                    break;
                  case "gte":
                    queryBuilder.gte(key, value);
                    break;
                  case "lte":
                    queryBuilder.lte(key, value);
                    break;
                  case "like":
                    queryBuilder.like(key, value);
                    break;
                  case "ilike":
                    queryBuilder.ilike(key, value);
                    break;
                  case "is":
                    queryBuilder.is(key, value);
                    break;
                  case "in":
                    queryBuilder.in(key, value);
                    break;
                  case "neq":
                    queryBuilder.neq(key, value);
                    break;
                  case "cs":
                    queryBuilder.cs(key, value);
                    break;
                  case "cd":
                    queryBuilder.cd(key, value);
                    break;
                  case "or":
                    queryBuilder.or(value);
                    break;
                  case "ts":
                    queryBuilder.textSearch(key, value, {
                      config: "english",
                      //  type: "phrase",
                      desc: true,
                      ts_rank: true,
                    });
                    break;
                  /*  default:
                    console.log(`Unsupported filter: ${filter}`);
                    break;
                    */
                }
              }
            }
            /*
            else {
              console.log(`Unsupported filter: ${filter}`);
            }
            */
          }
        }
       // if (dbData.role && user.id) queryBuilder.eq(dbData.role, user.id);
        if (dbData.csv) queryBuilder.csv();
        const { data = [], error } = await queryBuilder;

        if (error) {
          await log({
            status: dbData.method,
            error,
            log: "Error In mOjO Land",
          });
          return json({ message: "Something went wrong!", error }, 500);
        }
        return json(data);
      };
      if (!isAuthorized()) return json({ error: "not permession!" }, 403);

      if (dbData.method === "function") {
        const dynamicFunctionCode = dbData?.function;
        const content = "";

        const executeDynamicFunction = new Function(
          "mojo",
          `return (async () => {${dynamicFunctionCode}})();`
        );

        try {
          return await executeDynamicFunction({
            user_id: user.id,
            body,
            json,
            text,

            query,
            content,
            supabase,
            cookies,
            log,
            endpointData: dbData,
            ...this.addons,
          });
        } catch (error) {
          console.error("Error In FunctionDynamique Mojo.Land: ", error);
          await log({
            status: "function",
            error,
            log: "Error In FunctionDynamique Mojo.Land",
          });
          return json({ error: "Something went wrong!" }, 500);
        }
      }
      //add
      if (dbData.method === "create") {
        const valideBodyInsert = filterValidColumns(body?.insert ?? body);
        if (!valideBodyInsert)
          return text("not data Insert inert in body.insert", 402);
        if (dbData.role && user.id) valideBodyInsert[dbData.role] = user.id;
        let { data = [], error } = await supabase
          .from(dbData.table)
          .insert(valideBodyInsert)
          .select(dbData.select || "uuid");

        if (error)
          return json({ error: "Something went wrong!" + error.message }, 500);
        return json(data);
      }

      //get
      if (dbData.method === "read") {
        const queryBuilder = supabase
          .from(dbData.table)
          .select(dbData.select || dbData.columns || "uuid");
        return await applyDataFilter(queryBuilder);
      }
      //post
      if (dbData.method === "post") {
        const queryBuilder = supabase
          .from(dbData.table)
          .select(dbData.select || dbData.columns || "uuid");
        return await applyDataFilter(queryBuilder);
      }
      //update
      if (dbData.method === "update") {
        const valideBodyUpdate = filterValidColumns(body?.update ?? body);
        if (!valideBodyUpdate)
          return text("not data update inert in body.insert", 402);

        const queryBuilder = supabase
          .from(dbData.table)
          .update(valideBodyUpdate)
          .select(dbData.select || dbData.columns || "uuid");
        return await applyDataFilter(queryBuilder);
      }
      //update
      if (dbData.method === "delete") {
        const queryBuilder = supabase.from(dbData.table).delete().select();
        return await applyDataFilter(queryBuilder);
      }
      if (dbData.method === "data") {
        return json(dbData.data);
      }
      if (dbData.method === "text") {
        return json(dbData.text);
      }
      if (dbData.method === "view") {
        return json(dbData);
      }
      if (dbData.method === "sql") {
        const queryBuilder = supabase.rpc(dbData.sql, body);
        return await applyDataFilter(queryBuilder);
      }
      if (dbData.method === "rpc") {
        const queryBuilder = supabase.rpc(dbData.rpc, body);
        return await applyDataFilter(queryBuilder);
      }
    } catch (error) {
      console.error("Error occurred while processing request: ", error);
      await log({
        status: "request",
        error,
        log: "Error occurred while processing request:",
      });
      return json({ message: "Something went wrong!" }, 500);
    }
    return json({ message: "crud not endpoint here!" }, 403);
  }
}
