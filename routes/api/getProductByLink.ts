//import database from "../../communication/database.ts";

import { getPraserUrl } from "../../cheerio.ts";

import { Handlers } from "$fresh/server.ts";
export const handler: Handlers = {
  async GET(req, ctx) {
  //  const { db } = ctx.state;
 const url = new URL(req.url);
  const link = url.searchParams.get("link");
 // if(!link) return console.log("nlo link",link);
  
     const praser = await getPraserUrl( link   );i
    
    return new Response(JSON.stringify(praser), {
      status: 200,
    //  headers: { "Content-Type": "application/json" },
    });
  },
};
