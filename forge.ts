import { GoogleGenerativeAI } from "@google/generative-ai";
import 'dotenv/config';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

export async function refactorToTailwind(rawHtml: string, userInstruction?: string) {
  // Upgraded to Gemini 1.5 Flash for high-speed industrial refactoring
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = `
    ROLE: Principal Architect at ForgeVertical.
    OBJECTIVE: Refactor raw HTML into an "Overpowered" Mobirise-style industrial JAMstack node.
    
    CORE DIRECTIVES:
    1. STYLE: Strictly Zinc-950 background. Accents in Lime-400 (#bef264). Text in Zinc-100.
    2. BLOCKS: Organize code into clear, semantic <section> blocks with descriptive IDs (e.g., id="hero-node", id="features-node").
    3. RESPONSIVENESS: Use fluid Tailwind spacing (clamp) and mobile-first flex/grid. No absolute positioning.
    4. IMAGE STRATEGY: 
       - Replace <img> src with high-quality Pexels placeholders (e.g., https://images.pexels.com/photos/12345/pexels-photo-12345.jpeg).
       - Ensure all <img> tags have 'loading="lazy"' and descriptive 'alt' tags.
    5. SEO ENGINE: 
       - Inject a structured JSON-LD Schema script in the footer of the HTML.
       - Ensure <h1> to <h3> hierarchy is logically perfect for crawlers.
    6. CLEANSE: Remove all original trackers, popups, and non-Tailwind bloat.
    7. CUSTOM OVERRIDE: ${userInstruction || "None provided. Use standard industrial presets."}

    CONSTRAINTS: Output ONLY valid, raw HTML. No Markdown wrappers. No conversational text.
    
    RAW DATA TO FORGE: ${rawHtml.substring(0, 20000)}
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // Industrial Cleanup Protocol
    text = text.replace(/```html/g, "").replace(/```/g, "").trim();
    
    // Ensure the output is wrapped in a standard container if the AI missed it
    if (!text.startsWith('<')) {
        text = `<section class="bg-zinc-950 text-zinc-100 p-10">${text}</section>`;
    }
    
    return text;
  } catch (error) {
    console.error("FORGE AI CRITICAL FAILURE:", error);
    return `
      <div class="p-12 bg-red-950 border-2 border-red-500 rounded-3xl text-center">
        <h2 class="text-2xl font-black text-white uppercase mb-4 italic">Signal Interrupted</h2>
        <p class="text-red-200 text-sm mono">Gemini API Key rejected or context limit exceeded. Check Forge Logs.</p>
      </div>
    `;
  }
}
