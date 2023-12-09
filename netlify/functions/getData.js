import OpenAI from "openai";
const assistantConfig = {
  name: "Idea Generator",
  instructions:
    "One of the best ways to generate new ideas for a product is to take two seemingly random objects and think of how they could be used together to create a new object. You could use the shape, color, intention, the function of the object. Anything that may inspire a new idea. An example would be having one object be a paperclip and the other object be a yoga mat. The new product that combines those two things would be a yoga mat carrier that is the shape of a really large paperclip! Using those instructions can you help generate a few ideas when someone lists two objects?",
  tools: [{ type: "retrieval" }],
  model: "gpt-4-1106-preview",
};
const headers = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTION",
};
const apiKey = process.env.REACT_APP_OPENAI_API_KEY;
const openai = new OpenAI({ apiKey });

export const handler = async (event) => {
  if (event.body) {
    const data = JSON.parse(event.body);
    const { object1, object2 } = data;
    console.log({ object1, object2 });
    try {
      const newAssistant = await openai.beta.assistants.create({
        name: assistantConfig.name,
        instructions: assistantConfig.instructions,
        tools: assistantConfig.tools,
        model: assistantConfig.model,
      });
      const thread = await openai.beta.threads.create();
      const message = await openai.beta.threads.messages.create(thread.id, {
        role: "user",
        content: `Object 1: ${object1}\nObject 2: ${object2}\n\n`,
      });
      if (assistant) {
        const run = await openai.beta.threads.runs.create(thread.id, {
          assistant_id: newAssistant.id,
        });
        const messages = await openai.beta.threads.messages.list(thread.id);
        console.log({ messages });
      }
    } catch (err) {
      console.error(err);
    }

    return {
      statusCode: 200,
      headers,
      body: JSON.stringify({
        message: messages,
      }),
    };
  }
};