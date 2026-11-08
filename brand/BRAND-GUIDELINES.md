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

Layout, inside the safe band:

| Zone | Content |
|---|---|
| **Left** | The JSA crest, 404 px, vertically centred in the band |
| **Centre** | Clean negative space — the energy currents and network lattice run through it, but no type |
| **Right** | `JUSTICE SOCIETY OF ACTIVISM` in metallic-gold Bebas Neue, two lines, with the blue energy stream and gold rule beneath, and the descriptor below that |

Background: Midnight Black base, deep-red atmospheric bloom, electric-blue
energy currents, drifting gold particles, and a faint global-network lattice —
a wireframe globe with connected nodes — sitting behind the composition.

> **Safe area.** The region that survives every YouTube crop is the
> **1546 × 423 rectangle centred in the canvas: x 507–2053, y 509–932.**
> The wordmark and crest are placed to sit entirely inside it.
>
> This is enforced, not assumed. `node brand/src/safearea.js` renders a
> layout probe of each banner and measures the real pixel bounding box of the
> crest, the wordmark, the rule and the descriptor against that rectangle.
> Type is auto-fitted by measuring live font metrics in a browser:
> `node brand/src/fit.js`.

### Video watermark
`out/watermark.svg` + `out/watermark-512.png` — transparent PNG.
`out/watermark-preview.png` shows it composited over bright, mid and dark
footage at the lower-right corner.

Minimalist by design — exactly three elements:

| Element | Treatment |
|---|---|
| **JSA emblem** | Dominant. Gold monogram, the identifying mark |
| **Globe** | Small, up and to the left of the emblem. Electric-blue luminous core, gold continents, crisp rim light, specular highlight |
| **Red energy glow** | A tight halo behind the emblem — subtle, not a wash |

No hero. No text. No border or ring of any kind.

**Placement.** Lower-right corner, `right: 22px; bottom: 20px`, at
**6–10% of frame width** (about 112 px on a 1920-wide video). Keep it clear of
the YouTube progress bar and the channel watermark slot.

**Legibility over any footage.** The emblem carries a tight dark contour
(feMorphology dilate + blur, 88% black) hugging the letterforms, plus a gold
bloom. The contour is what makes it hold up over bright footage; the bloom is
what makes it hold up over dark footage. Neither is a decorative border —
they hug the ink.

Measured contrast of the mark against its own contour: **2.8 : 1** on bright
footage, **23 : 1** on dark.

### Thumbnail system (1280×720)

`out/thumb-template.svg` — the blank template, with the subject dropzone
labelled and the headline reserved.

`out/thumb-<headline>.svg` — one template per reserved headline:
**EXPOSED · WHO PROFITS · FOLLOW THE MONEY · THEY LIED · WATCH THIS ·
ACCOUNTABILITY NOW**

`out/thumb-contact-sheet.png` — all six stacked with their headlines labelled.

#### Layout

| Zone | Position | Purpose |
|---|---|---|
| Subject image area | right, x 700–1252 | The dropzone. A portrait subject reading left into the headline |
| Title area | left, x 58–700 | Kicker, headline, accent rule, optional sub-line |
| Logo | lower left | JSA crest + wordmark |
| Frame | 14 px inset | Red border with gold corner accents |
| Energy | between title and subject | Electric-blue arc separating the two zones |

The subject area accepts a real image (`subject:` option, data URI or path).
With no image it renders as a self-documenting placeholder: hatched fill, gold
corner brackets, a rim-lit figure silhouette and a `SUBJECT IMAGE` label.

#### Typography

Headlines are set in Bebas Neue, all caps, on a dark scrim so they hold
against any footage. The headline is **auto-fitted to the title column** using
the real font metrics in `src/font-metrics.js`, so a 14-character word like
`ACCOUNTABILITY` can never spill over the subject.

| Headline | Fitted size | Lines |
|---|---|---|
| EXPOSED | 150 px | 1 |
| WHO PROFITS | 140 px | 2 |
| FOLLOW THE MONEY | 116 px | 2 |
| THEY LIED | 140 px | 2 |
| WATCH THIS | 140 px | 2 |
| ACCOUNTABILITY NOW | 82 px | 2 |

Breaking rules: one word sets on one huge line; two words stack one per
line; three or more split into two balanced lines.

#### CTR notes

- Red frame + gold corners give the thumbnail a hard edge against YouTube's
  white page background — it reads as a broadcast graphic, not a video still.
- The kicker is Montserrat 800 in gold or red, tracked out, with a colour
  block — it signals category before the viewer reads the headline.
- The blue energy arc separates the words from the face, so the subject never
  fights the type.
- The bottom-right third is kept clear of text: on YouTube that is where the
  runtime badge lands, and covering it costs clicks.

### End screen (1920×1080)
`out/end-screen.svg` + PNG. Crest centre, two video placeholders, subscribe
bar, handle. Dark and restrained — one accent colour only.

### Intro animation — 5.0 s, nine scenes

| File | Use |
|---|---|
| `out/intro.svg` | Master. Pure SMIL — opens and plays in any browser, no JavaScript |
| `out/intro-preview.html` | Full-screen preview with replay/pause and the scene list |
| `out/intro-1920x1080.mp4` | H.264 MP4, 25 fps — ready to upload |
| `out/frames/` | PNG frame sequence for re-timing or re-cutting (generated, not tracked in git) |

| Scene | Time | Beat |
|---|---|---|
| 1 | 0.00–0.45 s | Dark screen, drifting dust |
| 2 | 0.45–1.15 s | A small electric-blue globe forms |
| 3 | 1.15–1.80 s | Global network connections illuminate across the globe |
| 4 | 1.80–2.35 s | Blue energy rises upward from the globe |
| 5 | 2.35–2.95 s | A metallic JSA emblem forms out of the energy |
| 6 | 2.95–3.55 s | A superhero flies through frame, with motion trails |
| 7 | 3.55–4.05 s | A metallic gold ring forms around the hero |
| 8 | 4.05–4.50 s | The red energy halo ignites |
| 9 | 4.50–5.00 s | The final hero-and-globe crest locks up |

**The geometry comes from `src/crest-layout.js`** — the same module the logo
uses — so the animation lands on exactly the finished composition rather than
an approximation of it.

**The emblem does double duty.** It forms large out of the rising energy in
scene 5, then shrinks onto the hero's chest as the hero lands in scene 6, and
holds there for the lockup — so the beat the viewer watches is the same mark
that ends up on the crest.

To rebuild the frames and the MP4:

```bash
node brand/src/intro-frames.js 25 1.0     # 125 PNG frames at 1920x1080
ffmpeg -y -framerate 25 -i brand/out/frames/frame-%04d.png \
  -c:v libx264 -pix_fmt yuv420p -crf 16 -preset slow \
  -movflags +faststart brand/out/intro-1920x1080.mp4
```

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
