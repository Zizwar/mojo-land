import { createClient } from "https://cdn.skypack.dev/@supabase/supabase-js?dts";

const supabase = createClient(
  Deno.env.get("SUPABASE_API_URL2")!,
  Deno.env.get("SUPABASE_ANON_KEY2")!
);

class Database {
  async getPromptBySlug(slug: string) {
    try {
      const { data, error } = await supabase
        .from("prompts")
        .select("role, content")
        .eq("slug", slug);

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
  async searchStoreProduct({
    id,
    slug,
    term,
  }: {
    id: number;
    slug: string;
    term: string;
  }): Promise<any> {
    try {
      const query = supabase.from("stores").select(
        `* ,
          masks(prompts(content,role)),
          products(*,
            categories:products_categories(name),
            images:products_images(alt,src),
            links:products_links(url,description),
            options:products_options(key,value),
            attributes:products_attributes(key,value)
            ),
          categories:stores_category_associations(categorie:stores_categories(name)),
          images:stores_images(alt,src),
          links:stores_links(url,description),
          hours:stores_hours(*)  `
      );
      //;
      if (id) query.eq("id", id);
      if (slug) query.eq("slug", slug);

      const { data, error } = await query.textSearch(
        "products.description,products.name",
        term,
        {
          config: "english",
          //  type: "phrase",
          desc: true,
          ts_rank: true,
        }
      );

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
