import { Hono } from "https://deno.land/x/hono@v4.0.9/mod.ts";
import Mojo from "../mojo.ts";

const app = new Hono();
const mojo = new Mojo();
mojo.use({test:23})
mojo.use({testFN:(arg)=>arg})

app.get("/", (ctx): any => {
  return ctx.text("Hono MojoLand!");
});

app.get("/api/:land", async (ctx) => await mojo.render(ctx, "get"))
.post("/api/:land", async (ctx) => await mojo.render(ctx, "post"))
.put("/api/:land", async (ctx) => await mojo.render(ctx, "update"))
.delete("/api/:land", async (ctx) => await mojo.render(ctx, "delete"));

Deno.serve(app.fetch);
