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
  let messages;
  if (event.body) {
    const data = JSON.parse(event.body);
    const { object1, object2 } = data;
    try {
      // const newAssistant = await openai.beta.assistants.create({
      //   name: assistantConfig.name,
      //   instructions: assistantConfig.instructions,
      //   tools: assistantConfig.tools,
      //   model: assistantConfig.model,
      // });
      const assistant = await openai.beta.assistants.retrieve(
        "asst_8viYrYw1MYW1hunEIadzGnkq"
      );
      console.log({ assistant });
      const thread = await openai.beta.threads.create();
      const message = await openai.beta.threads.messages.create(thread.id, {
        role: "user",
        content: `Object 1: ${object1}\nObject 2: ${object2}\n\n`,
      });
      if (assistant) {
        const run = await openai.beta.threads.runs.create(thread.id, {
          assistant_id: assistant.id,
        });
        console.log({ run });

        let runStatus = await openai.beta.threads.runs.retrieve(
          thread.id,
          run.id
        );

        // Polling mechanism to see if runStatus is completed
        // This should be made more robust.
        while (runStatus.status !== "completed") {
          await new Promise((resolve) => setTimeout(resolve, 2000));
          runStatus = await openai.beta.threads.runs.retrieve(
            thread.id,
            run.id
          );
        }

        messages = await openai.beta.threads.messages.list(thread.id);
        const data = messages.body.data.forEach((message) =>
          console.log(message.content)
        );
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
