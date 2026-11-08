# JUSTICE SOCIETY OF ACTIVISM — Brand Package

A complete, production-ready identity for a civic-activism media network.
Superhero symbolism used as a metaphor for accountability, truth, leadership
and action — not as comic-book pastiche.

Everything in `out/` is **generated**. Edit the sources in `src/` and rebuild:

```bash
node brand/build.js            # SVGs only
node brand/build.js --png      # SVGs + PNG renders
node brand/src/embed.js        # inline the art into the userscript
```

---

## 1. The mark

**`out/logo-crest.svg`** — icon-only crest. No wordmark, no slogan.

| Layer | Treatment |
|---|---|
| Outer ring | Justice Gold, brushed-metal gradient (`goldLight → gold → goldDeep → goldLight`) |
| Interior halo | Truth Blue, 0.55% of crest width, glowing |
| Outer glow | Activism Red radial halo, cinematic falloff, sits *outside* the ring only |
| Field | Midnight Black with a soft radial lift, never flat black |
| Globe | Electric Blue core, gold landmasses, gold framing + dashed orbital ring |
| Hero | Dark suit, gold key rim-light on the leading contour, blue fill-light from the globe |
| Chest emblem | Gold JSA monogram with a blue energy bolt threaded through it |

### The energy flow

The composition is built as a circuit, read bottom-up:

```
blue globe core  ↓  blue energy stream  ↓  JSA chest emblem  ↓  hero
```

Truth powers justice. Justice powers action. Action creates change.

### The hero

A futuristic figure in a forward flight pose — head to the upper right, cape
streaming to the lower left. Roughly 7.5 heads tall: heroic, not comic-book.

The suit is **modern tactical armour**, not a smooth bodysuit. Every plate is
drawn four times — a dark gradient body, a vertical shade, a bevelled edge
that catches the key light from the upper left, and a gold trim line — so the
figure reads as machined metal rather than flat vector.

| Element | Treatment |
|---|---|
| Helmet | Angular shell, gold crown ridge, blue visor, red temple accent, respirator jaw, collar plate |
| Shoulders | Layered pauldrons with gold trim |
| Chest | Broad angular carapace, red pectoral accent, gold sternum line |
| Arms | Upper arm, elbow, forearm gauntlet with gold ribbing, red knuckle accent |
| Legs | Thigh, knee plate, shin, boot with red accent |
| Cape | Deep red, shadowed underside, gold seam on the leading edge, red rim light on the trailing edge |

Lighting model: **key** warm gold from the upper left, **fill** electric blue
from the lower right (bounce off the globe), **rim** activism red along the
trailing edge. The figure is separated from the field with a backlit halo so
it reads as a silhouette at 64 px.

### The chest emblem

J, S and A fused into one interlocking mark — and **engraved into the chest
plate**, not applied on top. The letters are cut into a recessed gold-framed
panel: dark inset, bevelled gold edges, and an electric-blue bolt threading
the negative space with a bright node at the crossing point.

It reads as armour detail at full size and as a standalone monogram when the
figure is cropped away.

### The globe

The globe is the power source, not decoration, and it sits **beneath the
hero** — the figure flies over it, so the globe's glowing core and gold
continents frame the lower body.

It is a real orthographic projection centred on the Americas (`lon0 -78`,
`lat0 18`), so North and South America are genuinely visible and correctly
positioned. Gold continents sit on an electric-blue luminous core inside a
gold frame with a dashed orbital ring.

**Global network energy lines wrap around the sphere**: projected latitude
bands plus four tilted great-circle arcs, with bright nodes scattered across
the lattice. Blue energy radiates upward from the core toward the hero.

---

## 2. Colour

| Token | Hex | Meaning |
|---|---|---|
| Midnight Black | `#0B0B0F` | Authority, strength, professionalism |
| Activism Red | `#E11937` | Action, courage, urgency |
| Justice Gold | `#D4AF37` | Leadership, integrity, achievement |
| Truth Blue | `#00AEEF` | Truth, transparency, intelligence, connectivity |

Supporting tones: gold-light `#F2DFA0`, gold-deep `#8A6D1F`, red-deep
`#8E0F24`, blue-light `#7FE0FF`.

