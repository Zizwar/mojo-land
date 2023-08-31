export default class Mojo {
  async render(req, ctx, method) {
    const { gpt, db, filter } = ctx.state;

    const url = new URL(req.url);
    const query = (q) => url.searchParams.get(q);
    let body = [];
    try {
      body = method === "get" ? [] : (await req.json()) || [];
    } catch (error) {
      body = [];
    }

    const extractColumns = (columns) =>
      columns.split(",").map((column: string) => column.trim()) || [];
    const json = (data: any, status = 200) => {
      return new Response(JSON.stringify(data), {
        status,
        headers: { "Content-Type": "application/json" },
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
        const { error } = await db.supabase
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
      let { data: dbEndpointData, error } = await db.supabase
        .from("mojos")
        .select("*")
        .eq(
          "endpoint",
          ctx.params.land || query("endpoint") || body?.endpoint || "intial"
        )
        .eq("status", "active")
        .single();
      if (error) throw error;
      console.log({dbEndpointData})
      if (!dbEndpointData.length)
        return json({ message: "not endpont here" }, 402);
      method = dbEndpointData.method ?? body?.method ?? method;
      if (dbEndpointData?.log)
        await log({
          module: "tracker",
          status: method,
          log: JSON.stringify({ user: ctx.params.user, body, query }),
        });
      const filterValidColumns = (bodyData: any) => {
        if (dbEndpointData?.columns) {
          const { columns } = dbEndpointData;
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
      const isAuthorized = () => {
        if (!dbEndpointData.method) return null;
        const permission = dbEndpointData?.permissions
          ? dbEndpointData.permissions[dbEndpointData.method]
          : null;
        if (!permission) return null;
        const extractColumnsRoles = extractColumns(permission);
        const found = ctx.state?.user?.roles.some(
          (roleObj: { role: { name: string } }) =>
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
          queryBuilder = await db.supabase
            .from(dbEndpointData.table)
            .select(dbEndpointData.select ?? dbEndpointData.columns ?? "uuid");

        if (id) queryBuilder.eq("uuid", id || uuid);
        else if (uuid) queryBuilder.eq("uuid", uuid);
        if (dbEndpointData.single) queryBuilder.single();
        if (limit) queryBuilder.limit(limit);
        if (page && dbEndpointData?.pagination)
          queryBuilder.range(page - 1, page + limit || 10);

        if (body?.filters && dbEndpointData?.filters) {
          const validFilters: any = {};
          for (const key in dbEndpointData?.filters) {
            if (
              Object.prototype.hasOwnProperty.call(dbEndpointData?.filters, key)
            ) {
              const properties = dbEndpointData?.filters[key]
                .map((prop) => {
                  if (
                    body.filters[key] &&
                    body.filters[key][prop] !== undefined
                  ) {
                    return [prop, body.filters[key][prop]];
                  } else return null;
                })
                .filter(Boolean);
              validFilters[key] = properties;
            }
          }
          const supportedFilters = [
            "eq",
            "gt",
            "lt",
            "gte",
            "lte",
            "or",
            "like",
            "ilike",
            "is",
            "in",
            "neq",
            "cs",
            "cd",
            "ts",
          ];
          //
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
            } else {
              console.log(`Unsupported filter: ${filter}`);
            }
          }
        }
        if (dbEndpointData.role && ctx.state.user?.id)
          queryBuilder.eq(dbEndpointData.role, ctx.state.user.id);

        const { data = [], error } = await queryBuilder;

        if (error) {
          await log({
            status: dbEndpointData.method,
            error,
            log: "Error In mOjO Land",
          });
          return json({ message: "Something went wrong!", error }, 500);
        }
        return json(data);
      };
      if (!isAuthorized()) return json({ error: "not permession!" }, 403);
      if (dbEndpointData.method === "function") {
        const dynamicFunctionCode = dbEndpointData?.function;
        const content = "";

        const executeDynamicFunction = new Function(
          "mojo",
          `
       const {gpt,filter,body,db,endpoint} = mojo;
       let {content}=mojo
        return (async () => {
          //
          ${dynamicFunctionCode}
      //
      })();
    `
        );

        try {
          return await executeDynamicFunction({
            gpt,
            body,
            filter,
            json,
            text,
            query,
            content,
            db,
            log,
            endpoint: ctx.params.land,
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
      if (dbEndpointData.method === "create") {
        const valideBodyInsert = filterValidColumns(body?.insert || body);
        if (!valideBodyInsert)
          return text("not data Insert inert in body.insert", 402);
        if (dbEndpointData.role && ctx.params.user?.id)
          valideBodyInsert[dbEndpointData.role] = ctx.params.user?.id;
        let { data = [], error } = await db.supabase
          .from(dbEndpointData.table)
          .insert(valideBodyInsert)
          .select(dbEndpointData.select || "uuid");

        if (error)
          return json({ error: "Something went wrong!" + error.message }, 500);
        return json(data);
      }
      if (dbEndpointData.method === "rpc") {
        const queryBuilder = db.supabase.rpc(dbEndpointData.rpc, body);
        return await applyDataFilter(queryBuilder);
      }
      //get
      if (dbEndpointData.method === "read") {
        return await applyDataFilter(null);
      }
      //post
      if (dbEndpointData.method === "post") {
        const queryBuilder = db.supabase
          .from(dbEndpointData.table)
          .select(dbEndpointData.select || dbEndpointData.columns || "uuid");
        return await applyDataFilter(queryBuilder);
      }
      //update
      if (dbEndpointData.method === "update") {
        const valideBodyUpdate = filterValidColumns(body?.update || body);
        if (!valideBodyUpdate)
          return text("not data update inert in body.insert", 402);

        const queryBuilder = db.supabase
          .from(dbEndpointData.table)
          .update(valideBodyUpdate)
          .select(dbEndpointData.select || dbEndpointData.columns || "uuid");
        return await applyDataFilter(queryBuilder);
      }
      //update
      if (dbEndpointData.method === "delete") {
        const queryBuilder = db.supabase
          .from(dbEndpointData.table)
          .delete()
          .select();
        return await applyDataFilter(queryBuilder);
      }
      if (dbEndpointData.method === "data") {
        return json(dbEndpointData.data);
      }
      if (dbEndpointData.method === "text") {
        return json(dbEndpointData.text);
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
