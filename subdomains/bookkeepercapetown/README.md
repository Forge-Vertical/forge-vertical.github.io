# Bookkeepers South Africa — rebrand preview

Static site, no build step — works as-is on GitHub Pages or any cPanel hosting.

## Structure
- index.html         → homepage
- assets/css/style.css → all styles (brand tokens at the top)

## Before going live
Photos in index.html are currently hotlinked from the live
bookkeepersincapetown.co.za media library, just so this preview
renders without needing uploads. Pull the real files from her
cPanel media library / file manager and drop them into
assets/images/, then update the <img> / background-image paths
to point at the local copies.

## Deploying to GitHub Pages
    git init
    git add .
    git commit -m "Bookkeepers South Africa rebrand preview"
    git branch -M main
    git remote add origin git@github.com:<you>/bookkeepers-sa-preview.git
    git push -u origin main
Then: repo Settings → Pages → Deploy from branch → main / (root).

## Deploying to cPanel
Zip the folder and upload via File Manager into public_html
(or a subfolder for a staging URL), or push over the existing
FTP/SFTP credentials for bookkeepersincapetown.co.za.
