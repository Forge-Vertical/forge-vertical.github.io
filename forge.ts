import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function refactorToTailwind(rawHtml: string) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

  const prompt = `
    Refactor the following HTML into clean, semantic Tailwind CSS components. 
    - Use dark mode by default (bg-zinc-950, text-zinc-100).
    - Replace brand logos with <div> placeholders.
    - Ensure 100% responsiveness using Flex/Grid.
    - Output ONLY the HTML/Tailwind code.
    Raw HTML: ${rawHtml.substring(0, 15000)} // Context limit safety
  `;

  const result = await model.generateContent(prompt);
  return result.response.text();
}