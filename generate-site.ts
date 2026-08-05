/**
 * Forge Vertical — SiteBuild Studio Generation Engine
 * POST /api/generate-site
 * 
 * Takes structured business data from the intake form and generates
 * a complete, responsive, single-file HTML website using Gemini 2.5 Flash.
 * 
 * Key architectural decisions:
 * - We give Gemini a RIGID SCAFFOLD to fill, not a blank canvas
 * - Every user data field is explicitly named in the prompt
 * - Style tokens are pre-calculated from the user's choices
 * - Output is validated before returning to client
 */

import { GoogleGenerativeAI } from "@google/generative-ai";
import 'dotenv/config';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY!);

// ── Style token system ────────────────────────────────────────────────────
const STYLE_TOKENS: Record<string, {
    bg: string; surface: string; border: string;
    text: string; muted: string; font: string; radius: string;
}> = {
    'modern-dark': {
        bg: '#09090b', surface: '#18181b', border: '#27272a',
        text: '#f4f4f5', muted: '#71717a',
        font: "'Inter', sans-serif", radius: '16px'
    },
    'clean-light': {
        bg: '#ffffff', surface: '#f8fafc', border: '#e4e4e7',
        text: '#09090b', muted: '#71717a',
        font: "'Plus Jakarta Sans', sans-serif", radius: '12px'
    },
    'vibrant-brand': {
        bg: '#0f172a', surface: '#1e293b', border: '#334155',
        text: '#f1f5f9', muted: '#94a3b8',
        font: "'Inter', sans-serif", radius: '14px'
    },
    'earthy-warm': {
        bg: '#1c1410', surface: '#3d2b1f', border: '#92400e',
        text: '#fef3c7', muted: '#d97706',
        font: "'Georgia', serif", radius: '20px'
    },
};

// ── Pexels image search mapping by industry keyword ──────────────────────
function getPexelsKeyword(industry: string): string {
    const lower = industry.toLowerCase();
    if (lower.includes('auto') || lower.includes('car') || lower.includes('panel') || lower.includes('repair'))
        return 'auto+repair+workshop';
    if (lower.includes('guest') || lower.includes('hotel') || lower.includes('lodge') || lower.includes('bnb'))
        return 'luxury+guesthouse+interior';
    if (lower.includes('restaurant') || lower.includes('cafe') || lower.includes('food'))
        return 'modern+restaurant+interior';
    if (lower.includes('law') || lower.includes('attorney') || lower.includes('legal'))
        return 'modern+law+office';
    if (lower.includes('medical') || lower.includes('clinic') || lower.includes('health'))
        return 'modern+medical+clinic';
    if (lower.includes('construction') || lower.includes('build'))
        return 'construction+site+professional';
    if (lower.includes('real estate') || lower.includes('property'))
        return 'modern+real+estate+office';
    if (lower.includes('salon') || lower.includes('hair') || lower.includes('beauty'))
        return 'hair+salon+modern';
    if (lower.includes('gym') || lower.includes('fitness'))
        return 'modern+gym+fitness';
    return 'professional+business+office';
}

