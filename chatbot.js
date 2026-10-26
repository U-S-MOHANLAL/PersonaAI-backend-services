const { GoogleGenerativeAI } = require("@google/generative-ai");
const { googleGeminiApiKey } = require("./config");

const genAI = new GoogleGenerativeAI(googleGeminiApiKey);

async function processChat(message, history, name, description) {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: `
You are ${name}.

Character/personality description:
${description}

Instructions:
- Stay consistent with the character and personality described above.
- Respond naturally as this character.
- Use the personality, knowledge, emotional traits, and communication style described above when appropriate.
- Do not repeatedly mention that you are an AI or explain the character configuration.
- Do not simply repeat the description; demonstrate it through your responses.
- Maintain consistency throughout the conversation.`,
  });

  const chat = model.startChat({
    history,
    generationConfig: {
      maxOutputTokens: 5000,
    },
  });

  const result = await chat.sendMessage(message);
  const response = await result.response;

  return response.text();
}

module.exports = { processChat };