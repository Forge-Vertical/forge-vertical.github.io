# Marks Autocare — Franchise Platform (Demo)

Frontend-only UI/UX preview of the franchise management platform in the proposal. There is **no backend** wired up — no Firebase, no Firestore, no Cloud Functions, no real auth. Every "write" action (new booking, moving a date, converting a quote, etc.) pops a small "Demo only" card explaining exactly what it would do once the real infrastructure is built, instead of faking a save.

## Why React + TypeScript instead of plain HTML

This is the same stack committed to in the proposal (React + TypeScript + Firebase), so this demo is reusable Phase 1 scaffolding, not throwaway work. The three roles (Head Office, Franchise Admin, Branch Staff) genuinely need different views of the same data — that's a component/router problem, and duplicating markup across static HTML pages would drift out of sync fast. The data shapes in `src/data/mockData.ts` (Customer, Vehicle, Job, Franchise) are a first draft of what the Firestore collections become — every record already carries a `franchiseId`, which is the field the real security rules will check.

## Running it

```bash
npm install
npm run dev
```

Opens on `http://localhost:5173`. Use the **Preview as** dropdown top-right to switch between Head Office, Franchise Admin, and Branch Staff views — in production this doesn't exist; the role comes from the signed-in user's account.

## What's real vs what's a stand-in

| Real in this demo | Stand-in / mock |
|---|---|
| Component structure, routing, role-scoped views | No real authentication — the role switcher is a demo-only control |
| Data shapes (Customer/Vehicle/Job/Franchise types) | All data lives in `src/data/mockData.ts` — five sample franchises, five customers, five jobs |
| Layout, branding, interaction patterns | No Firestore, no Cloud Functions, no Cloudflare — nothing leaves the browser |
| The audit-trail *concept* on the Bookings page (see `(moved)` tag) | The actual audit log collection and write-time logging |

## Brand colors

Sampled from a logo crop you sent through chat (see `tailwind.config.js` → `brand.lime` / `brand.dark`) — these are a close visual match, not exact hex values pulled from the real logo file. Swap `brand.lime` and `brand.dark` in `tailwind.config.js` for the real values once you've got an export (SVG/AI/Figma) of the Marks Autocare logo, and the whole UI updates from one place.

## No-index / not for public access

- `public/robots.txt` disallows all crawlers.
- `index.html` carries `<meta name="robots" content="noindex, nofollow, noarchive">`.
- If you put this behind Cloudflare once it's live on the subdomain, add a Zero Trust Access policy (same as planned for the real build) so it's not just unindexed but actually gated behind a login — robots.txt only stops crawlers, not people with the link.

## Deploying to a subdomain

This builds to static files (`npm run build` → `dist/`), so it'll run on GitHub Pages, Cloudflare Pages, Netlify, or any static host pointed at a subdomain like `marks-demo.forgevertical.com`. Point the subdomain's DNS (CNAME) at whichever host you pick, same pattern as the rest of forgevertical.com's infrastructure.
