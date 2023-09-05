import { createClient } from "https://cdn.skypack.dev/@supabase/supabase-js?dts";
import { getCookies } from "$std/http/cookie.ts";

const supabase = createClient(
  Deno.env.get("SUPABASE_API_URL2")!,
  Deno.env.get("SUPABASE_ANON_KEY2")!
);

export const getTableMojoBy = async ({
  uuid,
  endpoint,
}: {
  uuid: string;
  endpoint: string;
}) => {
  const query = supabase.from("mojos").select("*");
  if (uuid) query.eq("uuid", uuid);
  if (endpoint) query.eq("endpoint", endpoint);
  const { data, error } = await query.single();
  if (error) return [];
  return data;
};
