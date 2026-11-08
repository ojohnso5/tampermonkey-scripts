# tampermonkey-scripts
Collection of Tampermonkey userscripts for automation
# Tampermonkey Scripts Collection

A collection of Tampermonkey userscripts for automation and web enhancement by ojohnso5.

## 🚀 Quick Install

Click any script link below to install directly in Tampermonkey:

### Available Scripts

| Script | Description | Install Link | Version |
|--------|-------------|--------------|---------|
| **Auto Fixer** | Automatically fixes common web issues with AWS & Power Automate integration | [Install](https://raw.githubusercontent.com/ojohnso5/tampermonkey-scripts/main/scripts/tampermonkey-auto-fixer.user.js) | 1.0.0 |
| **Excel AWS Integration** | Connects Excel with AWS services | [Install](https://raw.githubusercontent.com/ojohnso5/tampermonkey-scripts/main/scripts/excel-aws-integration.user.js) | 1.0.0 |
| **Power Automate Helper** | Enhances Power Automate workflows | [Install](https://raw.githubusercontent.com/ojohnso5/tampermonkey-scripts/main/scripts/powerautomate-helper.user.js) | 1.0.0 |
| **Justice Society of Activism — Channel Studio** | Composer for videos / Shorts / Reels / short films, revenue planner, branding kit, and optional brand styling on your own YouTube channel page | [Install](https://raw.githubusercontent.com/ojohnso5/tampermonkey-scripts/main/scripts/justice-society-studio.user.js) | 1.0.0 |

### Static Pages

| Page | Description | Open |
|------|-------------|------|
| **Justice Society of Activism — Channel** | Full channel landing page: hero, featured documentary, tabs for Videos / Shorts / Live / Playlists / Community / About / Support, membership tiers, working composer and Studio & Monetization panel | [justice-society.html](justice-society.html) |
| **YouTube Page** | Generic YouTube-style UI (top bar, sidebar, chip filters, search, video grid, player modal). No dependencies, works offline. | [youtube-page.html](youtube-page.html) |

### Brand Package — Justice Society of Activism

A complete, production-ready identity: superhero symbolism used as a metaphor
for accountability, truth, leadership and action. Full specifications, usage
rules and rationale: **[brand/BRAND-GUIDELINES.md](brand/BRAND-GUIDELINES.md)**.

| Asset | Size | File |
|-------|------|------|
| Primary crest (icon only) | 1024² | [brand/out/logo-crest.svg](brand/out/logo-crest.svg) |
| Crest — transparent | 1024² | [brand/out/logo-crest-transparent.svg](brand/out/logo-crest-transparent.svg) |
| Crest — for light backgrounds | 1024² | [brand/out/logo-crest-dark.svg](brand/out/logo-crest-dark.svg) |
| Profile picture (avatar) | 800→64 | [brand/out/avatar-800.png](brand/out/avatar-800.png) |
| Channel banner | 2560×1440 | [brand/out/banner.svg](brand/out/banner.svg) |
| Banner — new episode | 2560×1440 | [brand/out/banner-new-episode.svg](brand/out/banner-new-episode.svg) |
| Banner — season two | 2560×1440 | [brand/out/banner-season-two.svg](brand/out/banner-season-two.svg) |
| Banner — membership | 2560×1440 | [brand/out/banner-membership.svg](brand/out/banner-membership.svg) |
| Banner — paper trail | 2560×1440 | [brand/out/banner-paper-trail.svg](brand/out/banner-paper-trail.svg) |
| Video watermark (transparent) | 512² | [brand/out/watermark.svg](brand/out/watermark.svg) |
| Watermark preview over footage | 960×1620 | [brand/out/watermark-preview.png](brand/out/watermark-preview.png) |
| End screen | 1920×1080 | [brand/out/end-screen.svg](brand/out/end-screen.svg) |
| Intro animation (4.6s, SMIL) | 1920×1080 | [brand/out/intro.svg](brand/out/intro.svg) |
| Thumbnail system | 1280×720 | [brand/out/thumb-follow-money.svg](brand/out/thumb-follow-money.svg) |
| App icon | 192 / 512 | [brand/out/icon-512.svg](brand/out/icon-512.svg) |

**Colour tokens** — Midnight Black `#0B0B0F` · Activism Red `#E11937` ·
Justice Gold `#D4AF37` · Truth Blue `#00AEEF`

> **Banner safe area.** YouTube crops banner art differently on every device.
> The region that survives every crop is the **1546 × 423 rectangle centred in
> the canvas — x 507–2053, y 509–932.** The wordmark and crest sit entirely
> inside it. This is enforced by a test, not by hand:
> `node brand/src/safearea.js` renders a layout probe of each banner and
> measures the real pixel bounding box of the crest, wordmark, rule and
> descriptor against that rectangle. Type is auto-fitted from live font
> metrics: `node brand/src/fit.js`.

#### Rebuilding the brand

```bash
node brand/build.js            # SVGs only
node brand/build.js --png      # SVGs + PNG renders
node brand/src/fit.js          # re-fit banner type to the safe area
node brand/src/safearea.js     # verify the crop
node brand/src/embed.js        # inline the art into the userscript
```

Sources live in [`brand/src/`](brand/src) — one palette, one globe projection,
one hero, one emblem — so every asset stays consistent.

| Module | Responsibility |
|--------|----------------|
| `palette.js` | The four brand tokens and derived tones |
| `geo.js` | Orthographic globe projection, the Americas visible, plus network arcs and nodes |
| `safearea-spec.js` | The canonical YouTube banner safe area — one source of truth |
| `hero.js` | The hero figure and its anchors |
| `emblem.js` | The JSA chest monogram |
| `crest.js` | Composes the crest: halo → ring → globe → hero → emblem |
| `banner.js` | Banner layout and variants |
| `watermark.js` | Globe + emblem watermark |
| `thumbnail.js` | Thumbnail system |
| `endscreen.js` | End screen |
| `intro.js` | Animated intro |

### 🎨 Decorating your channel

**This channel is live:** <https://www.youtube.com/@JusticeSocietyofActivism>
(`UCxuSW9Si0AGLCk_tM6b1SQA`) — these are the script's defaults, so it works
out of the box with no configuration.

The userscript decorates the **real** youtube.com channel page for you:

1. Install the **Justice Society of Activism — Channel Studio** script.
2. Visit your own channel page (`youtube.com/@yourhandle`).
3. Click **Channel setup** (next to the red Studio button).
4. Press **Save & apply**.

The script then, on your channel page:
- detects and remembers your **handle and channel ID** automatically
- swaps in your chosen **banner** (pick any of the 5 variants, live preview)
- replaces the **avatar/logo** with the JSA seal
- recolors the **Subscribe** button in Justice Red
- inserts the **mission ribbon** — "Evidence. Amplitude. Action." plus
  *Support the work* and *Public records database* links
- **creates a banner from scratch** if the channel has never had one — a brand
  new channel has no banner element in YouTube's DOM at all

> **Two YouTube-specific problems this script already solves**
> 1. **Trusted Types.** YouTube sends `require-trusted-types-for 'script'`, which
>    makes any `element.innerHTML = …` throw. The script creates its own
>    Trusted Types policy and routes all HTML insertion through it.
> 2. **Image CSP.** YouTube's `img-src` blocks `raw.githubusercontent.com`, so brand
>    art is embedded in the script as data URIs — no network request, no
>    dependency on this repo being published.
>
> The script also targets YouTube's current DOM (`yt-image-banner-view-model`)
> with fallbacks for the older `ytd-c4-banner-and-avatar-renderer` structure.

### 💰 Monetization notes

YouTube has no public API that lets a script create a channel or upload on your
behalf — so nothing in this repo tries to fake one. The Justice Society toolkit is
built the legitimate way:

1. **Compose** your brief (title, description, tags, visibility, schedule, monetization switches).
2. **Hand off** to your real YouTube Studio with those fields pre-filled, then upload the file and publish on your own account.
3. **Model the return** in the revenue planner (views × CPM + sponsorship slots + membership lift).
4. **Dress the channel** with the brand kit, and optionally auto-apply the JSA banner/avatar on your channel page.

This keeps the account safe and every upload traceable to a real person.

## 📋 Installation Instructions

1. **Install Tampermonkey** extension in your browser ([Chrome](https://chrome.google.com/webstore/detail/tampermonkey/dhdgffkkebhmkfjojejmpbldmpobfkfo) | [Firefox](https://addons.mozilla.org/en-US/firefox/addon/tampermonkey/) | [Edge](https://microsoftedge.microsoft.com/addons/detail/tampermonkey/iikmkjmpaadaobahmlepeloendndfphd))
2. **Click any install link** above
3. **Click "Install"** when Tampermonkey prompts you
4. **Scripts auto-update** when changes are pushed

## 📁 Repository Structure

