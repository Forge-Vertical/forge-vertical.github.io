import os
import random
from datetime import datetime

def forge_vertical_asset():
    # --- PART 1: INTEL GENERATION ---
    assets = [
        {
            "title": "The SME Growth Protocol",
            "tag": "STRATEGY",
            "headline": "Scaling from Local Shop to Digital Powerhouse",
            "content": "Most small businesses are trapped in 'Rental Content' cycles—paying for ads but owning no infrastructure. We pivot that. By building high-speed static nodes, an SME can outrank enterprise competitors who are weighed down by bloated legacy systems.",
            "insight": "Ownership of your code is the only true digital moat in 2026."
        },
        {
            "title": "Why JAMstack Wins",
            "tag": "ARCHITECTURE",
            "headline": "The Speed Gap: How 1.2s Load Times Double Revenue",
            "content": "For every second your site takes to load, you lose 7% in conversions. Our architecture removes the 'Server Middleman.' We deliver pre-rendered HTML directly to the edge, ensuring your customers never see a loading spinner.",
            "insight": "In the attention economy, speed isn't a feature—it's the product."
        }
    ]

    os.makedirs("intel", exist_ok=True)
    selected = random.choice(assets)
    intel_filename = selected['title'].lower().replace(" ", "-").replace(":", "") + ".html"
    intel_path = f"intel/{intel_filename}"

    # THE SHARED CONTACT STACK (WhatsApp +27661180036)
    contact_stack = """
            <section class="mt-20 border-t border-slate-100 pt-10">
                <h4 class="text-sm font-black uppercase tracking-widest text-slate-900 mb-6">Discuss Your Infrastructure</h4>
                <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <a href="https://wa.me/27661180036" class="flex items-center justify-center bg-[#25D366] text-white px-6 py-4 rounded-xl font-bold uppercase text-[10px] tracking-widest hover:opacity-90 transition-all">
                        WhatsApp Direct
                    </a>
                    <a href="https://fiverr.com/YOUR_PROFILE" class="flex items-center justify-center bg-[#1dbf73] text-white px-6 py-4 rounded-xl font-bold uppercase text-[10px] tracking-widest hover:opacity-90 transition-all">
                        Hire on Fiverr
                    </a>
                    <a href="mailto:jarrit@forgevertical.com" class="flex items-center justify-center bg-slate-900 text-white px-6 py-4 rounded-xl font-bold uppercase text-[10px] tracking-widest hover:bg-lime-600 transition-all">
                        Official Email
                    </a>
                </div>
            </section>
    """

    html_template = f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>{{title}} // ForgeVertical</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;500;800&display=swap');
        body {{ font-family: 'Plus Jakarta Sans', sans-serif; background-color: #ffffff; color: #1e293b; }}
        .vibrant-border {{ border-left: 4px solid #84cc16; }}
    </style>
</head>
<body class="antialiased py-20 px-6">
    <div class="max-w-3xl mx-auto">
        <nav class="mb-20 text-center md:text-left">
            <a href="../index.html" class="text-[10px] font-extrabold uppercase tracking-[0.4em] text-lime-600 hover:text-slate-900 transition-all">← Back to Forge</a>
        </nav>
        <header class="mb-12">
            <span class="bg-lime-100 text-lime-700 px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest mb-6 inline-block">{{tag}}</span>
            <h1 class="text-5xl md:text-6xl font-extrabold tracking-tighter text-slate-900 leading-tight">{{title}}</h1>
        </header>
        <article class="text-lg text-slate-600 font-light leading-relaxed">
            <h2 class="text-slate-900 font-extrabold text-2xl mb-6">{{headline}}</h2>
            <p class="mb-8">{{content}}</p>
            <div class="vibrant-border bg-slate-50 p-8 rounded-2xl my-12 italic shadow-sm">
                <p class="text-slate-900 font-medium">"Forge Insight: {{insight}}"</p>
            </div>
            {contact_stack}
        </article>
        <footer class="mt-32 pt-8 border-t border-slate-100 opacity-40 text-[9px] font-bold uppercase tracking-[0.3em]">ForgeVertical // Built for SMEs & Enterprises</footer>
    </div>
</body>
</html>
"""
    final_html = html_template.format(
        title=selected['title'],
        tag=selected['tag'],
        headline=selected['headline'],
        content=selected['content'],
        insight=selected['insight']
    )

    with open(intel_path, 'w') as f:
        f.write(final_html)

    # --- PART 2: INTERACTIVE TOOL FORGE ---
    os.makedirs("tools", exist_ok=True)
    tool_path = "tools/roi-calculator.html"
    
    roi_template = f"""
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Revenue Leakage Calculator // ForgeVertical</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;500;800&display=swap');
        body {{ font-family: 'Plus Jakarta Sans', sans-serif; background-color: #f8fafc; color: #1e293b; }}
    </style>
</head>
<body class="min-h-screen py-20 px-6">
    <div class="max-w-xl mx-auto bg-white p-10 rounded-[3rem] shadow-2xl border border-slate-100">
        <h2 class="text-3xl font-extrabold text-slate-900 mb-2">Revenue <span class="text-lime-500">Leakage</span></h2>
        <p class="text-slate-500 text-[10px] mb-8 uppercase tracking-widest font-black">Neil Patel Grade SEO Utility</p>
        
        <div class="space-y-6">
            <div>
                <label class="block text-[10px] font-black uppercase text-slate-400 mb-2">Monthly Traffic</label>
                <input type="number" id="traffic" value="5000" class="w-full bg-slate-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-lime-500 outline-none font-bold">
            </div>
            <div>
                <label class="block text-[10px] font-black uppercase text-slate-400 mb-2">Avg. Order Value ($)</label>
                <input type="number" id="value" value="100" class="w-full bg-slate-50 border-none rounded-xl p-4 focus:ring-2 focus:ring-lime-500 outline-none font-bold">
            </div>
            <button onclick="calc()" class="w-full bg-lime-500 text-white p-5 rounded-2xl font-black uppercase tracking-widest text-xs shadow-lg shadow-lime-500/30 hover:bg-slate-900 transition-all">Analyze My Data</button>
        </div>
        
        <div id="result" class="mt-10 p-8 bg-slate-900 rounded-[2rem] text-white hidden">
            <p class="text-slate-400 text-[10px] uppercase font-black tracking-widest mb-2">Annual Revenue at Risk</p>
            <span id="loss" class="text-4xl font-black text-lime-400">$0</span>
            <p class="mt-6 text-xs text-slate-400 leading-relaxed italic">"Slow load times and poor UX typically leak 7-12% of annual revenue. We plug those holes."</p>
            <div class="mt-8 grid grid-cols-1 gap-3">
                <a href="https://wa.me/27661180036" class="flex items-center justify-center bg-[#25D366] text-white p-4 rounded-xl font-black uppercase text-[10px] tracking-widest">Chat on WhatsApp</a>
                <a href="mailto:jarrit@forgevertical.com" class="flex items-center justify-center bg-white text-slate-900 p-4 rounded-xl font-black uppercase text-[10px] tracking-widest">Email Principal Architect</a>
            </div>
        </div>
    </div>
    <script>
        function calc() {{
            const t = document.getElementById('traffic').value;
            const v = document.getElementById('value').value;
            const leakage = (t * 0.10) * v * 12;
            document.getElementById('loss').innerText = '$' + Math.floor(leakage).toLocaleString();
            document.getElementById('result').classList.remove('hidden');
        }}
    </script>
</body>
</html>
"""
    with open(tool_path, 'w') as f:
        f.write(roi_template)

    # --- PART 3: SEO AUTOMATION (Robots & Sitemap) ---
    # Create robots.txt
    with open("robots.txt", "w") as f:
        f.write("User-agent: *\nAllow: /\n\nSitemap: https://forgevertical.com/sitemap.xml")

    # Build sitemap.xml
    now = datetime.now().strftime("%Y-%m-%d")
    sitemap_content = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    
    # Static & Tool pages
    pages = ["https://forgevertical.com/", "https://forgevertical.com/tools/roi-calculator.html"]
    
    # Scan for all forged intel pages
    if os.path.exists("intel"):
        for file in os.listdir("intel"):
            if file.endswith(".html"):
                pages.append(f"https://forgevertical.com/intel/{file}")

    for page in pages:
        sitemap_content += f'  <url>\n    <loc>{page}</loc>\n    <lastmod>{now}</lastmod>\n    <changefreq>weekly</changefreq>\n    <priority>0.8</priority>\n  </url>\n'
    
    sitemap_content += '</urlset>'
    
    with open("sitemap.xml", "w") as f:
        f.write(sitemap_content)

if __name__ == "__main__":
    forge_vertical_asset()
