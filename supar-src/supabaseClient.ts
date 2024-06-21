import { createClient } from "https://cdn.skypack.dev/@supabase/supabase-js?dts";

export const supabase = createClient(
  Deno.env.get("SUPABASE_API_URL")!,
  Deno.env.get("SUPABASE_ANON_KEY")!
);