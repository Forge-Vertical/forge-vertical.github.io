import { GoogleGenerativeAI } from "@google/generative-ai";
import 'dotenv/config';

// Access the fuel from your GitHub Secrets / .env
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function refactorToTailwind(rawHtml: string) {
  // Use the high-speed 2.5 flash model
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    ROLE: You are the ForgeVertical Principal Architect.
    TASK: Refactor the provided HTML into a high-performance, industrial JAMstack node.
    
    CONSTRAINTS:
    - Use ONLY Tailwind CSS utility classes.
    - DARK MODE: Use a deep slate/zinc-950 background with lime-500 (#84cc16) accents.
    - TYPOGRAPHY: Use 'Plus Jakarta Sans' if possible, otherwise high-end sans-serif.
    - CLEANSE: Remove all original tracking scripts, ads, and third-party bloat.
    - IMAGE STRATEGY: Replace all <img> tags with <div> placeholders labeled "REPLACE WITH PEXELS/PIXABAY ASSET".
    - RESPONSIVENESS: Ensure mobile-first flex/grid layouts.
    
    OUTPUT: Provide ONLY the raw refactored HTML code. No explanations.
    
    RAW DATA TO FORGE: ${rawHtml.substring(0, 25000)}
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // Clean up any markdown code blocks if the AI includes them
    text = text.replace(/```html/g, "").replace(/```/g, "").trim();
    
    return text;
  } catch (error) {
    console.error("FORGE AI ERROR:", error);
    return `<div class="p-20 text-center bg-red-950 text-white font-black">AI REFACTOR FAILED: Verify Gemini API Key.</div>`;
  }
}