// ── Main generation function ──────────────────────────────────────────────
export async function generateSite(data: {
    name: string;
    industry: string;
    location: string;
    tagline?: string;
    about?: string;
    phone?: string;
    email?: string;
    address?: string;
    domain?: string;
    services: string;
    pages: string[];
    testimonials?: string;
    hours?: string;
    cta?: string;
    style: string;
    color: string;
    styleNotes?: string;
    imageDesc?: string;
}): Promise<string> {

    const tokens = STYLE_TOKENS[data.style] || STYLE_TOKENS['clean-light'];
    const pexelsKw = getPexelsKeyword(data.industry);
    const servicesList = data.services
        .split('\n')
        .map(s => s.trim())
        .filter(Boolean)
        .map(s => `<li style="padding:12px 0;border-bottom:1px solid ${tokens.border};display:flex;gap:12px;align-items:flex-start;">
            <span style="color:${data.color};font-size:18px;flex-shrink:0;">✓</span>
            <span>${s}</span>
        </li>`)
        .join('');

    const testimonialHtml = data.testimonials
        ? data.testimonials.split('\n').filter(Boolean).map(t =>
            `<div style="background:${tokens.surface};border:1px solid ${tokens.border};border-radius:${tokens.radius};padding:24px;font-style:italic;color:${tokens.muted};">${t}</div>`
          ).join('')
        : '';

    // ── The structured prompt ─────────────────────────────────────────────
    // We give Gemini EXACTLY what to fill, with placeholders marked clearly.
    // This is the key fix — not asking it to invent structure.
    const prompt = `You are a professional web developer. Generate a complete, single-file HTML website for a real business.

OUTPUT RULES — FOLLOW EXACTLY:
1. Output ONLY raw HTML starting with <!DOCTYPE html>. No markdown, no code blocks, no explanation.
2. Use Tailwind CSS via CDN: <script src="https://cdn.tailwindcss.com"></script>
3. Use Google Fonts: Plus Jakarta Sans for headings, Inter for body.
4. Every section must be mobile-responsive using Tailwind flex and grid.
5. Include ONE valid JSON-LD Schema.org script in the <head> for the business.
6. Images: Use real Pexels URLs in format: https://images.pexels.com/photos/[ID]/pexels-photo-[ID].jpeg?auto=compress&cs=tinysrgb&w=1200
   Search keyword for Pexels: "${pexelsKw}"
   Use photo IDs like: 1216589, 3184291, 3184292, 3862601, 3862605, 2244746 (choose appropriately)
7. All images must have loading="lazy" and descriptive alt attributes.
8. Do NOT invent fake phone numbers, emails, or addresses beyond what is provided.
9. The nav must be sticky with a mobile hamburger menu that works with vanilla JS.

COLOUR AND STYLE SYSTEM — USE EXACTLY THESE VALUES:
- Background: ${tokens.bg}
- Surface (cards, sections): ${tokens.surface}
- Border colour: ${tokens.border}
- Primary text: ${tokens.text}
- Muted text: ${tokens.muted}
- Accent colour (buttons, highlights, icons): ${data.color}
- Border radius: ${tokens.radius}
- Font: ${tokens.font}
- Style notes from client: "${data.styleNotes || 'Professional and modern'}"

BUSINESS DATA — INSERT EXACTLY AS PROVIDED, DO NOT MODIFY:
- Business name: ${data.name}
- Industry: ${data.industry}
- Location: ${data.location}
- Tagline: ${data.tagline || `Professional ${data.industry} services in ${data.location}`}
- About: ${data.about || `${data.name} is a professional ${data.industry} business based in ${data.location}, committed to delivering exceptional service.`}
- Phone: ${data.phone || 'Contact us for details'}
- Email: ${data.email || ''}
- Address: ${data.address || data.location}
- Domain: ${data.domain || ''}
- Trading hours: ${data.hours || 'Monday – Friday: 8am – 5pm'}
- Primary CTA button text: "${data.cta || 'Get in touch'}"
- Image description hint: "${data.imageDesc || pexelsKw}"

PAGES TO INCLUDE (as sections in a single-page site): ${data.pages.join(', ')}

SERVICES LIST (already formatted as HTML list items — insert inside a <ul> tag):
${servicesList}

${testimonialHtml ? `TESTIMONIALS (already formatted as HTML — insert into testimonials section):
${testimonialHtml}` : 'No testimonials provided — omit the testimonials section.'}

REQUIRED SECTIONS STRUCTURE:
Build each requested page as a <section> in this order:
1. NAVIGATION: Sticky nav bar. Logo (business name in bold). Links to each section. Mobile hamburger that opens a full-screen menu. Uses accent colour ${data.color} for hover and active states.
2. HERO: Full viewport height. Business name as H1. Tagline as H2. A short compelling paragraph from the About text. Two CTA buttons: primary "${data.cta || 'Get in touch'}" (accent colour) and secondary "View our services" (outlined). Hero image from Pexels as background with overlay.
3. SERVICES: Grid of service cards (2 cols mobile, 3 cols desktop). Each service from the list gets its own card with an icon, name, and brief description you write based on the service name and industry. Use accent colour for icons.
4. ABOUT (if requested): Two-column layout. Left: image from Pexels. Right: heading + paragraphs from the About text. Include a row of 3 stat-style highlights (e.g. "10+ Years Experience", "500+ Happy Clients", "Quality Guaranteed").
5. TESTIMONIALS (if provided): Card grid of testimonials. Dark background section.
6. CONTACT: Two-column. Left: address, phone, email, hours in a clean list with icons. Right: a contact form (name, email, message, submit button in accent colour). Form has no action — note "We will set this up for you" as placeholder text under the form.
7. FOOTER: Dark background. Business name. Quick links. Contact summary. Copyright line with current year via JS.

Now generate the complete HTML for ${data.name}:`;

    const model = genAI.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: {
            maxOutputTokens: 8192,
            temperature: 0.4, // Lower temp = more consistent, less hallucination
        }
    });

    try {
        const result = await model.generateContent(prompt);
        let html = result.response.text();

        // ── Output sanitisation ───────────────────────────────────────────
        // Strip any markdown wrapping Gemini might add despite instructions
        html = html.replace(/^```html\s*/i, '').replace(/```\s*$/i, '').trim();

        // Ensure it starts with a valid DOCTYPE
        if (!html.toLowerCase().startsWith('<!doctype')) {
            const doctypeIdx = html.toLowerCase().indexOf('<!doctype');
            if (doctypeIdx > 0) {
                html = html.substring(doctypeIdx);
            } else {
                throw new Error('Gemini output did not contain valid HTML structure');
            }
        }

        return html;

    } catch (error: any) {
        console.error('GENERATION ERROR:', error);
        throw new Error(error.message || 'Gemini generation failed');
    }
}
