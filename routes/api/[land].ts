import { Handlers } from "$fresh/server.ts";
import Mojo from "@/mojo/mojo.ts";

import database from "@/communication/database.ts";
const db = new database();

const mojo = new Mojo();
mojo.use({db})
export const handler: Handlers = {

  async POST(req, ctx): Promise<Response> {
    return await mojo.render(req, ctx, "post");
  },

  async PUT(req, ctx): Promise<Response> {
    return await mojo.render(req, ctx, "update");
  },
  async GET(req, ctx): Promise<Response> {
   return await mojo.render(req, ctx, "get");
  },
  
  async DELETE(req, ctx): Promise<Response> {
   return await mojo.render(req, ctx, "delete");
  },
  
};
//