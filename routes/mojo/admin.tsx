import { HandlerContext, PageProps } from "$fresh/server.ts";
import Admin from "@/islands/mojo/admin.tsx";

export default function Admins({ url, data, params }: PageProps) {
  return <Admin date={data} />;
}
export async function handler(
  req: Request,
  ctx: HandlerContext
): Promise<Response> {
  
  const response = await ctx.render({});
  return response;
}
