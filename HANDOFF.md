# Hand-off prompt — Venezuela Photography Expedition (paste into a fresh Cowork session)

I'm Jason. In an earlier Cowork session you helped me plan a photography trip to Venezuela
for 2 people and built a shareable website + downloadable itinerary (Word/PDF/HTML) + an
operator outreach list. I'm continuing on a new machine — here's the full state so you can
pick up seamlessly. Please start by fetching the live site (or `src/data.js` from the repo)
to load the current itinerary, then ask me what I want to do next.

## Live deliverables (these persist online — fetch them for full detail)
- **Website (Vercel):** https://venezuela-photography-expedition-jwang815s-projects.vercel.app/
- **Source repo (GitHub):** https://github.com/jwang815/venezuela-photography-expedition
  - Built site at repo root: `index.html`, `cover.png`.
  - **Editable build source in `src/`** — `data.js` is the single source of truth; renderers
    `build_html.js`, `build_docx.js`, `make_cover.py`, `build_guides.py`; see `src/BUILD.md`
    for exact rebuild + deploy commands.
- To change anything: edit `src/data.js`, re-run the build (BUILD.md), redeploy to Vercel +
  push to GitHub.

## The plan (locked)
- **Travelers:** Jason + 1, photographers (Canon R5 II). Concise, client-ready outputs preferred.
- **Dates:** arrive Caracas Tue 23 Jun 2026 at 13:40; depart Wed 8 Jul at 16:11. 16 days.
- **Route:** Caracas → Canaima & Angel Falls → Orinoco Delta → Los Roques.
- **Nights:** Caracas 23–24, 28 Jun, 1–3, 7 Jul · Canaima 25–27 Jun · Orinoco Delta 29–30 Jun · Los Roques 4–6 Jul.
- **Domestic flights** (days verified against Conviasa's live booking calendar):
  - Thu 25 Jun CCS→Canaima (CAJ) · Sun 28 Jun CAJ→CCS (Conviasa)
  - Mon 29 Jun CCS→Puerto Ordaz (PZO) ~07:00 (Estelar) — Delta inbound
  - Wed 1 Jul Maturín (MUN)→CCS 14:50 (Conviasa) — Delta outbound
  - Sat 4 Jul CCS→Los Roques (LRV) · Wed 8 Jul LRV→CCS (Conviasa, daily)
- **Orinoco Delta** = Orinoco Delta Lodge, Plan 2 Plus, **Quote #5022567 — QUOTED, not yet
  booked**: 2 nights River Bungalow + air + transfers + English guide = **$1,370 for 2**
  ($685 pp). Contact: WhatsApp +58 412 855 6225.
- **Angel Falls:** no camping (full-day boat + light-plane overflight).
- **Excluded** (decided against): Catatumbo, Mérida (cable car closed), Morrocoy.
- **Caracas** is loaded with highlights: 360 Roof Bar (arrival golden hour), El Ávila/
  Warairarepano cable car, Galipán, El Hatillo, Chacao, Plaza Altamira, Las Mercedes dining.

## Open threads / likely next steps
- **Osprey Expeditions (Ben), osprey.expeditions@gmail.com** sent a day-by-day critique (Gmail).
  I still owe him a reply syncing him to THIS final version. Caution: my earlier reply to him
  still asked for Catatumbo + Mérida (now dropped) plus a comfort/helicopter Angel Falls with
  no hammocks — tell him to leave Catatumbo & Mérida out.
- **Operator outreach:** `Venezuela_Guide_Outreach_List.xlsx` (~20+ local guides w/ WhatsApp)
  + a short WhatsApp message template containing the site link. Regenerate via `src/build_guides.py`.
- Candidate to-dos: actually book the Delta (quote may expire), pick a Los Roques posada,
  get quotes for the other legs, and reconfirm all domestic flights ~1 week before travel
  (Venezuelan schedules slip).

## Credentials (read carefully)
- Redeploying needs MY OWN tokens (GitHub PAT + Vercel token). On the old machine they lived
  in a local `secrets.md`; this new machine won't have them until I re-add them. When I do,
  read them from my secrets file — never print or commit them.
- **Rotate the GitHub PAT:** an earlier session accidentally printed the old token once. If I
  haven't already revoked it, create a fresh PAT before pushing.
- Repo owner: `jwang815`. Vercel project: `venezuela-photography-expedition` (public link;
  deployment protection already disabled).

## My working preferences
Be concise and direct, minimal preamble. Show a brief plan and wait for my approval before
big or irreversible actions. Quality bar: client-ready. If confidence is low, say so.
