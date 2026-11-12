# In-Touch Schools preview

A clickable preview of the In-Touch Schools platform. Sample data only. Nothing is saved or sent.

## Put it on GitHub Pages
1. Copy this whole folder (`in-touch-preview`) into your subdomain repo.
2. Commit and push. It is live at `https://<your-subdomain>/in-touch-preview/`.
3. It uses relative paths only and has no build step, so it also opens straight from a file.

## Change the brand
All colours are tokens at the top of `assets/style.css` (`:root`). Change `--navy`, `--accent` and friends, nothing else needs touching.
The logo mark and every icon are inline SVG in `assets/app.js` (the `ICONS` list).

## Notes
- The page asks search engines not to index it (`noindex`), because it is a client preview.
- Views: Platform Owner, Principal, Teacher, Parent, USSD phone simulator.
- Every "How this works when live" button opens a modal explaining what the finished system does.
- Try: Principal locks the term, then Teacher changes a mark, then Principal approves the request.
