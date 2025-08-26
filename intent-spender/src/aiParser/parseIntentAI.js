import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: import.meta.env.VITE_OPENAI_API_KEY,
   dangerouslyAllowBrowser: true,               // ✅ allow use in browser
});

export const parseIntentAI = async (userInput) => {
  const prompt = `
You are a parser that converts natural language financial instructions into JSON.  

Output only JSON in this exact structure:
{
  "action": "send",
  "token": "ETH or ERC20 token symbol like USDC, DAI, USDT",
  "amount": number,
  "recipient": "0x... address",
  "note": "string"
}

Rules:
- If the user says "ether", "ETH", or "ethereum", set "token" = "ETH".
- If the user says a token name like USDC, DAI, or USDT, just output the symbol.
- If no note is provided, set "note" = "".
- Always return valid JSON, nothing else.


User command: "${userInput}"
`;

  try {
    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [{ role: "user", content: prompt }],
      temperature: 0,
      max_tokens: 200,
    });

    const jsonString = response.choices[0].message.content.trim();
    return JSON.parse(jsonString);
  } catch (err) {
    console.error("Failed to parse AI response:", err);
    return {
      error: true,
      message: "AI parsing failed, please switch to manual mode.",
      fallback: {
        action: "send",
        token: "",
        amount: "",
        recipient: "",
        note: "",}
      };   
  }

};
