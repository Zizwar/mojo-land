import { createClient } from "https://cdn.skypack.dev/@supabase/supabase-js?dts";

const supabase = createClient(
  Deno.env.get("SUPABASE_API_URL")!,
  Deno.env.get("SUPABASE_ANON_KEY")!
);

class Database {
  async getStoreById(id: number) {
    try {
      /**
       * ,
          products(*,
            products_categories(*),
            products_attributes(*),
            products_images(*),
            products_links(*),
            products_options(*),
            products_attributes(*)
            ),
          stores_category_associations(*),
          stores_images(*),
          stores_links(*),
          stores_hours(*)
       */
      const { data, error } = await supabase
        .from("stores")
        .select(
          `* ,
          products(*,
            products_categories(*),
            products_images(*),
            products_links(*),
            products_options(*),
            products_attributes(*)
            ),
          stores_category_associations(*),
          stores_images(*),
          stores_links(*),
          stores_hours(*)  `
        )
        .eq("id", id)
        .ilike("products.description", "%book%|game%|deno%");
      // .limit(13);
      // console.log({ data });

      // Retrieve other related data using additional queries or subqueries

      // Combine the results as needed

      if (error) {
        ///return error //{error:error.message}
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
  async searchStoreProduct(id: number, searchTerm: string) {
    try {
      const { data, error } = await supabase
        .from("stores")
        .select(
          `* ,
          products(*,
            products_categories(name),
            products_images(alt,src),
            products_links(url,description),
            products_options(key,value),
            products_attributes(key,value)
            ),
          stores_category_associations(*),
          stores_images(alt,src),
          stores_links(url,description),
          stores_hours(*)  `
        )
        .eq("id", id)
        .textSearch("products.description", searchTerm, {
          config: "english",
          //  type: "phrase",
          desc: true,
          ts_rank: true,
        });

      if (error) {
        ///return error //{error:error.message}
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
        .insert(cats, { upsert: true })
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
//get mask by slug
//get masks by slug
//vector search stores
//vector search products
//upsert store , remove store, crud, if userID
//crud product if userID
//OUT PUT IN PUT SAVE IN CONVERSATION
export default Database;
