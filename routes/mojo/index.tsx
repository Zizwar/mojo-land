import { HandlerContext, PageProps } from "$fresh/server.ts";

import {getTableMojoBy} from "@/mojo/witch.ts";

import List from "@/islands/mojo/Llists.tsx";


export default function Lists({ url, data, params }: PageProps) {
  return <List data={data} />;
}
export async function handler(
  req: Request,
  ctx: HandlerContext
): Promise<Response> {
  
  try {
    response = await getTableMojoBy();


    console.log({ response });

  } catch (error) {
    response = {};
  }

  return await ctx.render({ data: response });
}


