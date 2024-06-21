
//import Mojo from "./mojo.ts";
import Mojo from "npm:mojo-land";
//
import { Hono } from "https://deno.land/x/hono@v4.0.9/mod.ts";
import { createClient } from "https://cdn.skypack.dev/@supabase/supabase-js?dts";
import { jwt } from "https://deno.land/x/hono/middleware.ts";
import * as cookies from "https://deno.land/x/hono/helper.ts";
//
import denoblogger from "https://deno.land/x/denoblogger@v0.9.4/main.js";
//
import { OpenAI } from "https://deno.land/x/openai@1.3.1/mod.ts";

import cheerio from "https://cdn.skypack.dev/cheerio";

class Gpt {
  #openAI: OpenAI;

  constructor() {
    this.#openAI = new OpenAI(Deno.env.get("KEY_OPEN_AI") ?? "");
  }

  async chat(messages: any, model: string = "gpt-3.5-turbo") {
    const chatCompletion = await this.#openAI.createChatCompletion({
      model,
      //model: 'gpt-4-1106-preview',
      messages,
    });
    console.log({ chatCompletion });
    const choices = chatCompletion?.choices;
    const text = choices[0]?.message.content;
    return text;
  }
}



const supabase = createClient(
  Deno.env.get("SUPABASE_API_URL")!,
  Deno.env.get("SUPABASE_ANON_KEY")!
);

function generate(l = 64) {
  const c = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let r = "";
  for (let i = 0; i < l; i++) r += c[Math.floor(Math.random() * c.length)];
  return r;
}
const app = new Hono();
const mojo = new Mojo();

const gpt = new Gpt();

mojo.use({ jwt, gpt, cheerio, generate, useblogger: denoblogger });
mojo.use({ testFN: (arg) => arg });
//
mojo.cookies(cookies);
mojo.supabase(supabase);
mojo.tableName("mojos");
mojo.tokenName("token");
mojo.paramName("land");

app.get("/", (ctx): any => {
  return ctx.text("Hono MojoLand!");
});

app
  .get("/api/:land", async (ctx) => await mojo.render(ctx, "get"))
  .post("/api/:land", async (ctx) => await mojo.render(ctx, "post"))
  .put("/api/:land", async (ctx) => await mojo.render(ctx, "update"))
  .delete("/api/:land", async (ctx) => await mojo.render(ctx, "delete"));

Deno.serve(app.fetch);
