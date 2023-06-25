import { Handlers } from "$fresh/server.ts";
import { OpenAI } from "openai";

export const handler: Handlers = {
  async POST(req, _ctx) {
    try {
      
      const data = (await req.json());

      const openAI = new OpenAI(Deno.env.get("KEY_OPEN_AI") ?? "");
    
      const chatCompletion = await openAI.createChatCompletion({
        model: "gpt-3.5-turbo",
        messages: [
          { "role": "system", "content": SystemRoleContenet },
          { "role": "user", "content": data.prompt},
        
        ],
      });
    
      console.log(chatCompletion);

      const choices = chatCompletion?.choices;

      const text = choices[0]?.message?.content ?? "gpt not respense";

      return new Response(text, {
        status: 200,
      });
    } catch (error) {
      console.error("Error occurred while processing request: ", error);
      return new Response("Something went wrong!", { status: 500 });
    }
  },
};

const SystemRoleContenet = "you are smart bot";