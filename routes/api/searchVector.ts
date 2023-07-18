//import database from "../../communication/database.ts"

import { Handlers } from "$fresh/server.ts";
export const handler: Handlers = {
  
  async GET(req, ctx) {
      const { db } = ctx.state;
    const url = new URL(req.url);
    const id = url.searchParams.get("id") //|| 4;  
    const term = url.searchParams.get("term") || "book|game"; 
    
        const slug = url.searchParams.get("slug");
    console.log({id,slug,term});

    const data = await db?.searchStoreProduct({id,term,slug})
    
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  },
};
