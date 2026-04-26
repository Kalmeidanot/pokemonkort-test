# KortKammer – Project Handoff

Pokémon TCG collector website. Vanilla HTML/CSS/JS, no build tools, no npm. Runs via Docker + nginx or any static file server.

---

## Tech stack

| Layer | Choice |
|---|---|
| Markup | HTML5 (`lang="no"`) |
| Styling | Single `styles.css` with CSS custom properties |
| Logic | Per-page JS files, no frameworks |
| Fonts | Google Fonts – Space Grotesk (headings) + Inter (body) |
| Data | Pokémon TCG API v2 (`https://api.pokemontcg.io/v2/`) |
| Persistence | `localStorage` |
| Serving | Docker + `nginx:alpine`, port 80 |

---

## File map

```
/
├── index.html          Landing page (hero + set showcase)
├── set.html            Card grid with search/filter
├── card.html           Single card detail
├── collection.html     User's owned cards (per-user localStorage)
├── wishlist.html       User's wanted cards (per-user localStorage)
├── profile.html        User profile (stats + logout)
│
├── styles.css          All styles — one file (includes dark mode block at bottom)
├── auth.js             Auth + theme helpers — loaded on every page before page script
├── set.js              Card grid logic + cache + pagination + filter/dropdown + live badge sync
├── sets-config.js      Local set config used by index.html and set.html
├── card.js             Card detail rendering + per-user localStorage toggles
├── collection.js       Renders per-user collection from localStorage
├── wishlist.js         Renders per-user wishlist from localStorage
├── profile.js          Renders profile stats; redirects to index if not logged in
├── script.js           Legacy — not referenced by any page, can be deleted
│
├── images/
│   ├── types/          Energy type icons (11 PNGs)
│   │   fire.png, water.png, grass.png, lightning.png, psychic.png,
│   │   fighting.png, dark.png, metal.png, dragon.png, normal.png, fairy.png
│   ├── cards/sv151/large/   207 downloaded card images (001-bulbasaur.png …)
│   ├── cards/base1/large/   Base Set default/local image folder
│   ├── cards/base1/unlimited/     Base Set Unlimited images
│   ├── cards/base1/shadowless/    Base Set Shadowless images
│   ├── cards/base1/1st-edition/   Base Set 1st Edition images
│   └── mockup/design-reference.png
│
├── scripts/
│   └── download-sv151-large.ps1   One-time PowerShell image downloader
│
└── Dockerfile          FROM nginx:alpine — copies everything to html root
```

---

## API

- **Base URL:** `https://api.pokemontcg.io/v2/`
- **Sets used:** `sv3pt5` (Scarlet & Violet—151, 207 cards) and `base1` (Base Set, 102 cards)
- **Card list:** `GET /v2/cards?q=set.id:{apiSetId}&orderBy=number&pageSize=250`
- **Single card:** `GET /v2/cards/{id}` — e.g. `sv3pt5-1`, `base1-2`
- No API key required for basic usage (rate-limited at 1000 req/day without key).

---

## localStorage

User-specific collection/wishlist keys are **per-user** (suffixed with `user.id`). Shared app/cache keys are not user-specific.

| Key | Contents |
|---|---|
| `kortkammer_user` | `{ id, name }` — set by `login()`, removed by `logout()` |
| `kortkammer_collection_{user.id}` | JSON array of card objects (owned cards) |
| `kortkammer_wishlist_{user.id}` | JSON array of card objects (wanted cards) |
| `kortkammer_cards_sv151` | Cached Pokémon TCG API card list for SV151 (`data.data`) |
| `kortkammer_cards_sv151_cached_at` | ISO timestamp for when the SV151 card cache was last written |

With the current mock user the concrete keys are `kortkammer_collection_test-user` and `kortkammer_wishlist_test-user`.

Card object shape stored in both lists:
```js
{
  id:      "sv3pt5-1",
  name:    "Bulbasaur",
  number:  "1",
  setName: "Scarlet & Violet—151",
  image:   "https://images.pokemontcg.io/sv3pt5/1.png",  // API small image (fallback)
  types:   ["Grass"],
  quantity: 1
}
```

