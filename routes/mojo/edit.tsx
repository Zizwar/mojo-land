import { HandlerContext, PageProps } from "$fresh/server.ts";
import Edit from "@/islands/mojo/edit.tsx";

export default function Edits({ url, data, params }: PageProps) {
  return <Edit date={data} />;
}
export async function handler(
  req: Request,
  ctx: HandlerContext
): Promise<Response> {
  const url = new URL(req.url);
  const uuid = url.searchParams.get("uuid");
  let response = {};
    console.log("startttt in handelr req",{uuid});
  try {
    response = await fetch("https://8000-zizwar-jptwhats-tk6e2v42s7c.ws-eu104.gitpod.io/api/api/mojo-read?token=abrakadabraTokenZibra23&uuid=" + uuid);

    const responseData = await response.json();
    console.log({ responseData });

    response = responseData;
  } catch (error) {
    response = {};
  }

  return await ctx.render({ data: response });
}
