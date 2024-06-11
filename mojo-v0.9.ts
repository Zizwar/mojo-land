// Function to get user by access token
const getUserByAccessToken = async (accessToken: string, supabase: any) => {
  const { data, error } = await supabase
    .from("users")
    .select("id,uuid,username,is_active,roles(role(name))")
    .eq("token", accessToken)
    .single();
  if (error) throw new Error(error.message);
  if (!data) return {};
  return data;
};

// Utility function to check if value is an array
const isArray = (value: any) => Array.isArray(value) || value instanceof Array;

// Utility function to extract columns from a string or array
const extractColumns = (columns: any) => {
  return isArray(columns) ? columns : columns.split(",").map((column: string) => column.trim());
};

// Utility function to create JSON response
const jsonResponse = (
  data: any,
  status = 200,
  headers = { "Content-Type": "application/json" },
  options = {}
) => new Response(JSON.stringify(data), { status, headers, ...options });

// Utility function to create text response
const textResponse = (
  text: string,
  status = 200,
  headers = { 'Content-Type': 'text/plain' },
  options = {}
) => new Response(text, { status, headers, ...options });

// Function to log actions
const logAction = async (
  supabase: any,
  { status = "none", module = "mojo", action = "log", error: _error = {}, log = "" }
) => {
  if (_error) action = "error";
  try {
    const { error } = await supabase.from("logs").insert({ status, module, action, error: _error, log });
    if (error) throw new Error(JSON.stringify(error));
  } catch (error) {
    throw error;
  }
};

export default class Mojo {
  addons: any = {};
  _tableName: string = "mojos";
  _tokenName: string = "token";
  _paramName: string = "land";
  _supabase: any;
  _cookies: any;

  use(addon: any) {
    this.addons = { ...this.addons, ...addon };
  }

  tableName(name: string = "mojos") {
    this._tableName = name;
  }

  paramName(name: string = "land") {
    this._paramName = name;
  }

  tokenName(name: string = "token") {
    this._tokenName = name;
  }

  supabase(arg: any) {
    this._supabase = arg;
  }

  cookies(arg: any) {
    this._cookies = arg;
  }

  // Main render function
  async render(ctx: any, method: string) {
    const query = (q: string) => (q ? ctx.req.query(q) : ctx.req.query());
    let body: any = [];
    try {
      body = method === "get" ? [] : (await ctx.req.json()) || [];
    } catch (_error) {
      body = [];
    }

    // Get user by access token
    let user = {};
    const accessToken =
      query(this._tokenName || "token") ||
      body?.token ||
      this._cookies.getCookie(ctx, this._tokenName || "token");
    if (accessToken) {
      user = await getUserByAccessToken(accessToken, this._supabase);
    }

    // Function to check authorization
    const isAuthorized = () => {
      if (!dbData.method) return null;
      let permission = dbData.methods ? dbData.methods[method]?.permissions : dbData?.permissions?.[method];
      if (!permission) return null;
      if (permission.includes("public")) return true;
      const extractColumnsRoles = extractColumns(permission);
      return user.roles?.some((roleObj: { role: { name: string } }) => extractColumnsRoles.includes(roleObj?.role.name));
    };

    // Function to apply data filters to query builder
    const applyDataFilter = async (queryBuilder: any) => {
      const { id, uuid, limit, page = 0, order, ascending } = query();
      if (!queryBuilder)
        queryBuilder = this._supabase.from(dbData.table).select(dbData.selects || dbData.select || dbData.columns || "uuid");

      if (order) queryBuilder.order(order, { ascending: !!ascending });
      if (id || uuid) queryBuilder.eq("uuid", id || uuid);
      if (dbData.single) queryBuilder.single();
      if (limit) queryBuilder.limit(limit > 100 ? 100 : limit);
      if (page) queryBuilder.range((page - 1) * limit, page * ((limit || 10) - 1));

      const filters = dbData?.methods?.[method]?.filters || dbData?.filters;
      if (body?.filters && filters) {
        const validFilters: any = {};
        for (const key in filters) {
          const properties = filters[key]
            .map((prop: any) => body.filters[key]?.[prop] && [prop, body.filters[key][prop]])
            .filter(Boolean);
          validFilters[key] = properties;
        }
        for (const filter in validFilters) {
          if (["eq", "gt", "lt", "gte", "lte", "like", "ilike", "is", "in", "neq", "cs", "cd", "or", "ts"].includes(filter)) {
            for (const [key, value] of validFilters[filter]) {
              queryBuilder[filter](key, value);
            }
          }
        }
      }
      if (dbData.role && user.id) queryBuilder.eq(dbData.role, user.id);
      if (dbData.csv) queryBuilder.csv();

      const { data = [], error } = await queryBuilder;
      if (error) {
        await logAction(this._supabase, { status: dbData.method, error, log: "Error In mOjO Land" });
        return jsonResponse({ message: "Something went wrong!", error }, 500);
      }
      return jsonResponse(data);
    };

    try {
      let { data: dbData, error } = await this._supabase
        .from(this._tableName)
        .select("*")
        .eq("endpoint", ctx.req.param(this._paramName) || query("endpoint") || body?.endpoint)
        .eq("status", "active")
        .single();

      if (error) return jsonResponse({ message: "not endpoint here", error }, 402);

      method = (dbData.method && dbData.method.includes(",")) ? body?.method || query("method") || method : dbData.method?.trim();
      if (dbData?.log) await logAction(this._supabase, { action: "log", module: "mojo", status: method, log: JSON.stringify({ user, body, query }) });

      if (!isAuthorized()) return jsonResponse({ error: "not permission!" }, 403);

      // Handling different methods
      switch (method) {
        case "create":
          return this.createHandler(body, dbData, user);
        case "read":
        case "get":
          return await applyDataFilter(this._supabase.from(dbData.table).select(dbData.select || dbData.selects || "uuid"));
        case "post":
          return await applyDataFilter(this._supabase.from(dbData.table).select(dbData.select || dbData.selects || "uuid"));
        case "update":
          return this.updateHandler(body, dbData, user);
        case "delete":
          return await applyDataFilter(this._supabase.from(dbData.table).delete().select());
        case "data":
          return jsonResponse(dbData.data);
        case "text":
          return jsonResponse(dbData.text);
        case "view":
          return jsonResponse(dbData);
        case "sql":
          return await applyDataFilter(this._supabase.rpc(dbData.sql, body));
        case "rpc":
          return await applyDataFilter(this._supabase.rpc(dbData.rpc, body));
        default:
          return jsonResponse({ message: "crud not endpoint here!" }, 403);
      }
    } catch (error) {
      await logAction(this._supabase, { status: "request", error, log: "Error occurred while processing request:" });
      return jsonResponse({ message: "Something went wrong!" }, 500);
    }
  }