Base Set variants are stored as separate app-level collectible objects while preserving the API id:
```js
{
  id:       "base1-2-unlimited",       // app id used for collection/wishlist identity
  appId:    "base1-2-unlimited",
  apiId:    "base1-2",                 // id used for Pokemon TCG API fetches
  variant:  "unlimited",               // unlimited | shadowless | 1st-edition
  setId:    "base1",
  name:     "Blastoise",
  number:   "2",
  setName:  "Base",
  image:    "images/cards/base1/unlimited/002-blastoise.png",
  types:    ["Water"],
  quantity: 1
}
```

If `quantity` is missing on older localStorage entries, the current code treats it as `1`.

**Old global keys** (`kortkammer_collection`, `kortkammer_wishlist`) may exist in browsers that used the site before per-user keys were introduced. They are ignored by the current code and were not automatically migrated.

---

## Card data cache (set.html)

`set.js` uses `localStorage` as a frontend-only cache for the selected set's card list.

**Cache keys:**
- `kortkammer_cards_sv151`
- `kortkammer_cards_sv151_cached_at`
- `kortkammer_cards_base1`
- `kortkammer_cards_base1_cached_at`

**Flow:**
1. On `set.html`, `loadCards()` first checks the selected set's cache key from `sets-config.js`.
2. If cached cards exist, `allCards` is set from cache and the grid renders immediately.
3. The Pokémon TCG API is still fetched in the background and remains the source of truth.
4. If the API returns different data, `set.js` updates the cache, updates `allCards`, and rerenders while preserving active search/filter/sort via `applyFilters()`.
5. If the API fails and cache exists, the cached grid stays visible.
6. If the API fails and no cache exists, the existing error message is shown.

This cache is only for card metadata. Collection and wishlist data still use the per-user keys from `getUserStorageKey()`.

---

## Local card images

Cards are served from local files first, with API URL as fallback:

**Path convention:** `{imageFolder}/{padded-number}-{sanitized-name}.png`

Current folders:
- SV151: `images/cards/sv151/large/`
- Base Set: `images/cards/base1/large/`
- Base Set variants:
  - `images/cards/base1/unlimited/`
  - `images/cards/base1/shadowless/`
  - `images/cards/base1/1st-edition/`

Example Base Set path:
`images/cards/base1/large/004-charizard.png`

Example Base Set variant path:
`images/cards/base1/shadowless/004-charizard.png`

- Number: digits only, zero-padded to 3 (`"1"` → `"001"`)
- Name: lowercase, apostrophes removed, non-alphanumeric replaced with `-`, leading/trailing `-` stripped

```js
// Implemented with the same filename rules in set.js, card.js, collection.js, and wishlist.js.
// set.js/card.js choose imageFolder from the selected set or variant.
function getLocalCardImage(card, variant) {
  const numStr = card.number.replace(/[^0-9]/g, '');
  const padded = numStr && parseInt(numStr) > 0
    ? String(parseInt(numStr)).padStart(3, '0')
    : card.number.toLowerCase().replace(/[^a-z0-9]/g, '');
  const name = card.name
    .toLowerCase()
    .replace(/[''']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return imageFolder + '/' + padded + '-' + name + '.png';
}
```

**Image fallback pattern** (prevents infinite loop):
```html
<img src="LOCAL_PATH" onerror="this.onerror=null;this.src='API_URL'" />
```

**To re-download all card images:**
```powershell
.\scripts\download-sv151-large.ps1
```
Skips files that already exist. Adds 150ms delay between requests.

---

## Type system

The TCG API returns type names that differ from display names and file names:

| API value | Display name | Icon file |
|---|---|---|
| `Grass` | Grass | `grass.png` |
| `Fire` | Fire | `fire.png` |
| `Water` | Water | `water.png` |
| `Lightning` | Lightning | `lightning.png` |
| `Psychic` | Psychic | `psychic.png` |
| `Fighting` | Fighting | `fighting.png` |
| `Darkness` | Dark | `dark.png` |
| `Metal` | Metal | `metal.png` |
| `Dragon` | Dragon | `dragon.png` |
| `Colorless` | Normal | `normal.png` |
| `Fairy` | Fairy | `fairy.png` |

Mappings live in `card.js` as `TYPE_NAMES` and `TYPE_FILES` objects.

---

## CSS design tokens

