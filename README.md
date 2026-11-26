# Zaid Al Shehabi: personal portfolio

A one-page, bilingual (English / Arabic) portfolio site for Zaid Al Shehabi, a 4th-year IT student (networking) at the University of Aleppo. Its first job (since 2026-11-26) is to win **freelance web work**; networking internships come second, and it still shows who Zaid is overall.

This README is the handoff: read it first when continuing the work in a new conversation. It says what exists, how it is built, what was decided and why, and what is still open.

---

## Run it

Plain HTML, CSS and JavaScript. No build step, no packages.

- **Quickest:** double-click `index.html`.
- **Local server** (needed for some browser features):
  ```powershell
  python -m http.server 8790
  ```
  then open http://localhost:8790. `.claude/launch.json` has this as the `portfolio` entry for the Claude desktop preview.
- **Checks:** `node --test` (Node 22+). It runs `tests/site.test.mjs`. Plain `node --test tests/` does **not** work on Node 24.

URL options, handy for testing and for sharing a link in one language:
- `?lang=ar` or `?lang=en` opens that language.
- `?theme=light` or `?theme=dark` opens that theme.

---

## Files

| Path | What it is |
|---|---|
| `index.html` | The whole page. Every visible text is written twice, side by side: `data-lang="en"` then `data-lang="ar"`. |
| `css/style.css` | All styles. Colour tokens at the top (`:root` = dark), light theme under `html[data-theme="light"]` near the end. |
| `js/lang.js` | Language button. Sets `<html lang>` **and `dir`** (Arabic flips the page right-to-left), cross-fades the switch with the View Transitions API (`html.lang-switch`), remembers `localStorage.lang`. |
| `js/theme.js` | Light/dark button. Remembers `localStorage.theme`; switch animates as a circle from the button (View Transitions API). |
| `js/network.js` | One fixed network graph behind the whole page (`canvas.net`). The pointer links to nearby nodes and nudges them aside; a click (not on a control) sends a ripple and a burst of packets; scrolling moves nodes at different depths. |
| `js/motion.js` | Scroll unveiling (`data-reveal` = fade-up, `wipe`, `rise`, `card`, `list`, `deck`), the nav pill and progress line, the timeline rail and lit dots, the course deck (dots or click a slide), the hero drifting with the pointer. |
| `tests/site.test.mjs` | Structural checks (see below). |
| `assets/img/` | WebP screenshots: `scout-home.webp` and `scout-scouts.webp` (Scout app, dark mode, Nov 2026), `xp-form.webp` (dark mode), `course-slide-1..3.webp` (first three slides of the GitHub + Claude deck), `scout-leader-light.webp` (leader area, light mode), `scout-desktop.webp` (Scout home on a desktop, Zaid's own screenshot). Phone shots are taken at the real iPhone 15 Pro viewport (393×798 for the app, 393×715 for a site in Safari). |
| Device templates (`style.css`) | `.phone`: an iPhone 15 Pro sized 1:1 in points (`--pt`), with the iOS status bar (time, signal, Wi-Fi, battery), the Dynamic Island (on hover it becomes an incoming WhatsApp call), and the home indicator. `.phone.site` adds Safari's bottom address bar. `--screen` / `--sb-ink` set the status bar colours. `.laptop`: a dark lid with a camera and a base. |
| `assets/favicon.svg` | The tab icon (a Z on the page's dark ground). |
| `assets/icons/` | Real tool logos (from the taste skill's `icons.mjs`), with `icons-credits.json`. |
| `assets/fonts/` | Self-hosted fonts: Schibsted Grotesk (Latin), IBM Plex Sans Arabic 400/500/600. |
| `assets/cv/` | The two CV PDFs, copied from `S:\Zaid Al Shehabi - CV.pdf` and `S:\زيد الشهابي - CV.pdf`. |
| `docs/superpowers/specs/2026-11-25-portfolio-design.md` | The approved design doc (goals, decisions, what's out of scope). |
| `docs/superpowers/plans/2026-11-25-portfolio.md` | The original 6-step build plan. Steps 1–2 done (plus later rounds of changes); 3–6 partly folded in, see Status. |
| `.superpowers/sdd/.../progress.md` | Log of every decision made during the build ("Ruling:" lines). |
| `shots/` | Screenshots taken while checking (scratch; not part of the site, safe to delete). |
| `.taste-skill/` | The taste skill's checker data (scratch, ~60 MB; not part of the site, safe to delete). |

The site itself is only `index.html`, `css/`, `js/` and `assets/` (about 460 KB).

---

## Page structure

Sections in order (ids are checked by the tests):

1. `#hero`: a short "Freelance work" / "العمل الحر" line (no "Available"/"متاح"), name, "I build websites and web apps", intro, **Request a project** (opens WhatsApp) + **See my work**, three facts, and three devices: the course slide, a laptop with the Scout home page, and an iPhone with the Domains XP feedback form in Safari.
2. `#about`: "About me" text (**a draft written from the CV and projects; Zaid will send his own words to replace it**); Education, Tools I use (real logos, VS Code included), Languages (a CEFR scale per language; picking one types a hello in that language).
3. `#built`: "Projects". **Scout Troop 2 app** is the main project (two dark-mode phone screens, tools, six features as a ruled list); then the **XP points feedback form** (dark-mode phone screenshot, centred).
4. `#teaching`: "Teaching and experience" (nav: Experience): the **GitHub + Claude** course (AI literacy and working with GitHub, for people outside IT; 35 slides, 90 to 120 min, no coding; facts from the deck in `S:/Claude/Github/presentation/index.html`) with its first three slides as a fanned deck, then a timeline, newest start date first (dates, a rail that fills as you scroll, an icon per entry, a card per role).
5. `#contact`: "Have a project in mind?" / "لديك مشروع؟" (no "Let's talk"), email, the WhatsApp number (+963 948 990 111, linked through wa.me), LinkedIn, CV download, and a line that networking internships are still welcome.

The old `#beyond` section (video and photography, three placeholder tiles) was removed on 2026-11-26: empty placeholders looked unfinished. Leads moved into the timeline. When Zaid sends 2–3 real samples, bring the section back between Teaching and Contact (and add `beyond` back to the order test).

A networking section (OSPF and VLAN Packet Tracer labs) is **planned for later** and should slot in between About and Projects. See the end of the design doc.

---

## Decisions to keep (Zaid's choices)

- **Audience:** freelance clients first, networking internships second (changed 2026-11-26).
- **Look:** visually rich, *not* plain. **Defaults (changed 2026-11-26): Arabic and light mode** (`<html lang="ar" dir="rtl" data-theme="light">`); a saved choice or `?lang=` / `?theme=` overrides them. "Plain" applies only to the code (no libraries).
- **Light mode** exists as a button with an animated switch.
- **Language switch mirrors the layout** (changed 2026-11-26, reverting the earlier "never mirror" rule): Arabic sets `dir="rtl"` on `<html>`, and the switch cross-fades. Keep using logical properties so everything flips; direction-specific fixes live under `[dir="rtl"]` in `style.css` (arrow `.flip`, hero graph fade `--fade-x`).
- **Left out on purpose:** the Roblox game, the Blender models, the Domains rating site, and (for now) the networking labs.
- **Scout app gets the most space.**
- **Wording stays plain and personal**: short sentences, no slogans. Avoid "AI-sounding" copy.
- **Header:** one floating bar with no name in it (the name is in the hero): a Z mark to the top, nav with a sliding pill on the section in view, theme and language, a progress line. On phones the language button shows `عربي` / `EN`.
- **Motion (Zaid asked for more on 2026-11-26, even against the taste skill):** parts unveil as you scroll, and the background answers the pointer. Everything is visible without JS and rests under reduced motion.
- **Cards** have depth: a corner glow, a sheen and a soft light that follows the pointer. **Light mode** uses white cards and darker grey text for reading. The theme button is a white sun in dark mode and a moon in light mode.
- **Phones (2026-11-26):** the nav becomes an app-style tab bar at the bottom (icon + label for About, Work, Experience, Contact); theme and language sit in a small pill at the top; the hero runs text, buttons, then the three devices across the whole screen width, then the facts. Checked at 320, 360, 375, 390, 414 and 430 wide, both languages, both themes, with no sideways scroll. On touch screens the finger drives the background network (also while scrolling), a slow "ghost" pointer keeps it moving when no finger is down, and a tap sends a ripple.
- **Arabic wording (2026-11-26, Zaid's own):** "الهندسة المعلوماتية" everywhere instead of "تقانة المعلومات"; the hero subtitle "خبرة عملية في مجال إدارة المعلومات" and his lead line (500+ scouts); the button "اطلب مشروعاً"; the Arabic About text in his own words (only spelling and hamzas touched); the Domains role as "متطوع في مسار إدارة المعلومات". The English was then translated from his Arabic to match (hero, button "Request a project", About, the Domains role, informatics engineering instead of IT).
- **No "frontend-design" look:** no uppercase mono labels above headings, no glows, no dotted grids, no cursor-following card glow. (Scroll unveiling came back on Zaid's request.) Also removed on 2026-11-26 to look less AI-made: the pulsing status pill, the "Z" logo box, the floating chip card, fake window traffic lights, icon-in-tinted-square feature cards, language percentage bars, the second network graph, pill-shaped everything (radii now 6/10/14px).
- **Copy rewrite (2026-11-26, round 2):** all wording, both languages, rewritten in a formal, professional register (no colloquial Arabic). "الهندسة المعلوماتية" is the only term for the field: never "تقانة" or "تكنولوجيا" (the words "تقنية/التقنية" were also dropped from the copy). Education no longer says "إجازة" / "Bachelor's": Zaid is still a student, so it reads "طالب هندسة معلوماتية، اختصاص الشبكات" / "Informatics Engineering student, networks major".
- **Phones, round 2 (2026-11-26):** hero facts are full-width rows (label and detail on one line) instead of a 2-column grid with one left over; the two Scout phones sit level; tool chips grow to fill every row; course numbers in three equal columns; headings use `text-wrap: balance`. In light mode the background graph is much softer (hubs and packets no longer sit like blots over text), and the browser bar colour (`theme-color`) follows the theme.
- **Phone transitions (2026-11-26):** the theme switch uses the same circle as desktop on phones too (View Transitions; the dip only where they are missing). The language switch on phones uses a "dip" (`lang.js` `veilSwap`): the content fades out for .15s, the change happens, and it rises back while the page ground glides to its new colour. No full-screen veil (it read as a blank flash) and no View Transitions (the moving address bar cancels them). Taps show no blue box, and the scrollbar is hidden.
- **Theme circle (2026-11-26):** starts at the centre of the sun/moon icon at every width (corrected for Android's top address bar). While it runs, the background graph pauses and CSS colour transitions are held (`html.swap`, the icon keeps its morph), so only the circle animates. It starts at the icon's own size and grows over 560ms on an even curve (`cubic-bezier(.45,.05,.25,1)`): the old steep ease-out moved the edge ~100px in its first frame on a phone, which read as a stutter. Both toggles track the last choice (`want`), so quick double or triple taps always land on the right theme or language.
- **Hero phone call (2026-11-26):** only the main hero phone shows the incoming WhatsApp call, on hover. (Showing it 3 seconds after load was tried and reverted.) The other phones have a plain island.
- **Languages panel:** the first time it comes into view it types the English hello on its own.
- **Arabic in a colloquial voice** in two places, Zaid's own words: «بعطي التفاصيل الصغيرة حقها، وهي الصفحة مثال على هالشي.» (About) and «لو كان موقع أو مشروع أو تطبيق ويب…» (Contact). The rest stays formal.
- **Scout app: آلية الحجوزات / depot bookings** named in the intro and first in the feature list (from the scout README: basket per troop, all or nothing, put back, works offline). "Bilingual" left the list to keep six.
- **Prefer the smallest change** that solves a request ("ponytail" approach) over rebuilding.
- **Privacy:** changed 2026-11-26 at Zaid's request: the site shows his number **for WhatsApp only** (wa.me link, no `tel:`). A test checks that every number shown is that one.
- **No invented facts.** Everything comes from the CV or the projects' own README/HANDOFF files.
- **Don't commit or publish** without Zaid saying so. The folder is not a git repo yet.

---

## Rules for editing

- **Every text exists twice:** add the English `<span data-lang="en">` and the Arabic `<span data-lang="ar">` together. The test `languages paired` fails if the counts differ.
- English words inside Arabic text (GitHub, Google, Premiere Pro) go in `<bdi>…</bdi>` so punctuation doesn't jump around.
- Use CSS logical properties (`margin-inline-start`, not `margin-left`).
- New colours go in the tokens at the top of `style.css`, **and** get a light-mode value in the `html[data-theme="light"]` block.
- Everything must still work with `prefers-reduced-motion` (animations rest) and without JavaScript (Arabic, light, everything visible).
- After changes: `node --test`, then look at it at desktop width and at about 390px (phone), in both languages and both themes.

### What the tests check (`node --test`)
Sections in the right order · English and Arabic blocks paired · no phone number or `tel:` link · page starts as `lang="ar" dir="rtl" data-theme="light"` · every local `assets/`, `css/`, `js/` link exists · no external scripts.

---

## Where the content came from

- **CV:** `S:\Zaid Al Shehabi - CV.pdf` / `S:\زيد الشهابي - CV.pdf` (HTML sources in Downloads).
- **Scout app:** `C:\Users\zaida\OneDrive\Desktop\scout\README.md` and `HANDOFF.md`. The screenshots (Nov 2026) are the app's real `public/` pages in dark mode at 390×844, 2×, served by a throwaway local mock that answers `/api` with made-up sample data (one event, a few first names); the live database was never touched. To retake them: serve `scout/public` with fake `/api` answers (as that project's README says), set `localStorage.siteMode = 'dark'`, shoot at phone size. Note Chrome refuses ports 5060/5061.
- **XP form:** `S:\Claude\Points Form\README.md`. The screenshot is the form in dark mode at 520px, taken from a temporary copy (the original was not touched).
- **GitHub course:** `S:\Claude\Github\README.md`. The screenshot is `Course-Proposal.html`.
- **Hosting:** GitHub Pages from the repo `zaidshehabi/Portfolio` (the `gh` account on this computer is `zaidshehabi`; `zaidxya` was its old name). Address: **https://zaidshehabi.github.io/Portfolio/**. `share.jpg` (the 1200×630 link preview, the hero in dark mode), `robots.txt`, `sitemap.xml`, `.nojekyll` and the canonical / Open Graph tags all use that address. `.gitignore` keeps `.taste-skill/`, `shots/`, `.superpowers/`, `.claude/` and `docs/` out of the repo.

---

## Skills used

- **superpowers** (brainstorming → design doc → plan → executing): the process.
- **taste-skill (`design-taste-frontend`)**: palette (cool grey + cobalt), font (Schibsted Grotesk), split hero, and real tool icons. Its full kit and strict layout system were **not** adopted (see Status).
- **motion-design**: timing and easing for the motion that remains (hero entrance, hovers, theme switch).
- Installed during the build: `portfolio-case-study-writer`, `diagram-design`, `seo`, `publish-to-pages`.
- **ponytail** (smallest-change approach): enabled in Zaid's claude.ai account, but not installed in the Claude Code session used here. Its approach was followed by hand.

---

## Status and what's next

**Done:** the full page in both languages, dark and light themes, the Scout app and XP form sections with real screenshots, plain copy, cleanup of the frontend-design look.

**Waiting on Zaid:**
1. **2–3 video/photo samples** from Leads, to bring back a video and photography section.
2. Read through the **Arabic text** (Claude wrote it; a native speaker should check it).
3. Optional: a live link to the Scout app and the GitHub course, a photo of himself.
4. Later: the **networking labs** section (OSPF file at `Desktop\OSPF.pkt`; the VLAN `.pkt` hasn't been found yet).

**Not done yet (from the original plan):**
- **SEO and sharing:** done for the Pages address (see Hosting). If the site moves to its own domain, change the address in `index.html`, `robots.txt` and `sitemap.xml`.
- **Accessibility review:** use the `design:accessibility-review` skill.
- **Publishing to GitHub Pages:** files are ready; push to `zaidshehabi/Portfolio` and turn on Pages (branch `main`, folder `/`) with Zaid's go-ahead.
- **Final checks:** done 2026-11-26. Light mode at 1440 and 390, tablets at 820 and 768, both languages: nothing broken. (A headless full-page capture can show lazy images as empty frames if it scrolls too fast; that's the tool, not the page.)

**Known gaps:**
- The circular light/dark animation was tested for function (theme switches and is saved) but not watched on screen. Click the sun/moon button in a normal browser to confirm it looks right.
- **Taste-skill gate:** its checker still reports failures. Almost all of them come from its layout system (every section exactly one or two screens tall, its own header/footer class names, kit-only effects). That system was deliberately not adopted. If Zaid ever wants a full taste-skill build, that is a rebuild on its kit, not a fix. The stop hook that runs this gate lives in the taste-skill plugin; `.taste-skill/` holds its state.
