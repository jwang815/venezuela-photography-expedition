# Venezuela Photography Expedition — build & deploy

**Single source of truth:** `data.js` (one big JS object). Two Node renderers turn it
into the website and the Word/PDF; a Python script makes the social cover image.

## Files
- `data.js` — all itinerary content (meta, route, flights, 16 days, Orinoco pricing, safety, packing…)
- `build_html.js` — renders the shareable website -> `index.html`
- `build_docx.js` — renders `itinerary.docx` (needs the `docx` npm package)
- `make_cover.py` — renders `cover.png` (1200×630 social preview; needs Pillow)
- `build_guides.py` — rebuilds the operator/guide outreach spreadsheet (.xlsx)

## Rebuild
```bash
npm install docx                                   # once
pip install pillow openpyxl --break-system-packages # once
python3 make_cover.py                              # -> cover.png
SITE_URL="https://venezuela-photography-expedition-jwang815s-projects.vercel.app" OUT=index.html node build_html.js
node build_docx.js                                 # -> itinerary.docx
soffice --headless --convert-to pdf itinerary.docx # -> itinerary.pdf
```
Edit `data.js`, then re-run the lines above. The HTML template references colors/regions
from the data, so most changes are data-only.

## Deploy
- **GitHub:** commit + push this repo (GitHub Pages serves it; a PAT is needed to push).
- **Vercel:** project `venezuela-photography-expedition`. Upload `index.html` + `cover.png`
  via the Vercel Files + `/v13/deployments` API (target=production) with a Vercel token.
  Live: https://venezuela-photography-expedition-jwang815s-projects.vercel.app/

**Never commit tokens.** Read them from your own secrets file at deploy time.