```css
:root {
  --primary:       #25293C;
  --primary-hover: #1F1F1F;
  --sand-dune:     #846C64;
  --clay:          #E7E2DD;
  --mist:          #F0ECE7;
  --surface:       #FFFFFF;
  --subtle-bg:     #F5F6F3;
  --border:        #D6D3D1;
  --font-heading:  'Space Grotesk', sans-serif;
  --font-body:     'Inter', sans-serif;
}
```

Button states:
- `.btn-primary` — dark navy (`--primary`)
- `.btn-primary.btn-active` — warm brown (`#5a3d37`) when card is in collection
- `.btn-secondary.btn-active` — same warm brown when card is in wishlist

---

## Page structure

### `index.html` — Landing page
Uses `<nav class="site-nav">` with logo + nav links + auth slot (`<span id="nav-auth">`).
Hero: split layout (text left, SV-151 logo right).
Sets showcase is rendered from `sets-config.js` and currently includes Base Set and Scarlet & Violet 151.
The landing page has a set sort dropdown: oldest first (default) / newest first.
**No card grid here.**

### `set.html` — Card grid
"Alle kort" is marked active in nav.
Search input, custom type dropdown, sort select, reset button above grid.
`set.html` loads `sets-config.js` before `set.js`.
`set.js` reads `?set=...` from the URL, falls back to `sv151`, and finds the selected set in `window.KORTKAMMER_SETS`.
Grid populated by `set.js` from the selected set's Pokémon TCG API id.
Base Set shows a variant dropdown above the grid with Unlimited, Shadowless, and 1st Edition. SV151 does not show this dropdown.
Cards show status badges (✓ I samling / ♡ Ønsket) read from per-user localStorage on each render. Badges are hidden for unauthenticated users. Badges are variant-aware and show quantity when quantity is greater than 1, e.g. `✓ I samling (3)`.
`set.js` first renders cached card data for the selected set when available, then refreshes from the API in the background.
The grid uses a simple "Vis flere kort" pagination: first 40 cards are rendered, then each click renders 40 more. Search, type filter, sort, and reset all reset the visible count back to 40 and keep pagination working on the filtered list.
Supported set URLs:
- `set.html` or `set.html?set=sv151` → Scarlet & Violet 151 (`sv3pt5`)
- `set.html?set=base` → Base Set (`base1`)

### `card.html` — Card detail
No nav link is marked active.
`#card-detail` populated by `card.js`.
Layout: left column (card image + info panel), right column (name, HP, types, attacks, flavor text, action buttons).
Base Set cards show a variant dropdown under the card image when opened from `card.html?id=base1-2` or `card.html?id=base1-2&variant=shadowless`.
The API fetch always uses `id` from the URL (`base1-2`), while `variant` only controls local image folder and collection/wishlist identity.
Collection and wishlist actions use quantity controls. The main button adds the first copy; once present, `[-] N [+]` controls increase/decrease quantity. Reducing to 0 removes the card from that list.
If not logged in: action buttons are replaced with a "Logg inn" prompt.

### `collection.html` / `wishlist.html`
Read per-user localStorage and render grid or empty state.
Each saved card appears once with a variant label when `card.variant` exists and a quantity control (`Antall: [-] N [+]`).
Variant cards link back to `card.html` using API id plus variant query, e.g. `card.html?id=base1-2&variant=unlimited`, never the app id (`base1-2-unlimited`) as the API id.
Images use `card.image` first, then build a local variant path if possible, then fall back to the Pokemon TCG image URL.
If not logged in: shows a "Logg inn" prompt instead of the grid.

### `profile.html`
Shows user name, collection count, wishlist count, and a logout button. Counts sum `quantity`, so 3 copies count as 3, not 1 unique card.
Redirects to `index.html` if no user is found in localStorage.

---

## Authentication (mock)

Real auth is not implemented. A localStorage-based mock is in place as a scaffold.

| Key | Value |
|---|---|
| `kortkammer_user` | `{ id: "test-user", name: "Testbruker" }` |

**`auth.js`** — loaded on every page via `<script src="auth.js?v=3">` placed after `</nav>` and before the page-specific script. Exposes these globals:

