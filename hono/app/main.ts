import { Hono } from 'https://deno.land/x/hono@v4.0.9/mod.ts'
import Mojo from "../mojo.ts";
const app = new Hono()

app.get('/', (ctx): any => {
  return ctx.text('Hono MojoLand!')
})

app.get('/', async (ctx) =>  await mojo.render(ctx, "post"))
app.post('/', (c) => c.text('POST /'))
app.put('/', (c) => c.text('PUT /'))
app.delete('/', (c) => c.text('DELETE /'))


Deno.serve(app.fetch)
