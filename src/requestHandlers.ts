import { supabase } from "./supabaseClient.ts";
import { logError } from "./loggerUtils.ts";

export const handleCreate = async (dbData: any, body: any, user: any) => {
  const valideBodyInsert = filterValidColumns(body?.insert ?? body, dbData);
  if (!valideBodyInsert)
    return new Response("not data Insert inert in body.insert", { status: 402 });

  if (dbData.role && user.id) valideBodyInsert[dbData.role] = user.id;

  const { data, error } = await supabase
    .from(dbData.table)
    .insert(valideBodyInsert)
    .select(dbData.select || "uuid");

  if (error)
    return new Response(
      JSON.stringify({ error: "Something went wrong!" + error.message }),
      { status: 500 }
    );

  return new Response(JSON.stringify(data), { status: 200 });
};

export const handleRead = async (dbData: any, query: any) => {
  const queryBuilder = supabase
    .from(dbData.table)
    .select(dbData.select || dbData.columns || "uuid");

  return await applyDataFilter(queryBuilder, dbData, query);
};

export const handleUpdate = async (dbData: any, body: any, query: any, user: any) => {
  const valideBodyUpdate = filterValidColumns(body?.update ?? body, dbData);
  if (!valideBodyUpdate)
    return new Response("not data update inert in body.insert", { status: 402 });

  const queryBuilder = supabase
    .from(dbData.table)
    .update(valideBodyUpdate)
    .select(dbData.select || dbData.columns || "uuid");

  return await applyDataFilter(queryBuilder, dbData, query);
};

export const handleDelete = async (dbData: any, query: any) => {
  const queryBuilder = supabase.from(dbData.table).delete().select();
  return await applyDataFilter(queryBuilder, dbData, query);
};

export const handleOtherMethods = async (
  dbData: any,
  body: any,
  query: any,
  json: (data: any, status?: number, headers?: any, options?: any) => Response
) => {
  if (dbData.method === "function") {
    const dynamicFunctionCode = dbData?.function;
    const content = "";

    const executeDynamicFunction = new Function(
      "mojo",
      `return (async () => {${dynamicFunctionCode}})();`
    );

    try {
      return await executeDynamicFunction({
        body,
        json,
        query,
        content,
        supabase,
        logError,
        endpointData: dbData,
      });
    } catch (error) {
      console.error("Error In FunctionDynamique Mojo.Land: ", error);
      await logError({
        status: "function",
        error,
        log: "Error In FunctionDynamique Mojo.Land",
      });
      return json({ error: "Something went wrong!" }, 500);
    }
  }

  if (dbData.method === "data") {
    return json(dbData.data, 200);
  }

  if (dbData.method === "text") {
    return json(dbData.text, 200);
  }

  if (dbData.method === "view") {
    return json(dbData, 200);
  }

  if (dbData.method === "sql") {
    const queryBuilder = supabase.rpc(dbData.sql, body);
    return await applyDataFilter(queryBuilder, dbData, query);
  }

  if (dbData.method === "rpc") {
    const queryBuilder = supabase.rpc(dbData.rpc, body);
    return await applyDataFilter(queryBuilder, dbData, query);
  }

  return json({ message: "crud not endpoint here!" }, 403);
};

const filterValidColumns = (bodyData: any, dbData: any) => {
  if (dbData?.columns) {
    const { columns } = dbData;
    if (columns === "all" || columns === "*") return bodyData;
    else {
      const selectedNames = columns.split(",").map((column: string) => column.trim());
      const validBody = Object.fromEntries(
        Object.entries(bodyData).filter(([key]) => selectedNames.includes(key))
      );
      return validBody;
    }
  }
  return bodyData;
};

const applyDataFilter = async (
  queryBuilder: any,
  dbData: any,
  query: any
) => {
  const id = query("id");
  const uuid = query("uuid");
  const limit = query("limit");
  const page = query("page");

  if (id) queryBuilder.eq("uuid", id || uuid);
  else if (uuid) queryBuilder.eq("uuid", uuid);
  if (dbData.single) queryBuilder.single();
  if (limit) queryBuilder.limit(limit);
  if (page && dbData?.pagination)
    queryBuilder.range(page - 1, page + (limit || 10));

  if (dbData.role && query("user_id")) queryBuilder.eq(dbData.role, query("user_id"));
  if (dbData.csv) queryBuilder.csv();

  const { data, error } = await queryBuilder;

  if (error) {
    await logError({
      status: dbData.method,
      error,
      log: "Error In Mojo Land",
    });
    return new Response(
      JSON.stringify({ message: "Something went wrong!", error }),
      { status: 500 }
    );
  }

  return new Response(JSON.stringify(data), { status: 200 });
};