| Function | Description |
|---|---|
| `getUser()` | Returns parsed user object from localStorage, or `null` |
| `login()` | Saves mock user to localStorage, reloads page |
| `logout()` | Removes user from localStorage, redirects to `index.html` |
| `getUserStorageKey(type)` | Returns `kortkammer_{type}_{user.id}` or `null` if not logged in |
| `initNav()` | Populates `<span id="nav-auth">` — runs on `DOMContentLoaded` |
| `initTheme()` | Wires the 🌙/☀️ button to toggle dark mode — runs on `DOMContentLoaded` |

`getUserStorageKey` is the **single source of truth** for all localStorage keys. Call it with `'collection'` or `'wishlist'`. It returns `null` for unauthenticated users — callers must check for null before reading or writing.

**Script loading order matters.** Every HTML page must load `auth.js` before its page-specific script so that `getUserStorageKey()` is defined when the page script runs.

**To wire up real auth later:**
- Replace `login()` / `logout()` in `auth.js` with calls to your auth provider (OAuth, JWT, etc.)
- Replace `getUser()` with a session/token check
- `getUserStorageKey(type)` already uses `user.id` — no change needed in any page script when switching to real auth

---

## Dark mode

Implemented via a `data-theme` attribute on `<html>`.

**How it works:**
1. Each HTML file has an inline `<script>` in `<head>` that reads `kortkammer_theme` from localStorage and sets `data-theme` before the body renders (prevents flash of unstyled content).
2. `styles.css` has a `html[data-theme="dark"] { }` block at the bottom that overrides all surface/text/border CSS variables.
3. `initTheme()` in `auth.js` wires the 🌙/☀️ nav button: toggles the attribute and persists the choice.

**localStorage key:**

| Key | Value |
|---|---|
| `kortkammer_theme` | `"dark"` or `"light"` (absent = light) |

**To add a new page:** copy the inline FOUC script from any existing `<head>` — it's a one-liner. `initTheme()` runs automatically via `auth.js`.

---

## Live badge sync (set.html)

Collection and wishlist badges in the card grid update without a page reload when cards are added, removed, or quantity changes.

**Two triggers:**
- `window storage` event — fires in other open tabs when localStorage changes. `set.js` checks if the changed key matches the user's collection or wishlist key.
- `kortkammerUpdated` custom event — dispatched by `card.js` after quantity changes (covers same-tab navigation patterns).

Both call `updateCardBadges()` in `set.js`, which reads the current localStorage state and updates only the badge `<span>` inside each `.pokemon-card[data-card-id]` element — no re-fetch, no full re-render. For Base Set, `data-card-id` is the variant-aware app id for the currently selected variant.

---

## Script versioning / cache busting

All `<script>` tags use a `?v=N` query parameter to force browser re-download when scripts change. Current versions:

| Script | Current version |
|---|---|
| `auth.js` | `?v=3` |
| `set.js` | `?v=12` |
| `sets-config.js` | `?v=3` |
| `card.js` | `?v=9` |
| `collection.js` | `?v=7` |
| `wishlist.js` | `?v=7` |
| `profile.js` | `?v=4` |

Increment `v` on **all pages that load the changed script** whenever JS logic changes.

If a user reports stale behaviour after a deploy, the safest fix is: DevTools → Application → Storage → **Clear site data**, then reload.

---

## Pending work

1. ~~Lazy loading / pagination for the card grid~~ — **done** via 40-card "Vis flere kort" batches in `set.js`.
2. ~~Dark mode toggle~~ — **done**.
3. Optional: "Om oss" nav link is dead (`href="#"`).
4. Optional: wire real auth provider into `auth.js` (see Authentication section above).
5. Optional: migrate old global localStorage data (`kortkammer_collection`, `kortkammer_wishlist`) to per-user keys on first login.
6. ~~Basic multiple-set support~~ — **done** via `sets-config.js`, landing-page set rendering, and `set.html?set=...`.
7. ~~Base Set variant support~~ — **done** for `set.html`, `card.html`, collection/wishlist storage, variant labels, and variant-aware links.
8. ~~Quantity support~~ — **done** for card detail, collection, wishlist, profile totals, and set badges.

---

## TODO / Neste steg

### 1. Stabil samling/ønskeliste først

