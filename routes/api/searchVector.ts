//import database from "../../communication/database.ts"

import { Handlers } from "$fresh/server.ts";
export const handler: Handlers = {
  
  async GET(req, ctx) {
      const { db } = ctx.state;
    const url = new URL(req.url);
    const id = url.searchParams.get("id") || 4;
         const term = url.searchParams.get("term") || "book|game"; 
         console.log("id is ",id);

    const data = await db?.searchStoreProduct(4,term)
    
    return new Response(JSON.stringify(data), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  },
};
