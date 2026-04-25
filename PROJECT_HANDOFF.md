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
├── collection.html     User's owned cards (from localStorage)
├── wishlist.html       User's wanted cards (from localStorage)
│
├── styles.css          All styles — one file
├── set.js              Card grid logic + filter + dropdown
├── card.js             Card detail rendering + localStorage toggles
├── collection.js       Renders kortkammer_collection from localStorage
├── wishlist.js         Renders kortkammer_wishlist from localStorage
├── script.js           Legacy — no longer used, can be deleted
│
├── images/
│   ├── types/          Energy type icons (11 PNGs)
│   │   fire.png, water.png, grass.png, lightning.png, psychic.png,
│   │   fighting.png, dark.png, metal.png, dragon.png, normal.png, fairy.png
│   ├── cards/sv151/large/   207 downloaded card images (001-bulbasaur.png …)
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
- **Set used:** `sv3pt5` (Scarlet & Violet—151, 207 cards)
- **Card list:** `GET /v2/cards?q=set.id:sv3pt5&orderBy=number&pageSize=250`
- **Single card:** `GET /v2/cards/{id}` — e.g. `sv3pt5-1`
- No API key required for basic usage (rate-limited at 1000 req/day without key).

---

## localStorage

| Key | Contents |
|---|---|
| `kortkammer_collection` | JSON array of card objects (owned cards) |
| `kortkammer_wishlist` | JSON array of card objects (wanted cards) |

Card object shape stored in both lists:
```js
{
  id:      "sv3pt5-1",
  name:    "Bulbasaur",
  number:  "1",
  setName: "Scarlet & Violet—151",
  image:   "https://images.pokemontcg.io/sv3pt5/1.png",  // API small image (fallback)
  types:   ["Grass"]
}
```

---

## Local card images

Cards are served from local files first, with API URL as fallback:

**Path convention:** `images/cards/sv151/large/{padded-number}-{sanitized-name}.png`

- Number: digits only, zero-padded to 3 (`"1"` → `"001"`)
- Name: lowercase, apostrophes removed, non-alphanumeric replaced with `-`, leading/trailing `-` stripped

```js
// Implemented identically in both set.js and card.js:
function getLocalCardImage(card) {
  const numStr = card.number.replace(/[^0-9]/g, '');
  const padded = numStr && parseInt(numStr) > 0
    ? String(parseInt(numStr)).padStart(3, '0')
    : card.number.toLowerCase().replace(/[^a-z0-9]/g, '');
  const name = card.name
    .toLowerCase()
    .replace(/[''']/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return 'images/cards/sv151/large/' + padded + '-' + name + '.png';
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
Uses `<nav class="site-nav">` with logo + nav links + icon buttons.
Hero: split layout (text left, SV-151 logo right).
Sets showcase: clickable `.set-card` → `set.html`.
**No card grid here.**

### `set.html` — Card grid
Uses old `<header class="hero hero--small">` with logo + back link.
**Pending: replace with `site-nav` matching index.html.**
Search input, custom type dropdown, sort select, reset button above grid.
Grid populated by `set.js` from API.
Cards show status badges (✓ I samling / ♡ Ønsket) read from localStorage on each render.

### `card.html` — Card detail
Uses old `<header class="hero hero--small">`.
**Pending: replace with `site-nav` matching index.html.**
`#card-detail` populated by `card.js`.
Layout: left column (card image + info panel), right column (name, HP, types, attacks, flavor text, action buttons).

### `collection.html` / `wishlist.html`
Use `site-nav`. Read localStorage and render grid or SVG empty state.

---

## Pending work

1. **Migrate `set.html` header** from `hero--small` to `site-nav` (match index.html pattern).
2. **Migrate `card.html` header** from `hero--small` to `site-nav`.
3. Optional: lazy loading / pagination for the card grid (207 items loads fine, but future sets will need it).
4. Optional: dark mode toggle (button exists in nav, logic not implemented).
5. Optional: "Om oss" and profile nav links are dead (`href="#"`).

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