**Ratio discipline.** Black and blue carry the field, gold carries structure,
red carries urgency and is never used for large fills.

**On backgrounds.** The crest is designed for black, red, dark blue and
transparent. On white, use `out/logo-crest-dark.svg` or the transparent
crest, never the gold ring at full strength.

---

## 3. Typography

| Face | Use |
|---|---|
| **Bebas Neue** | All display type — headlines, wordmark, lockups |
| **Montserrat** 700/800 | Kickers, labels, body, UI |

Both are embedded as base64 WOFF2 inside every SVG, so the files render
identically anywhere with no font install.

- Thumbnail headlines: Bebas Neue, all caps, max **4 words**
- Kicker / eyebrow: Montserrat 800, tracked out `0.18em`, gold or red
- Body and descriptions: Montserrat 700

---

## 4. Deliverables

### Channel
| File | Size | Use |
|---|---|---|
| `out/logo-crest.svg` | 1024² | Primary logo |
| `out/logo-crest-transparent.svg` | 1024² | Over photography |
| `out/logo-crest-dark.svg` | 1024² | On light backgrounds |
| `out/avatar-800.png` … `avatar-64.png` | 800→64 | YouTube profile picture |
| `out/icon-192.png`, `icon-512.png` | 192 / 512 | PWA / app icon |

### Banner (2560×1440)
`out/banner.svg` plus four variants: `banner-new-episode`, `banner-season-two`,
`banner-membership`, `banner-paper-trail`.

Layout: large crest on the **left**, negative space in the **centre**,
metallic-gold wordmark on the **right** with blue energy flowing beneath it.

> The wordmark and crest sit inside YouTube's safe area
> (**x 507–2053, y 423–1017**) so nothing is cropped on TVs, desktops or
> phones. Verify after any layout change with `node brand/src/safearea.js`.

### Video watermark
`out/watermark.svg` + `out/watermark-512.png` — transparent PNG.
Globe + emblem only. No hero, no text. Keep it between **6% and 10%** of
frame width so it stays legible over busy footage.

### Thumbnails (1280×720)
`out/thumb-*.svg` + PNG. Five ready-made examples:
EXPOSED · WHO PROFITS? · THEY LIED · ACCOUNTABILITY NOW · FOLLOW THE MONEY.

System rules: red 12 px border · gold corner accents · blue energy accents ·
JSA crest bottom-left with the wordmark · headline left-aligned at max 4
words, split across two lines automatically · the right third is deliberately
left clear for the presenter or footage still.

### End screen (1920×1080)
`out/end-screen.svg` + PNG. Crest centre, two video placeholders, subscribe
bar, handle. Dark and restrained — one accent colour only.

### Intro animation
`out/intro.svg` — a 4.6 s cinematic sequence in pure SMIL. Open it in any
browser; no JavaScript required.

| Time | Beat |
|---|---|
| 0.0 s | Black |
| 0.3 s | Blue globe energy forms |
| 0.9 s | Global network lights activate |
| 1.5 s | Blue energy rises into the JSA emblem |
| 2.1 s | Hero emerges |
| 2.8 s | Gold ring forms |
| 3.4 s | Red energy halo ignites |
| 4.0 s | Final logo lockup |

To export as frames, render the SVG in a browser and capture at 60 fps, then
assemble in any editor.

---

## 5. Rules

**Do**
- Keep the crest's proportions — the hero at ~80% of the disc, the globe
  beneath it, the emblem engraved on the chest
- Use the crest as a complete unit; never crop the gold ring
- Pair red with gold, or blue with gold. Never red-on-blue
- Keep headlines to four words or fewer
- Leave the right third of a thumbnail clear for the subject

**Don't**
- Don't add a wordmark to the crest — the primary logo is icon-only
- Don't recolour the emblem; gold structure + blue energy is the signature
- Don't stretch or rotate the crest
- Don't use the full-colour crest on a light background
- Don't crowd the banner outside the safe area
- Don't put text under the emblem at small sizes

---

## 6. Personality

**Truth · Justice · Accountability · Civic Engagement · Activism ·
Leadership · Transparency · Global Awareness**

A superhero-themed civic engagement organisation operating as a modern
digital media company.

Not children's content. Not comic-book parody. Not a cartoon channel.
Not a gaming brand.
