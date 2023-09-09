import { HandlerContext, PageProps } from "$fresh/server.ts";
import Edit from "@/islands/mojo/edit.tsx";
import {getTableMojoBy} from "@/mojo/witch.ts";

export default function Edits({ url, data, params }: PageProps) {
  return <Edit data={data} />;
}
export async function handler(
  req: Request,
  ctx: HandlerContext
): Promise<Response> {
  const url = new URL(req.url);
  const uuid = url.searchParams.get("uuid");
  const endpoint = url.searchParams.get("endpoint");
  let response = {};
    console.log("startttt in handelr req",{uuid});
  try {
    response = await getTableMojoBy( {uuid,endpoint, single: true});


    console.log({ response });

  } catch (error) {
    response = {};
  }

  return await ctx.render({ data: response });
}
