//import database from "../../communication/database.ts";

import { Handlers } from "$fresh/server.ts";
export const handler: Handlers = {
    async GET(_req, ctx) {
const { db} = ctx.state
        
        const res = await db?.getStore(24)//db?.getStores();

console.log(res)
return new Response(JSON.stringify(res), {
  status: 200,
  headers: { "Content-Type": "application/json" },
});

    }
}
      