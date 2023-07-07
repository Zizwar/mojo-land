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
        .select(
          "store_name,store_slug,store_is_active,store_logo_url,prompt(prompt),prompt_user(prompt)"
        )
        .limit(13);

      if (error) {
        throw error;
      }

      return data;
    } catch (error) {
      console.error(
        "An error occurred while fetching the data:",
        error.message
      );
      throw error;
    }
  }
  async getStoresMask() {
    try {
      const { data, error } = await supabase
        .from("products")
        .select(
          `
        products_attributes(*),
products_variations(*),
products_categories(*),
products_images(*),
products_links(*)
     
        `
        )
        .eq("id", 3);

      if (error) {
        throw JSON.stringify(error);
      }

      return data;
    } catch (error) {
      console.error(
        "An error occurred while fetching the data:",
        error.message
      );
      throw error;
    }
  } 
  async insertCats(cats: any) {
    try {
      const { data, error } = await supabase
        .from("products")
        .insert(cats,{ upsert: true } )
        .eq("id", 3);

      if (error) {
        throw JSON.stringify(error);
      }
      console.log("Product added successfully!");
      return data;
    } catch (error) {
      console.error(
        "An error occurred while fetching the data:",
        error.message
      );
      throw error;
    }
  }
  async getStoreBySlug(slug: string) {
    try {
      //

      //
      const { data, error } = await supabase
        .from("stores")
        .select(
          "store_name,store_slug,store_is_active,store_logo_url,prompt(prompt),prompt_user(prompt)"
        )
        .eq("store_slug", slug)
        .limit(1);

      if (error) {
        throw error;
      }

      return data[0] || [];
    } catch (error) {
      console.error(
        "An error occurred while fetching the store:",
        error.message
      );
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
      console.error(
        "An error occurred while fetching the store:",
        error.message
      );
      throw error;
    }
  }
}

export default Database;