  // Handler for create method
  async createHandler(body: any, dbData: any, user: any) {
    const validBodyInsert = this.filterValidColumns(body?.insert ?? body?.create ?? body, dbData);
    if (!validBodyInsert) return textResponse("not data Insert inert in body.insert", 402);
    if (dbData.role && user.id) validBodyInsert[dbData.role] = user.id;

    const { data = [], error } = await this._supabase.from(dbData.table).insert(validBodyInsert).select(dbData.select || dbData.selects || "uuid");
    if (error) return jsonResponse({ error: "Something went wrong!" + error.message }, 500);

    return jsonResponse(data);
  }

  // 
// Handler for update method
  async updateHandler(body: any, dbData: any, user: any) {
    const validBodyUpdate = this.filterValidColumns(body?.update ?? body, dbData);
    if (!validBodyUpdate) return textResponse("no data to update, insert in body.update", 402);

    const queryBuilder = this._supabase
      .from(dbData.table)
      .update(validBodyUpdate)
      .select(dbData.select || dbData.selects || "uuid");

    return await this.applyDataFilter(queryBuilder);
  }

  // Function to filter valid columns
  filterValidColumns(bodyData: any, dbData: any) {
    if (dbData?.columns) {
      const { columns } = dbData;
      if (columns === "all" || columns === "*") return bodyData;
      const selectedNames = extractColumns(columns);
      return Object.fromEntries(
        Object.entries(bodyData).filter(([key]) => selectedNames.includes(key))
      );
    }
    return bodyData;
  }

  // Function to apply data filters to query builder
  async applyDataFilter(queryBuilder: any) {
    const { id, uuid, limit, page = 0, order, ascending } = this._ctx.req.query();
    if (order) queryBuilder.order(order, { ascending: !!ascending });
    if (id || uuid) queryBuilder.eq("uuid", id || uuid);
    if (this._dbData.single) queryBuilder.single();
    if (limit) queryBuilder.limit(limit > 100 ? 100 : limit);
    if (page) queryBuilder.range((page - 1) * limit, page * ((limit || 10) - 1));

    const filters = this._dbData?.methods?.[this._method]?.filters || this._dbData?.filters;
    if (this._body?.filters && filters) {
      const validFilters = this.getValidFilters(this._body.filters, filters);
      this.applyFiltersToQueryBuilder(queryBuilder, validFilters);
    }

    if (this._dbData.role && this._user.id) queryBuilder.eq(this._dbData.role, this._user.id);
    if (this._dbData.csv) queryBuilder.csv();

    const { data = [], error } = await queryBuilder;
    if (error) {
      await this.logAction({ status: this._dbData.method, error, log: "Error In mOjO Land" });
      return jsonResponse({ message: "Something went wrong!", error }, 500);
    }
    return jsonResponse(data);
  }

  // Function to get valid filters
  getValidFilters(bodyFilters: any, dbFilters: any) {
    const validFilters: any = {};
    for (const key in dbFilters) {
      const properties = dbFilters[key]
        .map((prop: any) => bodyFilters[key]?.[prop] && [prop, bodyFilters[key][prop]])
        .filter(Boolean);
      validFilters[key] = properties;
    }
    return validFilters;
  }

  // Function to apply filters to query builder
  applyFiltersToQueryBuilder(queryBuilder: any, validFilters: any) {
    const supportedFilters = ["eq", "gt", "lt", "gte", "lte", "like", "ilike", "is", "in", "neq", "cs", "cd", "or", "ts"];
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
                desc: true,
                ts_rank: true,
              });
              break;
            default:
              console.log(`Unsupported filter: ${filter}`);
              break;
          }
        }
      }
    }
  }
}