- Legge til filtrering i `collection.html` og `wishlist.html`.
- Brukeren må kunne filtrere kort etter sett, fordi samling/ønskeliste nå kan inneholde kort fra flere sett og Base Set-varianter.
- Filteret bør støtte minst:
  - Alle sett
  - Scarlet & Violet 151
  - Base Set
- Senere kan filteret utvides til:
  - Variant
  - Type
  - Rarity

### 2. Flytte set-oversikten til egen side

- Oversikten over Pokémon-sett ligger nå på landingssiden.
- Flytt set-oversikten til en egen side, for eksempel `sets.html`.
- Siden skal være tilgjengelig fra header/nav.
- Behold eksisterende sortering på sett:
  - Eldst først
  - Nyest først
- Landingssiden skal etter hvert brukes til aktive oppføringer.

### 3. Endre landingsside til markedsplass

- Første som vises på forsiden skal være aktive oppføringer.
- Oppføringstyper:
  - Fastprisannonse
  - Claim-salg
  - Auksjon
  - Auksjon uten minstepris
  - Lynauksjon
- Bruker skal kunne filtrere etter type oppføring.
- Bruker skal også kunne se avsluttede oppføringer.
- Foreløpig planlegges dette frontend-only/mock-data.
- Ikke legg til backend ennå.

### 4. Flette inn budsystem senere

- Det finnes et budsystem i et annet prosjekt som senere skal vurderes flettet inn i KortKammer.
- Ikke implementer dette nå.
- Først må budsystemet kartlegges:
  - Hvilke filer budsystemet består av
  - Hvilke funksjoner det har
  - Om det bruker `localStorage`, backend eller annen struktur
  - Hvordan det passer med oppføringstypene på landingssiden

### 5. Vurdere sammenslåing med faktisk prosjekt

- Dette startet som testprosjekt, men kan bli brukt som grunnlag for faktisk prosjekt.
- Eventuell sammenslåing bør gjøres kontrollert:
  - Velg ett repo/prosjekt som hovedprosjekt
  - Ta backup/commit før sammenslåing
  - Flytt inn én funksjon av gangen
  - Test etter hver flytting
  - Unngå å kopiere alt ukritisk

### 6. Fullføre faktiske lokale bilder for Base Set

   - Legge inn bildefiler i:
     - `images/cards/base1/large/`
     - `images/cards/base1/unlimited/`
     - `images/cards/base1/shadowless/`
     - `images/cards/base1/1st-edition/`
   - Følge filnavnformat:
     `001-alakazam.png`
     `002-blastoise.png`
     osv.
   - Bekrefte at fallback til API fortsatt fungerer hvis bilde mangler.

### 7. Vurdere lokal kortdata senere

   - Per nå caches API-data i `localStorage`
   - Senere kan vi lage lokal JSON per sett hvis ønskelig

### 8. Senere teknisk opprydding

   - Eventuell migrering av gamle globale localStorage-nøkler:
     - `kortkammer_collection`
     - `kortkammer_wishlist`
   - Migrering bør flytte data til:
     - `kortkammer_collection_{user.id}`
     - `kortkammer_wishlist_{user.id}`
   - Fikse eller rydde død "Om oss"-lenke (`href="#"`).
   - Ekte auth senere ved å erstatte mock-login i `auth.js`.

### 9. Arbeidsregler videre

   - Ingen backend ennå
   - Ingen database ennå
   - Ingen redesign
   - Små, trygge steg
   - Test etter hver endring

---

## Running locally

**Docker:**
```bash
docker build -t kortkammer .
docker run -p 8080:80 kortkammer
# Open http://localhost:8080
```

**Any static server** (Python, VS Code Live Server, etc.) — no server-side logic required.

---

## Known quirks

- `script.js` in root is a leftover from the first version. It is not referenced by any HTML page and can be deleted.
- The set logo on `set.html` and `index.html` is loaded from `images.pokemontcg.io` (not local). It will fail offline.
- Cards with non-numeric numbers (promo codes etc.) fall through to a name-only path in `getLocalCardImage` — these will likely miss the local file and hit the API fallback.
- If scripts are changed without incrementing `?v=N`, browsers may serve stale JS from cache. Always bump the version number in all HTML files after JS changes.
- Old global localStorage keys (`kortkammer_collection`, `kortkammer_wishlist`) may exist in browsers from before per-user keys were introduced. They are ignored — no migration runs automatically.
