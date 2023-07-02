import { createClient } from "https://cdn.skypack.dev/@supabase/supabase-js?dts";

const supabase = createClient(
  Deno.env.get("SUPABASE_API_URL")!,
  Deno.env.get("SUPABASE_ANON_KEY")!
); 

class Database {
  async getStores() {
    try {
      const { data, error } = await supabase
        .from("stores")
        .select("*")
        .limit(13);

      if (error) {
        throw error;
      }

      return data;

    } catch (error) {
      console.error("An error occurred while fetching the data:", error.message);
      throw error;
    }
  }

  async getStore(id: number) {
    try {
      const { data, error } = await supabase
        .from("stores")
        .select("*")
        .eq("id", id)
        .limit(1);

      if (error) {
        throw error;
      }

      return data[0] || null;

    } catch (error) {
      console.error("An error occurred while fetching the store:", error.message);
      throw error;
    }
  }
}

export default Database;
