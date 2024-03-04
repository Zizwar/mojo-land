import { createClient } from "https://cdn.skypack.dev/@supabase/supabase-js?dts";
import { getCookies } from "$std/http/cookie.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_API_URL")!,
  Deno.env.get("SUPABASE_ANON_KEY")!
);

export const getTableMojoBy = async ({
  uuid,
  endpoint,
single,
}) => {
  const query = supabase.from("mojos").select("*");
  if (uuid) query.eq("uuid", uuid);
  if (endpoint) query.eq("endpoint", endpoint);
if(single) query.single();
  const { data, error } = await query;
  if (error) throw error;
  return data;
};
